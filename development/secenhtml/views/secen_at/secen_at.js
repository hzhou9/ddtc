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
            ,row_none:'.template [name=row_none]'
            ,score:'.template [name=score]'
            ,list:'[name=list]'
            ,btrefresh:'[name=btrefresh]'
        }
        ,iscroll:null
        ,init:function(context){
            if (!this.isInit) {
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            this.c_init();
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
            this.dom.btrefresh.aclick(function(){
                me.c_refresh();
            });
        }
        ,c_refresh:function(){
            this.c_init();
        }
        ,c_fill:function(datas){
            var me = this;
            this.dom.score.html(datas.score);
            this.dom.list.empty();
            var leaveList = [];
            for(var i=0;i<datas.length;i++){
                var data = datas[i];
                var row = this.c_getrow(data);
                if (data.s == "3") {
                    leaveList.push(row);
                } else {
                    this.dom.list.append(row);
                }
            }
            for (var i = 0; i < leaveList.length; i++) {
                this.dom.list.append(leaveList[i]);
            }
            if(0 == datas.length){
                this.dom.list.append(this.c_getrow_none());
            }
            setTimeout(function(){
                me.iscroll && me.iscroll.refresh();
            });
        }
        ,c_getrow:function(data){
            var me = this;
            var row = this.dom.row.clone();
            row.find('[name=cardid]').html(data.carid).end().find('[name=time]').html(data.startime)
                .end().find('[name=btaction]').attr('href','tel:'+data.telephone)
                .end().find('[name=btoutaction]').aclick(function(){
                    me.c_setLeave(data.oid, row);
                });
            if (data.s == "3") {
                row.find('[name=btoutaction]').remove();
            }
            return  row;
        }
        ,c_setLeave:function(oid, row){
            var me = this;
            utils.sys.confirm("确认车辆［{0}］离场？".replace('{0}',row.find('.title').html()), function(){
                me.m_setLeave(oid,function(){
                    var nRow = row.clone();
                    nRow.find('[name=btoutaction]').remove();
                    row.remove();
                    me.dom.list.append(nRow);
                });
            });
        }
        ,m_setLeave:function(oid, fn){
            ajax.userget('index','setLeave',{oid:oid}, function(result){
                var data = result.data;
                fn && fn(data);

            });
        }
        ,c_getrow_none:function(){
            var row = this.dom.row_none.clone();
            return row;
        }
        ,m_getdata:function(fn){
            ajax.userget('index','getDeals',{'lastweek':1, 'all':1}, function(result){
                /**
                 * data:［{"oid":"1","carid":"11111","orderTime":"1970-01-01 08:00:00"}
                 */
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