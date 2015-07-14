/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_reg(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            userpanel_phone:'[name=userpanel_phone]'
            ,userpanel_chepai:'[name=userpanel_chepai]'
            ,btarea:'[name=btarea]'
            ,btreg:'[name=btreg]'
        }
        ,iscroll:null
        ,ishead:false       //是否带了一个导航栏
        ,init:function(context){
            if (!this.isInit){
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            this.c_init();
        }
        ,isHead:function(_ishead){
            this.ishead = !!_ishead;
        }
        ,c_init:function(){
            var me = this;

//            var type = utils.tools.getUrlParam('type') || '1';
//            if(2 != type){
//                var openid = utils.tools.getUrlParam('openid');
//                if(openid){
//                    var me = this;
//                    sysmanager.login('','',function(){
//                        me.c_quit();
//                    });
//                }
//            }
        }
        ,c_checkLogin:function(){
            sysmanager.checkLogin(function(islogin){
                if(islogin){
                    sysmanager.alert('已经登陆');
                }else{
                    sysmanager.alert('没有登陆');
                }
            });
        }
        ,c_reg:function(){
            var me = this;
            var phone = this.dom.userpanel_phone.val();
            var chepai = this.dom.btarea.text() + this.dom.userpanel_chepai.val();
            this.dom.userpanel_phone.blur();
            this.dom.userpanel_chepai.blur();
            if('' == phone){
                sysmanager.alert('手机号不能为空!');
            }else if(!(/^1[3|4|5|7|8][0-9]\d{8}$/.test(phone))){
            		sysmanager.alert('请输入正确的手机号!');
            }else{
                sysmanager.login(phone,chepai,function(){
                    me.c_quit();
                });
            }
        }
        ,c_reg_openid:function(){
            var me = this;
            var phone = this.dom.userpanel_phone.val();
            var chepai = this.dom.btarea.text() + this.dom.userpanel_chepai.val();
            var openid =  utils.tools.getUrlParam('openid');
            this.dom.userpanel_phone.blur();
            this.dom.userpanel_chepai.blur();
            if('' == phone){
                sysmanager.alert('手机号不能为空!');
            }else{
                sysmanager.login(phone,chepai,function(){
                    me.c_quit();
                });
            }
        }
        ,c_quit:function(){
            if(!this.ishead){
                var me = this;
                var c = me.context.parent().parent();
                sysmanager.pagecontainerManager.hide(c);
                me.close();
            }else{
                $('#topheardpagecontainer [name=btupclose]').click();
            }
        }
        ,c_showInfo:function(){
            this.dom.info.panel.show();
        }
        ,r_init:function(){
            var me = this;
            var type = utils.tools.getUrlParam('type') || 1;
            this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});

            me.dom.btarea.aclick(function(){
                sysmanager.areaKeyboardUI(function(selarea){
                    me.dom.btarea.text(selarea);
                    me.dom.userpanel_chepai.focus();
                });
            });
            me.dom.btreg.aclick(function(){
                me.c_reg();
            });

        }
        ,close:function(){
            this.onclose && this.onclose();
        }
    };
    return  ui;
}
