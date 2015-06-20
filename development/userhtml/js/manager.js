/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:45
 * To change this template use File | Settings | File Templates.
 */
window.sysmanager = {
       pagecontainerManager:(function(){
           var toppg = $('#topheardpagecontainer');
           var toppghead =  toppg.find('header>h1');
           var topmenubut =  toppg.find('header>button').aclick(function(){
               topmenuMnager.showMenu();
           });
           var toppghead_html = toppghead.html;
           var titleslist = [];
           toppghead.title = (function(){
               return function(title){
                   if(title){
                       titleslist.push(title);
                       toppg.show();
                   }else{
                       titleslist.pop();
                    if(titleslist.length > 0){
                       title = titleslist[titleslist.length-1];
                    }else{
                        toppg.hide();
                    }
                   }
                    if(title){toppghead.html(title);}
               }
           })();
           toppghead.check = (function(){
                return function(title){
                    return (title && title != '' && titleslist[titleslist.length-1] == title);
                }
           })();
           var topmenuMnager = (function(topmenubut){
               var top_menu = $('#top_menu');
              var list = top_menu.find('[name=list]');
                var row = top_menu.find('.template>li');
              var make = top_menu.find('[name=make]').aclick(function(){
                      top_menu.hide();
                  });
               var obj  = {
                    setMenu:function(view){
                        var menu = view.obj.menuinfo && view.obj.menuinfo();        //获取菜单信息
                       if(menu){
                           topmenubut.show();
                           list.empty();
                           for(var i=0;i<menu.length;i++){
                               var menudata = menu[i];
                               (function(menudata){
                                   var newrow = row.clone();
                                  newrow.html(menudata.name).aclick(function(){
                                      top_menu.hide();
                                      view.obj.menuaction(menudata.action);
                                  });
                                  list.append(newrow);
                               })(menudata);
                           }
                       }else{
                           topmenubut.hide();
                       }
                    }
                   ,showMenu:function(){
                        top_menu.show();
                   }
               };
               return obj;
           })(topmenubut);

           var list = [];
           var main_c = $('#main_contaion');
           list.push(main_c);
           var showend = function(e){
               //console.log('显示动画结束', this, e);
               $(this).removeClass(e.animationName);
               this.removeEventListener('webkitAnimationEnd', showend);
           }
           var showend_child = function(e){
                  //console.log('显示动画结束_子', this, e);
                  $(this).removeClass(e.animationName);
                  this.removeEventListener('webkitAnimationEnd', showend_child);
              }
           var hideend = function(e){
              //console.log('关闭动画结束', this, e);
              $(this).removeClass(e.animationName).hide();
              this.removeEventListener('webkitAnimationEnd', hideend);
           }
           var obj = {
               showToptitle:function(title){
                   toppghead.title(title);
               }
               ,checkToptitle:function(title){
                    return toppghead.check(title);
                }
               ,setTopmenu:function(view){
                   topmenuMnager.setMenu(view);
               }
               ,show:function(pagecaontaion){            //显示一个数据容器
                   //main_c.hide();//提升子窗口显示性能
                   var animname = pagecaontaion.attr('animname');

                   if(animname){
                       pagecaontaion.show().addClass(animname);
                      pagecaontaion[0].addEventListener('webkitAnimationEnd', showend);
                       if(list.length>0){
                              var child = list[list.length-1];
                              child.addClass(animname+'_child');
                              child[0].addEventListener('webkitAnimationEnd', showend_child);
                        }
                   }else{
                       pagecaontaion.show();
                   }
                             
                   list.push(pagecaontaion);
                   //setTimeout(function(){main_c.show();},2000);//提升子窗口显示性能
               }
               ,hide:function(pagecaontaion,force){                    //隐藏最上层的数据容器
                             var changetitle = true;
                   if(!pagecaontaion){
                       pagecaontaion = list[list.length-1];
                       var view = pagecaontaion.data('view');
                       view.obj.close();
                    }else{//找到该contanion
                        for(var i=list.length-1;i>0;i--){
                            if(pagecaontaion == list[i]){
                             if(i < list.length-1){//将pagecaontaion上移动
                             for(var j=i;j<list.length-1;j++){
                             list[j]=list[j+1];
                             }
                             list[list.length-1]=pagecaontaion;
                             changetitle=false;//说明view不在最高层
                             }
                             break;
                            }
                        }
                    }
                    if(changetitle && 2 < list.length){
                        var lastpage = list[list.length-2];
                        var lastpagev = lastpage.data('view');
                        topmenuMnager.setMenu(lastpagev);
                    }
                  var animname = pagecaontaion.attr('animname');
                   if(animname && !force){
                       animname = animname+ '_un';
                       pagecaontaion.show().addClass(animname);
                       pagecaontaion[0].addEventListener('webkitAnimationEnd', hideend);
                       if(list.length>1){
                             var child = list[list.length-2];
                             child.addClass(animname+'_child');
                             child[0].addEventListener('webkitAnimationEnd', showend_child);
                        }
                   }else{
                       pagecaontaion.hide();
                   }
                   list.pop();
               }
               ,clearviews:function(){
                    //main_c.hide();
                    while(list.length > 1){
                        this.hide(null,true);
                        this.showToptitle();
                    }
                    $('#reg_dialog_pagecontainer').hide();$('#alert_pagecontainer').hide();$('#confirm_pagecontainer').hide();
                    sysmanager.loading.hide();
                }
                ,onback:function(){
                    this.hide(null,true);
                    this.showToptitle();
                }
           }
           return obj;
       })()
       ,loadpage:function(viewroot, viewname, pagecontainer, name, callback, arg){      //加载只 Dion 过的page 在指定的page容器中
           if(this.pagecontainerManager.checkToptitle(name)){//屏蔽重复加载
               return;
           }
           var me = this;
           var viewmanager = viewManager;
           viewmanager.viewroot(viewroot);
           var title = null;
           var generalpanel = false;                //默认面板
           if(!pagecontainer){
               pagecontainer = $('.toppagecontainer:hidden:first');
               this.pagecontainerManager.showToptitle(name || '');
               generalpanel = true;
           }else{
               title = pagecontainer.find('header>h1');
               title.html(name || '');
           }
           var body = pagecontainer.find('.page');
           var animname = pagecontainer.attr('animname');

           body.empty();
           this.pagecontainerManager.show(pagecontainer);
           viewmanager.loadview(viewname,function(v){
               v.renderer(body, arg);
               callback && callback(v);
               pagecontainer.data('view', v);
               me.pagecontainerManager.setTopmenu(v);
           });
       }
       ,init:function(){
           var me = this;
           //var pagecpntainer = ['#login_pagecontaion', '#pagecontaion'];
           $('#topheardpagecontainer').each(function(){
                var c = $(this);
               c.find('[name=btupclose]').bind('click', function(){
                   me.pagecontainerManager.hide();
                   me.pagecontainerManager.showToptitle();
               });
           });
           $('.pagecontainer').each(function(){
               var c = $(this);
               c.find('>header [name=btclose]').click(function(){
                    var view = c.data('view');
                    view.obj.close();
                    me.pagecontainerManager.hide(c);
               }).end().find('>header [name=btcloseok]').click(function(){
                   var view = c.data('view');
                   view.obj.close(true);
                   me.pagecontainerManager.hide(c);
               });
           });
           /**
           $('#pagecontaion>header>a').aclick(function(){
               var view = $('#pagecontaion').data('view');
               $('#pagecontaion').hide();
               view.obj.close();
           });
            
           setTimeout(function(){
               me.checklogin();
           });
           */
           return this;
       }
    ,login:function(phone, carid, callback){
        var type = utils.tools.getUrlParam('type') || '1';

        if('1' == type){      //非openid模式
            //window.myajax.get('Public','login',{'phone':phone,'carid':carid},function(result){
            window.myajax.get('Public','login',{'phone':phone},function(result){
                if(0 == result.code){
                    var userinfo = {
                        uid:result.data.uid
                        ,uuid:result.data.uuid
                    }
                    window.myajax.userinfo(userinfo);
                    if(sysmanager.isapp){
                    setTimeout(function(){
                        if(window.pushid){
                            window.myajax.userget('index','setPushid',{pushid:window.pushid}, function(result){
                            }, null, false);
                        }else{
                            window.parent.postMessage(JSON.stringify({t:'setpushid'}),'*');
                        }
                    });//提交pushid
                    }
                    callback && callback();
                }
            });
        }else{
            var openid = utils.tools.getUrlParam('openid');
            //window.myajax.get('Public','wxlogin',{openid:openid,'phone':phone,'carid':carid},function(result){
            window.myajax.get('Public','wxlogin',{openid:openid,'phone':phone},function(result){
                if(0 == result.code){
                    var userinfo = {
                        uid:result.data.uid
                        ,uuid:result.data.uuid
                    }
                    window.myajax.userinfo(userinfo);
                    callback && callback();
                }
            });
        }
    }
    ,loginUI:(function(){
        var ui = {
                isInit: false
                ,context:null
                ,dom:{
                    userpanel_phone:'[name=userpanel_phone]'
                    ,userpanel_chepai:'[name=userpanel_chepai]'
                    ,btreg:'[name=btreg]'
                    ,msg:'[name=msg]'
                    ,btclose:'[name=btclose]'
                    ,title1:'h1'
                    ,title2:'hr'
                }
                ,iscroll:null
                ,ishead:false       //是否带了一个导航栏
                ,callback:null      //关闭的回调
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
                }
                ,c_show:function(callback, msg,canclose,ext){
                    this.dom.msg.html(msg || "首次使用嘟嘟停车需要注册你的手机号");
                    if(!!canclose){
                        this.dom.btclose.show();
                    }else{
                        this.dom.btclose.hide();
                    }
                    if(ext){
                    	if("reg_text" in ext){
                    		this.dom.btreg.html(ext["reg_text"]);
                    	}
                    	if("no_title" in ext){
                    		this.dom.title1.hide();
                    		this.dom.title2.hide();
                    	}
                    }
                    this.callback = callback;
                    this.context.show();
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
                    var chepai = this.dom.userpanel_chepai.val();
                    this.dom.userpanel_phone.blur();
                    this.dom.userpanel_chepai.blur();
                    if('' == phone){
                        sysmanager.alert('手机号不能为空!');
                    }else if(!(/^1[3|4|5|7|8][0-9]\d{8}$/.test(phone))){
				            		sysmanager.alert('请输入正确的手机号!');
				            }else{
                        sysmanager.login(phone,chepai,function(){
                        	sysmanager.alert();
                            me.c_quit();
                        });
                    }
                }
                ,c_reg_openid:function(){
                    var me = this;
                    var phone = this.dom.userpanel_phone.val();
                    var chepai = this.dom.userpanel_chepai.val();
                    var openid =  utils.tools.getUrlParam('openid');
                    this.dom.userpanel_phone.blur();
                    this.dom.userpanel_chepai.blur();
                    if('' == phone){
                        sysmanager.alert('手机号不能为空!');
                    }if(!(/^1[3|4|5|7|8][0-9]\d{8}$/.test(phone))){
				            		sysmanager.alert('请输入正确的手机号!');
				            }else{
                        sysmanager.login(phone,chepai,function(){
                        	sysmanager.alert();
                            me.c_quit();
                        });
                    }
                }
                ,c_quit:function(isclickquit){      //isclockquit:是否点击了退出按钮的退出
//                    if(!this.ishead){
//                        var me = this;
//                        var c = me.context.parent().parent();
//                        sysmanager.pagecontainerManager.hide(c);
//                        me.close();
//                    }else{
//                        $('#topheardpagecontainer [name=btupclose]').click();
//                    }
                    this.context.hide();
                    this.callback && this.callback(isclickquit);
                }
                ,r_init:function(){
                    var me = this;
                    var type = utils.tools.getUrlParam('type') || 1;
                    this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});


                    me.dom.btreg.aclick(function(){
                        me.c_reg();
                    });
                    this.dom.btclose.aclick(function(){
                        me.c_quit(false);
                    });
                }
                ,close:function(){
                    this.onclose && this.onclose();
                }
            };
        ui.init($('#reg_dialog_pagecontainer'));

        return function(callback, msg,canclose,ext){    //callback:登录成功的回调，msg 定制提示信息，否则使用默认，canclose是否允许关闭
            ui.c_show(callback, msg,canclose,ext);
        }
    })()
    ,couponUI:function(code, fromid, callback){           //弹出卡券窗口 如果没有callback则使用全屏窗口
        if(!callback){
            sysmanager.loadpage('views/', 'couponget', $('#coupon_pagecontaion'),null, function(view){
                view.obj.setCode(code,fromid);
            });
        }else{
            sysmanager.loadpage('views/', 'couponget', null,'领取红包', function(view){
                view.obj.setCode(code);
                view.obj.onclose = function(){
                    callback && callback();
                }
            });
        }
    }
    ,checkLogin:function(callback){
        var me = this;
        var userinfo = myajax.userinfo() || {};
        var uid = userinfo.uid || '';
        var uuid = userinfo.uuid || '';
        if('' == uid || '' == uuid){
            //this.alert('当前没有缓存的登录凭据［测试］');
            callback && callback(false);
        }else{
            window.myajax.get('Public','checkLogin',{'uid':uid,'uuid':uuid},function(result){
                if(0 == result.code){
                    callback && callback(true);
                }else{
                    //me.alert('检查登录失败\n'+JSON.stringify(result));
                    callback && callback(false);
                }
            },null,true);
        }
    }
       ,loading:(function(){
            var loading = $('#loading');
            var bt = loading.find('[name=bt]');
            bt.click(function(){
                loading.hide();
            });
            var handler = null;
            var wait = 5000;
            function clearHandler(){
                if(!handler){
                    clearTimeout(handler);
                    handler = false;
                }
            }
            function startHnadler(callback){
                clearHandler();
                handler = setTimeout(function(){
                    bt.show();
                }, wait);
            }

            var obj = {
              show:function(){
                  bt.hide();
                  loading.show();
                  startHnadler();
              }
              ,hide:function(){
                  clearHandler();
                  loading.hide();
              }
            };
           return obj;
       })()
       ,alert:(function(){
           var alertpanel = $('#alert_pagecontainer');
           var titledom = alertpanel.find('[name=title]');
           var msgdom = alertpanel.find('[name=msg]');
           var make = alertpanel.find('[name=make]').click(function(){
               alertpanel.hide();
           });
           var obj = function(msg, title){
           	if(msg){
               var t = title || '错误信息';
               titledom.html(t);
               msgdom.html(msg);
               alertpanel.show();
             }else{
             	alertpanel.hide();
            }
           }
           return obj;
       })()
        ,confirm:(function(){
               var confirm = $('#confirm_pagecontainer');
               var okbutton = confirm.find('[name=btok]').click(function(){
                   confirm.hide();
                   okfn && okfn();
                   okfn = null;
               });
               var cancelbutton = confirm.find('[name=btcancel]').click(function(){
                   confirm.hide();
                   cancelfn && cancelfn();
                   cancelfn = null;
               });
               var msg = confirm.find('[name=msg]');


               var okfn = null;
               var cancelfn = null;

               return function(_msg, _okfn, _cancelfn){
                   msg.html(_msg);
                   okfn = _okfn;
                   cancelfn = _cancelfn;
                   confirm.show();
               }
           })()
       ,imgpath:function(imgname){
           return cfg.imgpath + imgname;
       }
        ,isapp:(function(){     //当前是否在app中
            var isapp = !!(utils.tools.getUrlParam('isapp'));
            return isapp;
//        return !!window.cordova;

        })()
        ,loadMapscript:(function(){     //地图异步加载
           var callback = null;
            var isloading = false;
           var initname = 'loadmapscriptinit_'+(new Date()-0);
           window[initname] = function(){
               isloading = true;
               window.mapPluginInit();
               callback && callback();
           }


           var obj = {
               load:function(_callback){
                   if(isloading){
                       _callback && _callback();
                   }else{
                       callback = _callback;
                       var script = document.createElement("script");
                       script.type = "text/javascript";
                       script.src = "http://webapi.amap.com/maps?v=1.3&key=bc59f27d65900532cc4f3c1048dd6122&callback="+initname;
                       document.body.appendChild(script);
                   }
               }
           };
           return obj;
        })()
        ,getMapimage:function(lng,lat,zoom,width,height){
        return 'http://restapi.amap.com/v3/staticmap?location='+lng+','+lat+'&zoom='+zoom+'&size='+width+'*'+height+'&markers=mid,,停:'+lng+','+lat+'&key=b223c8ce027b44c518817337b4308ac8';
        }
   }
