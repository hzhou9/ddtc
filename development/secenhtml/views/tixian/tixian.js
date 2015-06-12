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
            list:'[name=list]'
            ,row:'.template [name=row]'
            ,row1:'.template [name=row1]'
            ,nonerow:'.template [name=nonerow]'
            ,bt_jiaoyi:'[name=bt_jiaoyi]'
            ,info:{
                panel:'[name=infopanel]'
                ,make:'[name=make]'
            }
            ,btaction:'[name=btaction]'
            ,nowmoney:'[name=nowmoney]'
            ,totalmoney:'[name=totalmoney]'
            ,totaltimes:'[name=totaltimes]'
            ,remainSum:'[name=remainSum]'
            ,upfront:'[name=upfront]'
            ,spanUpfront:'[name=spanUpfront]'
        }
        ,iscroll:null
        ,cachedata:null
        ,init:function(context){
            if (!this.isInit){
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            this.c_init();
        }
        ,c_init:function(){
            var me = this;
            this.m_getdata(function(data){
               me.c_fill(data);
               me.cachedata = data.drawCache;
            });
        }
        ,c_showInfo:function(){
//            this.dom.info.panel.show();
            var me = this;
            /**
            utils.sys.loadpage('views/', 'tixianop', null, '提现清单',function(v){
                v.obj.setMaxmoney(me.dom.remainSum.html());
                v.obj.onclose = function(){
                    me.c_init();
                }
            });
             */
            var viewmanager = requirejs('view');
            viewmanager.viewroot('views/');
            var viewname = 'tixianop';
            var context = $('#tixianop_pagecontaion');
            var view = viewmanager.loadview(viewname,function(v){
                var page = context.find('>.page');
                page.empty();
                v.renderer(page);
                context.show();
                v.obj.setMaxmoney(me.dom.remainSum.html());
                v.obj.onclose = function(){
                    me.c_init();
                }
                setTimeout(function(){v.obj.setCacheData(me.cachedata);});
            });
        }
        ,r_init:function(){
            var me = this;
            this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});

            this.dom.btaction.aclick(function(){
                me.c_showInfo();
            });
            this.dom.info.make.aclick(function(){
               me.dom.info.panel.hide();
            });
            this.dom.bt_jiaoyi.aclick(function(){
                utils.sys.loadpage('views/', 'jiaoyi', null, '业务清单（所有）',function(v){
                    v.obj.setLastweek(0);
                });
            });
        }
        ,c_fill:function(data){
            var me = this;
            /**
             * data:{
                  remainSum(总可提现金额)：1500
                  todaysum(今日收益):100
                  sum(总累计收益):2000
                 dealNum(总交易次数):10
                  drawLists(提现历史列表)：[
                     [acountname账户名，bankname开户行，account账号，optname操作人，opttime提现时间，money提现金额，state状态0-申请中1-已提现]
                   ]
             }

             */
            this.dom.nowmoney.html(data.todaysum);
            this.dom.totalmoney.html(data.sum);
            this.dom.totaltimes.html(data.dealNum);
            this.dom.remainSum.html(data.remainSum);
            if(data.upfront > 0)
            {
                this.dom.upfront.html(data.upfront);
                this.dom.spanUpfront.show();
            }
       


            var datas = data.drawLists;
            this.dom.list.empty();
            if(datas){
                for(var i=0;i<datas.length;i++){
                    var row = null;
                    var data = datas[i];
                    if('1' == data.visitype+''){
                        row = this.c_getrow1(data);
                    }else{
                        row = this.c_getrow(data);
                    }
                    this.dom.list.append(row);
                }
            }
            if(!datas || datas.length == 0){
                var row = this.c_getnonerow();
                this.dom.list.append(row);
            }
            setTimeout(function(){
                me.iscroll && me.iscroll.refresh();
            });
        }
        ,c_getrow:function(data){
            //[accountname账户名，bankname开户行，account账号，optname操作人，opttime提现时间，money提现金额，state状态0-申请中1-已提现]
            var row = this.dom.row.clone();
            row.find('[name=accountname]').html(data.accountname);
            row.find('[name=bankname]').html(data.bankname);
            row.find('[name=account]').html(data.account);
            row.find('[name=optname]').html(data.optname);
            row.find('[name=opttime]').html(data.opttime);
            row.find('[name=money]').html(data.money);

            row.find('[name=state1]').hide();
            row.find('[name=state0]').hide();
            if(1 == data.state){
                row.find('[name=state1]').show();
            }
            if(0 == data.state){
                row.find('[name=state0]').show();
            }
            return row;
        }
        ,c_getrow1:function(data){
            //[accountname账户名，bankname开户行，account账号，optname操作人，opttime提现时间，money提现金额，state状态0-申请中1-已提现]
            var row = this.dom.row1.clone();
            row.find('[name=name]').html(data.name);
            row.find('[name=phone]').html(data.telephone);
            row.find('[name=opttime]').html(data.opttime);
            row.find('[name=money]').html(data.money);

            row.find('[name=state1]').hide();
            row.find('[name=state0]').hide();
            if(1 == data.state){
                row.find('[name=state1]').show();
            }
            if(0 == data.state){
                row.find('[name=state0]').show();
            }
            return row;
        }
        ,c_getnonerow:function(){
            var row = this.dom.nonerow.clone();
            return row;
        }
        ,m_getdata:function(fn){
            ajax.userget('index','getMoneyBase',null, function(result){
                var data = result.data;
                fn && fn(data);
            });
        }
        ,m_getdata1:function(fn){
            fn && fn([]);
        }
        ,close:function(){
            this.onclose && this.onclose();
        }
    };

        return ui;
    }
});