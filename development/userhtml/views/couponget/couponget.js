/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_couponget(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            code_test:'[name=code_test]'
            ,bttest:'[name=bttest]'
            ,zhiwenimg:'[name=zhiwenimg]'
            ,infopanel:{
                panel:'[name=panel_info]'
                ,btget:'[name=panel_info] [name=btget]'
								,info:'[name=panel_info] [name=money]'
                ,row0:'[name=panel_info] [name=row0]'
                ,row1:'[name=panel_info] [name=row1]'
                ,quan0:'[name=panel_info] [name=quan0]'
            }
            ,resultpanel:{
                panel:'[name=panel_result]'
                ,info:'[name=panel_result] [name=money]'
                ,row0:'[name=panel_result] [name=row0]'
                ,row1:'[name=panel_result] [name=row1]'
            }
            ,nonepanel:{
                panel:'[name=panel_none]'
                ,info:'[name=panel_none] [name=info]'
            }
        }
        ,iscroll:null
        ,info:null
        ,showquit:false
        ,code:null      //红包编号
        ,fromid:null        //推广员编号  默认0
        ,init:function(context){
            if (!this.isInit){
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            if(this.showquit){
                this.dom.btquit.show();
            }
            this.c_init();

        }
        ,setCode:function(_code, fromid){
            this.code = _code;
            this.fromid = fromid || '0';
        }
        ,c_init:function(){
            var me = this;
            this.dom.code_test.html(this.code);
            this.m_checkcoupon(this.code,this.fromid, function(result){
                me.c_fillcheckinfo(result);
            });
        }

        ,c_fillcheckinfo:function(result){        //显示检查信息
            if(0 == result.code){
                this.c_showInfopanel(result.data.gift);
            }else{
                this.c_showNonepanel(result);
            }
        }
        ,c_showInfopanel:function(gift){            //显示领取卡券界面
            this.dom.infopanel.panel.show();
            this.dom.nonepanel.panel.hide();
            this.dom.resultpanel.panel.hide();
            if('-1' == gift.t){
                this.dom.infopanel.row1.attr("class", "quan");
                this.dom.infopanel.row1.show();
                this.dom.infopanel.row0.hide();
                this.dom.infopanel.quan0.hide();
                //设置分享
                window.Myweixinobj.setDesc('你停车，我买单，停车只要1元！').setTitle('嘟嘟停车，请你停车').initBind();
            }else{
                this.dom.infopanel.row1.hide();
                if(gift.m[0] == gift.m[1]){
                    this.dom.infopanel.row0.attr("class", "quan");
                	this.dom.infopanel.row0.show();
                	this.dom.infopanel.quan0.hide();
                	this.dom.infopanel.info.html(gift.m[0]);
                	//根据文字修正位置
                	if(gift.m[0] >= 10){
                		this.dom.infopanel.info.css("width","120");
                	}else{
                		this.dom.infopanel.info.css("width","80");
                	}
                }else{
                	this.dom.infopanel.row0.hide();
                    this.dom.infopanel.quan0.attr("class", "quan0");
                	this.dom.infopanel.quan0.show();
                }
            }
        }
        ,c_showResultpanel:function(result){        //显示领取成功的卡券
            this.dom.infopanel.panel.hide();
            this.dom.nonepanel.panel.hide();
            this.dom.resultpanel.panel.show();
            this.dom.zhiwenimg.attr('src','./img/zhiwen.png');

            //code: 0data: Objectcoupon: Objecte: "2015-03-23 00:59:04"id: "32"m: 3t: "0"
            if('-1' == result.data.coupon.t){
                this.dom.resultpanel.row1.attr("class", "quan");
                this.dom.resultpanel.row1.show();
                this.dom.resultpanel.row0.hide();
                //设置分享
                window.Myweixinobj.setDesc('你停车，我买单，停车只要1元！').setTitle('嘟嘟停车，请你停车').initBind();
            }else{
                this.dom.resultpanel.row1.hide();
                this.dom.resultpanel.row0.attr("class", "quan");
                this.dom.resultpanel.row0.show();
                this.dom.resultpanel.info.html(result.data.coupon.m);
                //根据文字修正位置
              	if(result.data.coupon.m >= 10){
              		this.dom.resultpanel.info.css("width","120");
              	}else{
              		this.dom.resultpanel.info.css("width","80");
              	}
            }
        }
        ,c_showNonepanel:function(result){          //显示领取卡券失败界面
            this.dom.infopanel.panel.hide();
            this.dom.nonepanel.panel.show();
            this.dom.resultpanel.panel.hide();
            this.dom.nonepanel.info.html(result.data);
            this.dom.zhiwenimg.attr('src','./img/zhiwen.png');
        }
        ,c_showquit:function(isshow){
            this.showquit = !!isshow;
        }
        ,c_quit:function(){
            var me = this;
            var c = me.context.parent().parent();
            sysmanager.pagecontainerManager.hide(c);
            me.close();
        }
        ,c_get:function(){      //领取红包
            var me = this;
            this.m_get(this.code,this.fromid, function(result){
                if(0 == result.code){
                    me.c_showResultpanel(result);
                }else{
                    me.c_showNonepanel(result);
                }
            });
        }
        ,r_init:function(){
            var me = this;
//            this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});
            this.dom.infopanel.btget.aclick(function(){
                me.c_get();
            });
            this.dom.bttest.aclick(function(){
                me.c_bttest();
            });
        }
        ,c_bttest:function(){
            var href = window.location.href.split('?')[0];
            href+='?hcode={0}&type=10';
            $.get('http://duduche.me/driver.php/home/public/testCreateGiftPack', function(data){
                console.log(data);
                var code = data;
                href = href.replace('{0}', data);
                window.location.href = href;
            });
        }
        ,close:function(){
            this.onclose && this.onclose(this.info);
        }
        ,m_checkcoupon:function(code,fromid, fn){      //检查卡券
            var data = {code:code,fromid:fromid};
            var uid = myajax.uid();
            if(uid){
                data.uid = uid;
            }
            window.myajax.get('public','checkGiftPack',data, function(result){
                fn && fn(result);
            }, null, true);
        }
        ,m_get:function(code,fromid, fn){           //领取卡券
            var me = this;
            var data = {code:code,fromid:fromid};
            window.myajax.userget('index','openGiftPack',data, function(result){
                if('100' == result.code+''){        //没有登录
                        sysmanager.loginUI(function(){
                            me.m_get(code,fromid,fn);
                        },'手机号就是您在<b>嘟嘟停车</b>的账号',false,{"reg_text":"抵用劵放入账户","no_title":1});
                }else{
                    fn && fn(result);
                }
            }, null, true);
        }
    };
    return  ui;
}
