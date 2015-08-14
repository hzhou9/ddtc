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
                btlogin:'[name=btlogin]'
              ,btreg:'[name=btreg]'
              ,loginpanel:{
                  panel:'[name=loginpanel]'
                  ,parkname:'[name=loginpanel] [name=userpanel_parkname]'
                  ,name:'[name=loginpanel] [name=userpanel_name]'
                  ,pwd:'[name=loginpanel] [name=userpanel_password]'
                  ,btlogin:'[name=loginpanel] [name=btlogin]'
              }
            ,slider:'[name=slider]'
            ,logininfo:'[name=logininfo]'
            ,logininfopanel:{
                name:'[name=logininfo] [name=name]'
                ,type:'[name=logininfo] [name=type]'
                ,status:'[name=logininfo] [name=status]'
                ,PushID:'[name=logininfo] [name=PushID]'
                ,btquit:'[name=logininfo] [name=btquit]'
            }

        }
        ,tabs:null
        ,loginpanel:null
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
            var tabs = this.tabs = utils.jq.initTab(this.context.find('[name=sliderSegmentedControl]>div'),this.context.find('[name=cards]>div'),'  mui-active');
            tabs.activeHandle[0] = function(){

            }
            tabs.activeHandle[1] = function(){

            }
            this.loginpanel = {
                  start:function(){

                  }
                ,login:function(){
                        me.c_login();

                  }
              }
            this.c_check();
        }
        ,c_login:function(){
            var me = this;
            var parkname = me.dom.loginpanel.parkname.val();
              var name = me.dom.loginpanel.name.val();
              var password = me.dom.loginpanel.pwd.val();
//                    me.m_test(email,function(){
//                        utils.sys.login(email, password, function(data){
//                              me.dom.loginpanel.pwd.val('');
//                              me.c_showUserinfo(data);
//                          });
//                    });

            utils.sys.login(parkname,name,password, function(userinfo){
                //console.log('userinfo',userinfo);
                var c = me.context.parent().parent();
                utils.sys.pagecontainerManager.hide(c);
                me.close();
            });

        }
        ,c_check:function(){
            var me = this;
            this.c_showUserinfo(null);

            var dudu_secen_logininfo = this.getInfo();
            if(dudu_secen_logininfo){
                me.dom.loginpanel.parkname.val(dudu_secen_logininfo.parkname);
                me.dom.loginpanel.name.val(dudu_secen_logininfo.name);
                me.dom.loginpanel.pwd.val(dudu_secen_logininfo.pwd);
                if(dudu_secen_logininfo.pwd){
                    setTimeout(function(){
                        me.loginpanel.login();
                    });
                }
            }


        }
        ,c_showUserinfo:function(data){
            var me = this;
            this.dom.slider.hide();
            this.dom.logininfo.hide();
            if(!data){
                me.dom.slider.show();
            }else{
                me.dom.logininfo.show();
                me.dom.logininfopanel.name.html(data.name);
                me.dom.logininfopanel.type.html(['主管理员','管理员','推广员'][data.type]);
                me.dom.logininfopanel.status.html(['冻结','正常'][data.status]);
                me.dom.logininfopanel.PushID.html(utils.sys.PushID() || '没有收到PushID')
            }
        }
        ,r_init:function(){
            var me = this;
            this.dom.loginpanel.btlogin.click(function(){
                me.loginpanel.login();
            });
            this.dom.logininfopanel.btquit.aclick(function(){
                utils.sys.quitlogin(function(){
                    me.c_check();
                });
            });
        }
        ,m_test:function(username, fn){
            ajax.get('Index','test',{username:username}, function(result){
                //console.log('test', result);
                fn && fn();
            });
        }
        ,infokey:'dudu_secen_logininfo'
        ,setInfo:function(){
            var me = this;
            var parkname = me.dom.loginpanel.parkname.val();
            var name = me.dom.loginpanel.name.val();
            var pwd = me.dom.loginpanel.pwd.val();
            var dudu_secen_logininfo = {
                parkname:parkname
                ,name:name
                ,pwd:pwd
            }
            localStorage.setItem(this.infokey, JSON.stringify(dudu_secen_logininfo));
        }
        ,getInfo:function(){
            var dudu_secen_logininfo_string  =  localStorage.getItem(this.infokey);
            var dudu_secen_logininfo = null;
            try{
                dudu_secen_logininfo = JSON.parse(dudu_secen_logininfo_string);
                return dudu_secen_logininfo;
            }catch(e){

            }
            return dudu_secen_logininfo;
        }
        ,clearInfo:function(){
            var dudu_secen_logininfo = this.getInfo();
            if(dudu_secen_logininfo){
                dudu_secen_logininfo = {
                    parkname:dudu_secen_logininfo.parkname
                    ,name:dudu_secen_logininfo.name
                }
                localStorage.setItem(this.infokey, JSON.stringify(dudu_secen_logininfo));
            }
        }
        ,close:function(){
            setTimeout(function(){
                window.PushManager.fire('pushid');          //主动触发pushid推送事件
            });
            setTimeout(function(){
                window.PushManager.fire('pushmsg');         //主动触发pushmsg推送事件
            },1e3);
            this.onclose && this.onclose();
            this.setInfo();
        }
    };

        return ui;
    }
});