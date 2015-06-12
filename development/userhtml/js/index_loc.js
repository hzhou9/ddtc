 (function($){
  
  initmenu();
  
  var iframes = {//frameobj,loaded
  'iframe1':[$('#iframe1'),false]
  ,'iframe2':[$('#iframe2'),false]
  ,'iframe3':[$('#iframe3'),false]};
  var curframe = null;
  var iframetop = 0;
  var iframeheight = iframes.iframe1[0].height();
  var tabs = $('.mui-bar-tab>*');
  var activeclassnamwe = 'mui-active';
  var MOUSE_CLICK = 'touchend';
  tabs.bind(MOUSE_CLICK,function(){
            var tab = $(this);
            var href = tab.attr('href');
            var target = tab.attr('target');
            var curframe = iframes[target][0];
            if(!iframes[target][1]){
            iframes[target][0].attr('src','http://static.duduche.me/redirect/user/indexhtml.php?isapp=1&m={0}&time={1}'.replace('{0}',href).replace('{1}',new Date-0));
            iframes[target][1] = true;
            }
            $.each(iframes,function(k,v){
                   if(k == target){
                   v[0].show();
                   }else{
                   v[0].hide();
                   }
                   });
            tabs.removeClass(activeclassnamwe);
            tab.addClass(activeclassnamwe);
            });
  
  
  
  
  function init(){
  $(document.body).bind('touchmove', function(){
                        return false;
                        });
  var iphonever = iOSversion();
  if(iphonever){
  if(parseInt(iphonever[0])>=7){        //ios大版本号》7  那么要注意手机的状态栏
  var height = iframes.iframe1[0].height();
  iframeheight = height-top;
  iframetop = 20;
  $.each(iframes,function(k,v){v[0].css({
                                        top:iframetop + 'px'
                                        ,height:iframeheight+'px'
                                        });});
  }
  }
  setTimeout(function(){
             $(tabs[0]).trigger(MOUSE_CLICK);
             });
  }
  function initmenu(){
  var tabcontaion = $('.mui-bar-tab');
  tabcontaion.html(
                   '<div class="mui-tab-item" href="map" target="iframe1">'
                   +'<span class="mui-icon mui-icon-map"></span>'
                   +'<span class="mui-tab-label">附近</span>'
                   +'</div>'
                   +'<div class="mui-tab-item" href="discover" target="iframe2">'
                   +'<span class="mui-icon mui-icon-navigate"></span>'
                   +'<span class="mui-tab-label">发现</span>'
                   +'</div>'
                   +'<div class="mui-tab-item" href="userinfo" target="iframe3">'
                   +'<span class="mui-icon mui-icon-contact"></span>'
                   +'<span class="mui-tab-label">我的</span>'
                   +'</div>'
                   )
  
  }
  function iOSversion() {
  if (/iP(hone|od|ad)/.test(navigator.platform)) {
  // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
  var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
  return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
  }else{
  return false;
  }
  }
  
  init();
  
  })(jQuery);


(function(){
 window.onerror1= function(msg,url,l){
 txt="There was an error on this page.\n\n"
 txt+="Error: " + msg + "\n"
 txt+="URL: " + url + "\n"
 txt+="Line: " + l + "\n\n"
 txt+="Click OK to continue.\n\n"
 alert(txt);
 return true
 }
 
 //接受子窗口事件
 window.addEventListener('message', function(event){
                         //e.origin
                         
                         var paydata = JSON.parse(event.data);
                         weixinapppay(paydata);
                         }, false);
 
 // 通过 postMessage 向子窗口发送数据
 function sendToIframe(data){
 curframe[0].contentWindow.postMessage(data,"*");
 }
 
 function weixinapppay(paydata){
 //        Pgwxpay.wxpay2({"appid":paydata.appid, "noncestr":paydata.noncestr, "partnerid":paydata.partnerid, "prepayid":paydata.prepayid, "timestamp":paydata.timestamp},
 Pgwxpay.wxpay2(paydata,
                function(success) {
                sendToIframe(JSON.stringify(success));
                
                }, function(fail) {
                alert('支付调用失败:'+fail);
                });
 }
 
 })();
