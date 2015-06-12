(function($){

 var tabcontaion = $('.mui-bar-tab');
 
 var tabsarr = initmenu();
 
 
 window.idata = {};
 window.idata.iframes = {//frameobj,loaded
        'iframe1':[$('#iframe1'),false]
        ,'iframe2':[$('#iframe2'),false]
        ,'iframe3':[$('#iframe3'),false]};
 window.idata.curfame = null;
 
 window.idata.loadframe = function(target,href,force,unload){
 if(force || !window.idata.iframes[target][1]){
 var myurl = 'http://t.duduche.me/html/userhtml/index.html?isapp=1&m={0}&time={1}';
 window.idata.iframes[target][0].attr('src',myurl.replace('{0}',href).replace('{1}',new Date-0));
 window.idata.iframes[target][1] = !unload;
 }
 window.idata.curfame = window.idata.iframes[target][0];
 $.each(window.idata.iframes,function(k,v){
        if(k == target){v[0].show();}else{v[0].hide();}
        });
 var activeclassnamwe = 'mui-active';
 tabsarr.removeClass(activeclassnamwe);
 tabcontaion.find('[name='+target+']').addClass(activeclassnamwe);
 };
 
    var iframetop = 0;
    var iframeheight = window.idata.iframes.iframe1[0].height();
    var MOUSE_CLICK = 'click';//'touchend';
    tabsarr.bind(MOUSE_CLICK,function(){
        var tab = $(this);
        var href = tab.attr('href');
        var target = tab.attr('name');
        window.idata.loadframe(target,href,false);
    });

    function init(){
        $(document.body).bind('touchmove', function(){
            return false;
        });
        var iphonever = iOSversion();
        if(iphonever){
            if(parseInt(iphonever[0])>=7){        //ios大版本号》7  那么要注意手机的状态栏
                var height = window.idata.iframes.iframe1[0].height();
                iframeheight = height-top;
                iframetop = 20;
                $.each(window.idata.iframes,function(k,v){v[0].css({
                                       top:iframetop + 'px'
                                       ,height:iframeheight+'px'
                                       });});
            }
        }
        setTimeout(function(){
            $(tabsarr[0]).trigger(MOUSE_CLICK);
        });
    }
    function initmenu(){
        tabcontaion.html(
                '<div class="mui-tab-item" href="map" name="iframe1">'
                +'<span class="mui-icon mui-icon-map"></span>'
                +'<span class="mui-tab-label">附近</span>'
                +'</div>'
                +'<div class="mui-tab-item" href="discover" name="iframe2">'
                +'<span class="mui-icon mui-icon-navigate"></span>'
                +'<span class="mui-tab-label">发现</span>'
                +'</div>'
                +'<div class="mui-tab-item" href="userinfo" name="iframe3">'
                +'<span class="mui-icon mui-icon-contact"></span>'
                +'<span class="mui-tab-label">我的</span>'
                +'</div>'
        )
 
        return $('.mui-bar-tab>*');

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
        var evt = JSON.parse(event.data);
        if(evt.t == 'pay') {
            weixinapppay(evt.d);
        }else if (evt.t == 'navi') {
            navigator_launcher(evt.d);
        }else if(evt.t == 'nav'){//加载某tab
            var target = evt.d.target;
            var href = evt.d.href;
            var force = evt.d.force;
            var unload = evt.d.unload;
            window.idata.loadframe(target,href,force,unload);
        }
    }, false);

    // 通过 postMessage 向子窗口发送数据
    function sendToIframe(data){
        window.idata.curfame[0].contentWindow.postMessage(data,"*");
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

    function navigator_launcher(data){
        launchnavigator.navigate(
            data.type,
            data.dist,
            data.orig,
            function() {
            },
            function(error){
                console.log(error);
                alert("导航启动失败");
            });
    }
})();

