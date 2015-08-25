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
            kucun:{
                panel:'[name=kucunpanel]'

            }
            ,jifen:{
                panel:'[name=jifenpanel]'
                ,btaction:'[name=jifenpanel] [name=btaction]'
            }
            ,tixian:{
                panel:'[name=tixianpanel]'
                ,btaction:'[name=tixianpanel] [name=btaction]'
            }
            ,jiaoyi:{
                panel:'[name=jiaoyipanel]'
                ,btaction:'[name=jiaoyipanel] [name=btaction]'
            }
            ,btquit:'[name=btquit]'
            ,bttestpushid:'[name=bttestpushid]'
            ,bttestrefresh:'[name=bttestrefresh]'
            ,fullname:'[name=fullname]'
            ,park_list:'#park_list'
            ,info:{
                todaynum:'[name=todaynum]'
                ,totalnum:'[name=totalnum]'
                ,remainSum:'[name=remainSum]'
                ,score:'[name=score]'
                ,todaysum:'[name=todaysum]'
                ,manager_in:'[name=manager_in]'
            }
            ,permissionDom:'[p]'
            ,rewardinfo:{
                rewardline:'[name=rewardline]'
                ,rewardline_deatil:'[name=rewardline]>div'
                ,rewardinfopanel:'[name=rewardinfopanel]'
                ,rewardinfopanel_close:'[name=rewardinfopanel] .mui-icon-close'

            }
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
            //给自己一个全局变量引用,给予外部操作当前ui的机会，（todo:以后考虑使用事件机制）
            window.UserManager = this;

            var me = this;

            //this.c_setKucun(3);
//            utils.sys.checkLogin(function(islogin){
//               if(islogin){
//                   //alert('有登录信息')
//                   var userinfo = ajax.userinfo();
//                  me.dom.fullname.html(userinfo.fullname);
//               }else{
//                   me.c_login();
//               }
//               $('#startpage').hide();
//           });
            me.c_login();
        }
        ,c_login:function(isquit){
            var me = this;
            utils.sys.nologin(function(view){
                if(!!isquit){
                    view.obj.clearInfo();
                }
                view.obj.onclose = function(){
                   me.c_initinfo();
                   me.dom.fullname.html(ajax.parkname());
                   me.context.css('visibility','hide');

                    if (ajax.allparks().length > 1) {
                        var list = me.dom.park_list.find('ul');
                        $(ajax.allparks()).each(function(index,park){
                            var item = '<li class="mui-table-view-cell" data-index="' + index + '"><h4>' + park.fullname + '</h4></li>';
                            list.prepend(item);
                        });
                        me.dom.park_list.on('click', 'li', function() {
                            var idx = $(this).data('index');
                            if (null != idx) {
                                ajax.setParkIdx(idx);
                                location.reload();
                            }
                            $('#park_list,#park_list-bg').hide();
                        });
                        me.dom.park_list.offset({top:$(document).height() - $('#park_list').height()});
                        $('#park_switch').show();
                    }
               }
            });
        }
        ,c_initinfo:function(fn){
            var me = this;
            //setTimeout(function(){
                me.m_baseinfo(function(data){
                    /**
                     * at: 5deals: 1in: 0name: "张三"out: 1parkstate: "1"remainsum: 50score: 400todaysum: 0
                     */

                    //alert(JSON.stringify(data));

                    me.dom.kucun.panel.find('>*').removeClass('mui-active');
                    me.dom.kucun.panel.find('[type={0}]'.replace('{0}',data.parkstate)).addClass('mui-active');
                              
                    me.dom.info.todaynum.html(data.n);
                    me.dom.info.totalnum.html(data.tn);
                              
                    me.dom.info.remainSum.html(data.remainsum);
                    me.dom.info.score.html(data.score);
                    me.dom.info.todaysum.html(data.todaysum);
                    me.dom.info.manager_in.html(data.in);

                    //设置公告
                    //acendtime: "2015-05-15"acscore: "500"actype: "1"
                    var rewardinfo = {
                        '1':{'txt':'每单补贴5元！截止{end}','p':"2"},
                        '2':{'txt':'每单补贴5元！截止{end}','p':"1"}
                    }
                    var info = rewardinfo[data.actype];
                    if(info){
                        me.dom.rewardinfo.rewardline.find('span').html(info.txt.replace('{end}',data.acendtime));
                        if(new Date(data.acendtime) - new Date() > 0){
                        		me.dom.rewardinfo.rewardline.attr("p",info.p);
                            me.dom.rewardinfo.rewardline.removeClass('hide');

                            me.dom.rewardinfo.rewardline_deatil.unbind().aclick(function(){
                                utils.sys.loadpage('views/', 'gonggao', null, '活动公告',function(v){
                                    v.obj.setarg(data.actype,data.acscore,data.acendtime);
                                });
                            });


                        }else{
                            me.dom.rewardinfo.rewardline.addClass('hide');
                        }
                    }else{
                        me.dom.rewardinfo.rewardline.addClass('hide');
                    }

                    me.dom.btquit.html('管理员:{0}<span style="display: inline-block;padding-left: 40px">退出</span>'.replace('{0}', data.name));

										me.c_setPermission();

                    fn && fn(data);

                });
            //});

        }
        ,c_setKucun:function(type, nofalse){     //设置库存
            var me = this;
            this.m_setKucun(type, function(){
                me.dom.kucun.panel.find('>*').removeClass('mui-active');
                me.dom.kucun.panel.find('[type={0}]'.replace('{0}',type)).addClass('mui-active');
            });

        }
        ,c_willSetkuncun:function(type){
            var info = {
                '0':'请确认停车位已满?<br><span>系统将不再接受停车订单</span>'
                ,'1':'请确认有(1-10)个空车位?'
                ,'2':'请确认有空车位大于10个'
            }
            var me = this;

            utils.sys.confirm(info[type], function(){
                me.c_setKucun(type);
            });
        }
        ,r_init:function(){
            var me = this;

            //var scrollheight = $('.userpage').parent().height();
            //var contentheight = me.dom.scrollparent.height();
            //if (contentheight > scrollheight) {
            //    me.dom.scrollparent.css('height', scrollheight + 'px');
            //    me.iscroll = new iScroll(me.context[0], {desktopCompatibility: true});
            //}

            this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true,onScrollMove:function(m){
                    //console.log('iscroll move',m);
                }
                }
            );

            this.dom.kucun.panel.find('>*').aclick(function(){
                var that = $(this);
                if(!that.hasClass('mui-active')){
                    me.c_willSetkuncun(that.attr('type'));
                }
            });

            this.dom.jifen.btaction.click(function(){
                utils.sys.loadpage('views/', 'jifen', null, '积分兑换',function(v){
                    v.obj.onclose = function(){
                        me.c_refreshInfo();
                    }
                });
            });
            this.dom.tixian.btaction.click(function(){
                utils.sys.loadpage('views/', 'tixian', null, '资金统计',function(v){
                    v.obj.onclose = function(){
                        me.c_refreshInfo();
                    }
                });
            });

            this.dom.jiaoyi.btaction.click(function(){
                if (ajax.permission() & 2 && ajax.parktype() == 2) {
                    me.c_viewsecenat();
                } else {
                    me.c_viewjiaoyi();
                }
            });
            this.dom.btquit.click(function(){
                me.c_quit();
            });
            this.dom.bttestpushid.click(function(){
                me.c_bttestpushid();
            });
            this.dom.bttestrefresh.click(function(){
                me.c_initinfo(function(data){
                    alert(JSON.stringify(data));
                });
            });

            this.dom.rewardinfo.rewardinfopanel_close.aclick(function(){
               me.dom.rewardinfo.rewardinfopanel.hide();
            });
        }
       ,c_viewjiaoyi:function(){
       //console.log('c_viewjiaoyi');
       var me=this;
                    utils.sys.loadpage('views/', 'jiaoyi', null, '业务清单（一周内）',function(v){
                        v.obj.onclose = function(){
                          me.c_refreshInfo();
                        }
                    });
       }
        , c_viewsecenat:function() {
            //console.log('c_viewsecenat');
            var me=this;
            utils.sys.loadpage('views/', 'secen_at', null, '业务清单（一周内）',function(v){
                v.obj.onclose = function(){
                    me.c_refreshInfo();
                }
            });
        }
        ,View:{
            secen_in:null
            ,secen_out:null
        }
        ,c_setPermission:function(){        //设置权限显示
            this.dom.permissionDom.hide();
            var permission = parseInt(ajax.permission());
            this.dom.permissionDom.each(function(){
               var pstring = $(this).attr('p') || '';
                var ps = pstring.split(',');
                for(var i=0;i<ps.length;i++){
                    var p = parseInt(ps[i]);
                    if(permission & p){
                        $(this).show();
                        break;
                    }
                }
            });
            
            this.context.css('visibility','visible');

        }
        ,c_refreshInfo:function(){
            this.c_initinfo();
        }
        ,c_bttestpushid:function(fn){
            var pushid = 'kk3k2005';
            ajax.userget('index','setPushId',{pushid:pushid}, function(result){
                var data = result.data;
                fn && fn(data);
            });
        }
        ,m_setKucun:function(type, fn){
            ajax.userget('index','setParkState',{state:type}, function(result){
                var data = result.data;
                fn && fn(data);
            });
        }
        ,m_baseinfo:function(fn){
            ajax.userget('index','getBaseInfo',null, function(result){
                var data = result.data;
                fn && fn(data);
            });
        }
        ,c_quit:function(){
            var me = this;
            utils.sys.confirm('确认退出当前账户?', function(){
                utils.sys.quitlogin(function(){
                   me.c_login(true);
                });
            });

//            if(window.confirm('确认退出当前账户?')){
//
//                utils.sys.quitlogin(function(){
//                   me.c_login(true);
//                });
//            }
        }
        ,close:function(){

        }
    };

        return ui;
    }
});