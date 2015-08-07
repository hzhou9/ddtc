/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


define(['jquery', 'cfg', 'ajax', 'utils'], function($, cfg ,ajax, utils){
   
   var obj = {
       pagecontainerManager:(function(){
           var toppg = $('#topheardpagecontainer');
           var toppghead =  toppg.find('header>h1');
           var topmenubut =  toppg.find('header>button').aclick(function(){
               topmenuMnager.showMenu();
           });
           var toppghead_html = toppghead.html;
           toppghead.title = (function(){
               var titleslist = [];
               return function(title){
                   if(title){
                       titleslist.push(title);
                       toppg.show();
                   }else{
                       titleslist.pop();
                       title = titleslist[titleslist.length-1];
                   }
                   toppghead.html(title);
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
           list.push($('#main_contaion'));
           var showend = function(e){
               //console.log('显示动画结束', this, e);
               $(this).removeClass(e.animationName);
               this.removeEventListener('webkitAnimationEnd', showend);
               list.push($(this));
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
              list.pop();
           }
           var obj = {
               showToptitle:function(title){
                   toppghead.title(title);
               }
               ,setTopmenu:function(view){
                   topmenuMnager.setMenu(view);
               }
               ,show:function(pagecaontaion){            //显示一个数据容器
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
               }
               ,hide:function(pagecaontaion){                    //隐藏最上层的数据容器
                   if(!pagecaontaion){
                       pagecaontaion = list[list.length-1];
                       var view = pagecaontaion.data('view');
                       view.obj.close();
                       if(2 == list.length){
                           toppg.hide();
                       }else{
                           var lastpage = list[list.length-2];
                           var lastpagev = lastpage.data('view');
                           topmenuMnager.setMenu(lastpagev);
                       }
                   }
                  var animname = pagecaontaion.attr('animname');
                   if(animname){
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
               }
           }
           return obj;
       })()
       ,loadpage:function(viewroot, viewname, pagecontainer, name, callback, arg){      //加载只 Dion 过的page 在指定的page容器中
           var me = this;
           var viewmanager = requirejs('view');
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
            */
           setTimeout(function(){
               //me.checklogin();       //todo:设置自动登录
           });

           if(!window.localStorage){
               window.localStorage = (function(){
                   return {
                       setItem:function(key, val){

                       }
                       ,removeItem:function(key){

                       }
                       ,getItem:function(key){

                       }
                   };
               })();
           }
           window.onerror1= function(msg,url,l){
               txt="There was an error on this page.\n\n"
               txt+="Error: " + msg + "\n"
               txt+="URL: " + url + "\n"
               txt+="Line: " + l + "\n\n"
               txt+="Click OK to continue.\n\n"
               alert(txt)
               return true
           }

           window.MyAppQuit = function(){
               me.appQuit();
           }

           return this;
       }
       ,login:function(parkname,name,password, fn){         //通用登录方法
           //alert([email, pwd]);
//           fn && fn({
//               name:'测试'
//               ,type:'0'
//               ,status:'1'
//           });
//           return;
           ajax.get('public','login',{parkname:parkname,username:name,password:password}, function(result){
               if(0 == result.code){
                   var userinfo = result.data;
                   ajax.userinfo(userinfo);
                   fn && fn(userinfo);
               }else{
                   fn && fn(null);
               }
          });
       }
       ,checkLogin:function(fn){
            ajax.loadinfo();
           var userinfo = ajax.userinfo();
           if(userinfo){
               fn && fn(true);
           }else{
               fn && fn(false);
           }

       }
       ,quitlogin:function(fn){
           var me = this;
           ajax.clearInfo();
           fn && fn();

       }
       ,clearLoginInfo:function(){
           ajax.clearInfo();
           if(window.localStorage){
                  window.localStorage.removeItem('key');
                  window.localStorage.removeItem('uid');
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
       ,nologin:function(fn){
           this.loadpage('views/', 'login', $('#login_pagecontaion'),null, function(view){
               fn && fn(view);
          });
       }
       ,appQuit:function(){
           //检查弹出框
           var alertpanel = $('#alert_pagecontainer');
           if(alertpanel.is(':visible')){
               alertpanel.hide();
               return;
           }

           //检查对话弹出框
           var confirm = $('#confirm_pagecontainer');
           if(confirm.is(':visible')){
               confirm.hide();
              return;
           }
           //检查login页面是否存在
           var login = $('#login_pagecontaion');
           if(login.is(':visible')){
               //alert('应该退出应用');
               //navigator.app.exitApp();
               window.PushManager.setMsg('appquit');
              return;
           }

           //检查单独窗口
           var pagelist = [
               '#sence_out_pagecontaion'
               ,'#sence_in_pagecontaion'
               ,'#tixianop_pagecontaion'
               ,'#pop_pagecontaion'
           ]
           for(var i=0;i<pagelist.length;i++){
               var toppage = $(pagelist[i]);
               if(toppage.is(':visible')){
                   toppage.find('header>a').aclick();
                 return;
              }
           }

           //检查无菜单弹出窗口
           var page = $('.bodypage>.toppagecontainer:visible');
           if(page.length>0){
               var p = $(page[0]);
               $('#topheardpagecontainer header>a').click();
               return;
           }
           //检查退出登录
           if(window.UserManager){
//               window.UserManager.c_quit();
               window.PushManager.setMsg('appquit');
           }
       }
       ,alert:(function(){
           var alertpanel = $('#alert_pagecontainer');
           var titledom = alertpanel.find('[name=title]');
           var msgdom = alertpanel.find('[name=msg]');
           var make = alertpanel.find('[name=make]').click(function(){
               alertpanel.hide();
           });
           var obj = function(msg, title){
               var t = title || '错误信息';
               titledom.html(t);
               msgdom.html(msg);
               alertpanel.show();
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
       ,ReguiManager:(function(){
           var uis = {
           }
           var inui_key = 'in_ui_key';
           var obj = {

           };
           return obj;
        })()
       ,Pushinit:function(){
           var me = this;
           window.PushManager.bind('pushid', function(){
               me.PushID(this.pushid);
           });
           window.PushManager.bind('pushmsg', function(){
               //1)window.UserManager = this;  全局存在改对象
               //2)当前处于登录状态
               //执行消息

               if(window.UserManager && ajax.userinfo()){
                  var msg = null;
                  while(msg = this.getPushmsg()){
                      (function(msg){
                          setTimeout(function(){
                             me.PushMsg(msg);
                         });
                      })(msg);
                  }
               }

           });
           window.PushManager.fire('pushid');
           window.PushManager.fire('pushmsg');

       }
       ,PushID:function(pushid){
           if(pushid){
//               alert('触发事件获得pushid\n'+pushid);

               if(ajax.userinfo()){
                   ajax.userget('index','setPushId',{pushid:pushid}, function(result){
                       var data = result.data;
                       //alert('pushid发送服务器');
                       //fn && fn(data);
                   });
               }
           }
       }
       ,PushMsg:function(msg){
//           alert('触发事件获得pushmsg\n'+msg);
       var obj = JSON.parse(msg);
       if('in' == obj.t || 'out' == obj.t){
           window.UserManager.c_viewjiaoyi();
       }else if('reload' == obj.t){
            //alert('reload');
            window.location.reload();
       }
           /*var obj = JSON.parse(msg);
           if('in' == obj.t){
               window.UserManager.c_secen_in_Manager();
           }else if('out' == obj.t){
               window.UserManager.c_secen_out_Manager();
           }*/
       }
   }
   return obj;
});