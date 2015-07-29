/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 14-9-10
 * Time: 下午11:59
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'utils', 'ajax'],function($, utils, ajax){
    return function(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            row:'.template [name=row]'
            ,nonerow:'.template [name=nonerow]'
            ,list:'[name=list]'
        }
        ,iscroll:null
        ,lastWeek:1
        ,init:function(context){
            if (!this.isInit) {
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            this.c_init();
        }
        ,setLastweek:function(val){
            this.lastWeek = val;
        }
        ,c_init:function(){
            var me = this;
            this.m_getdata(function(datas){
                me.c_fill(datas);
            });
        }
        ,r_init:function(){
            var me = this;
            this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});
        }
        ,c_fill:function(datas){
            var me = this;
            this.dom.list.empty();
            if(datas){
                for(var i=0;i<datas.length;i++){
                    var data = datas[i];
                    var row = this.c_getrow(data);
                    this.dom.list.append(row);
                }
            }
            if(!datas || datas.length==0){
                var row = this.c_getnonerow();
                this.dom.list.append(row);
            }
            setTimeout(function(){
                me.iscroll && me.iscroll.refresh();
            });
        }
        ,c_getrow:function(data){
       var me = this;
            var row = this.dom.row.clone();
            row.find('[name=pai]').html(data.carid).end().find('[name=start]').html(data.startime)
                .end().find('[name=tel]').attr("href",'tel:'+data.tel)
                .end().find('[name=admin]').html(data.admin)
                .end().find('[name=money]').html(data.money);
       
       if(data.s < 1){
        //未入库
       row.find('[name=title_order]').hide();
       row.find('[name=btaction1]').hide();
       row.find('[name=btaction2]').aclick(function(){//入库操作
          me.c_setIn(data.oid, row);
                                           });
       }else{
        row.find('[name=title_new]').hide();
        row.find('[name=newcar]').hide();
        row.find('[name=btaction2]').hide();
        row.find('[name=btaction1]').aclick(function(){//计算停车费
        ajax.userget('index','calDeal',{oid:data.oid}, function(result){
            var parktime = utils.tools.t2s(new Date - Date.parse(data.startime.replace(/-/g, "/")));
            var totalsum = result.data.p;
            var title = '<label>还需支付：</label><b>'+(totalsum > data.money?parseInt((totalsum - data.money)*100)/100:0)+'</b>元';
            var content = '<p><label>开始计费：</label><span>'+data.startime+'</span></p><p><label>停放时间：</label><span>'+parktime+'</span></p><p><label>总计金额：</label><span>'+totalsum+'</span>元</p><p><label>已付金额：</label><span>'+data.money+'</span></p>';
            utils.sys.alert(title, content);
        });
                                       });
       }
            return  row;
        }
       ,c_setIn:function(oid, row){
       var me = this;
       utils.sys.confirm("确认车辆［{0}］入场？".replace('{0}',row.find('[name=pai]').html()), function(){
                         me.m_setIn(oid,function(){
                                    me.c_init();
                                    });
                         });
       }
       ,m_setIn:function(oid, fn){
       ajax.userget('index','setEntry',{oid:oid}, function(result){
                    var data = result.data;
                    fn && fn(data);
                    
                    });
       }
        ,c_getnonerow:function(){
            var row = this.dom.nonerow.clone();
            return row;
        }
        ,m_getdata:function(fn){
       ajax.userget('index','getDeals',{lastweek:this.lastWeek,all:1}, function(result){
                var data = result.data;
                fn && fn(data);
            });
        }
        ,close:function(){
            this.onclose && this.onclose();
        }
    };

        return ui;
    }
});