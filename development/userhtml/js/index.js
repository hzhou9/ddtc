(function ($) {
    var errortxt = '您的网络好像不给力哦～<br>如果内容一直无法加载，您可以点击屏幕重新尝试';
    var baseurl = 'http://t.duduche.me/html/userhtml/index.html?isapp=1&m={0}&time={1}';
    var MOUSE_CLICK = 'click';//'touchend';

    var tabcontaion = $('.mui-bar-tab');

    var tabsarr = initmenu();

    // 通过 postMessage 向子窗口发送数据
    window.sendToIframe = function (data) {
        window.idata.curfame[0].contentWindow.postMessage(data, "*");
    };
    // 支持出错检测的iframe加载
    window.idata = {first: true, navtimer: 0, curfame: $('#iframe1')};
    window.idata.doload = function (href, force) {
        if (window.idata.first || force) {
            window.idata.curfame.load(function (e) {//容错：加载成功判断
                sendToIframe(JSON.stringify({t: 'ack'}));
                if (window.idata.navtimer == 0) {
                    window.idata.navtimer = setTimeout(function () {
                        $('#startpage p').html(errortxt);
                        $('#startpage').show();
                        $('#loading').hide();
                        $('#startpage').unbind().click(function () {
                            $('#startpage p').html('');
                            $('#loading').show();
                            window.idata.doload(href, true);//retry
                        });
                    }, 1000);//1秒内没有应答，就提示重新加载
                } else {
                    setTimeout(function () {
                        $('#startpage p').html(errortxt);
                        $('#loading').hide();
                    }, 1000);
                }
            });
            window.idata.first = false;
            var myurl = baseurl;
            window.idata.curfame.attr('src', myurl.replace('{0}', href).replace('{1}', new Date - 0));

        } else {
            sendToIframe(JSON.stringify({t: 'nav', d: href}));
            if (window.idata.navtimer == 0) {
                window.idata.navtimer = setTimeout(function () {
                    $('#startpage p').html(errortxt);
                    $('#startpage').show();
                    $('#loading').hide();
                    $('#startpage').unbind().click(function () {
                        $('#startpage p').html('');
                        $('#loading').show();
                        window.idata.doload(href, true);//retry
                    });
                }, 1000);//1秒内没有应答，就提示重新加载
            } else {
                setTimeout(function () {
                    $('#startpage p').html(errortxt);
                    $('#loading').hide();
                }, 1000);
            }
        }
    };
    window.idata.dotab = function (target) {
        var activeclassnamwe = 'mui-active';
        tabsarr.removeClass(activeclassnamwe);
        tabcontaion.find('[name=' + target + ']').addClass(activeclassnamwe);
    };
    window.idata.loadframe = function (target, href, force) {
        window.idata.doload(href, force);
        window.idata.dotab(target);
    };

    var iframetop = 0;
    var iframeheight = window.idata.curfame.height();
    tabsarr.bind(MOUSE_CLICK, function () {
        var tab = $(this);
        var href = tab.attr('href');
        var target = tab.attr('name');
        window.idata.loadframe(target, href, false);
    });

    function init() {
        $(document.body).bind('touchmove', function () {
            return false;
        });
        var iphonever = iOSversion();
        if (iphonever) {
            if (parseInt(iphonever[0]) >= 7) {        //ios大版本号》7  那么要注意手机的状态栏
                var height = window.idata.curfame.height();
                iframeheight = height - top;
                iframetop = 20;
                window.idata.curfame.css({
                    top: iframetop + 'px', height: iframeheight + 'px'
                });
            }
        }
        //首次加载
        $('#startpage').height(iframeheight);
        window.idata.curfame.show();
        setTimeout(function () {
            $(tabsarr[0]).trigger(MOUSE_CLICK);
        });
    }

    function initmenu() {
        tabcontaion.html(
            '<div class="mui-tab-item" href="map" name="iframe1">'
            + '<span class="mui-icon duduche icon-location"></span>'
            + '<span class="mui-tab-label">附近</span>'
            + '</div>'
            + '<div class="mui-tab-item" href="discover" name="iframe2">'
            + '<span class="mui-icon duduche icon-coin"></span>'
            + '<span class="mui-tab-label">省钱</span>'
            + '</div>'
            + '<div class="mui-tab-item" href="userinfo" name="iframe3">'
            + '<span class="mui-icon duduche icon-user"></span>'
            + '<span class="mui-tab-label">我的</span>'
            + '</div>'
        )

        return $('.mui-bar-tab>*');

    }

    function iOSversion() {
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
            var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
        } else {
            return false;
        }
    }

    init();

})(jQuery);


(function () {
    window.onerror1 = function (msg, url, l) {
        txt = "There was an error on this page.\n\n"
        txt += "Error: " + msg + "\n"
        txt += "URL: " + url + "\n"
        txt += "Line: " + l + "\n\n"
        txt += "Click OK to continue.\n\n"
        alert(txt);
        return true
    }

    //接受子窗口事件
    window.addEventListener('message', function (event) {
        //e.origin
        var evt = JSON.parse(event.data);
        if (evt.t == 'pay') {
            weixinapppay(evt.d);
        } else if (evt.t == 'navi') {
            navigator_launcher(evt.d);
        } else if (evt.t == 'nav') {//加载某tab
            var target = evt.d.target;
            var href = evt.d.href;
            var force = evt.d.force;
            window.idata.loadframe(target, href, force);
        } else if (evt.t == 'navack') {
            if (window.idata.navtimer != 0) {
                clearTimeout(window.idata.navtimer);
                window.idata.navtimer = 0;
            }
            if ($('#startpage').is(":visible")) {
                $('#startpage').hide();
                $('#loading').hide();
            }
            if (app.pushid) {
                sendToIframe(JSON.stringify({t: 'pushid', d: app.pushid}));
            }
        } else if (evt.t == 'setpushid') {
            if (app.pushid) {
                sendToIframe(JSON.stringify({t: 'setpushid', d: app.pushid}));
            }
        } else if (evt.t == 'setlocation') {
            var noop = function () {};
            if ((/android/i).test(navigator.userAgent)) {
                window.locationService.getCurrentPosition(function (pos) {
                    sendToIframe(JSON.stringify({t: 'setlocation', d: pos}));
                    window.locationService.stop(noop, noop);
                }, function (e) {
                    window.locationService.stop(noop, noop);
                });
            }
        }
    }, false);

    function weixinapppay(paydata) {
//        Pgwxpay.wxpay2({"appid":paydata.appid, "noncestr":paydata.noncestr, "partnerid":paydata.partnerid, "prepayid":paydata.prepayid, "timestamp":paydata.timestamp},
        Pgwxpay.wxpay2(paydata,
            function (success) {
                sendToIframe(JSON.stringify({t: 'pay', d: success}));
            }, function (fail) {
                alert('支付调用失败:' + fail);
            });
    }

    function navigator_launcher(data) {
        launchnavigator.navigate(
            data.type,
            data.dist,
            data.orig,
            function () {
            },
            function (error) {
                console.log(error);
                alert("导航启动失败");
            });
    }

//cordova事件
    window.onMsgData = function (data) {
        console.log("window.onMsgData:" + data);
        var obj = JSON.parse(data);
        if (obj.t == 'nav') {
            var target = obj.target;
            var href = obj.href;
            var force = obj.force;
            window.idata.loadframe(target, href, force);
        }
        if (obj.t == 'reload') {
            window.location.reload();
        } else {
            sendToIframe(JSON.stringify({t: 'msgdata', d: obj}));
        }
    };

    function trackCordovaEvents() {
        if (!window.cordova_onDeviceReady) {
            setTimeout(trackCordovaEvents, 1000);
        } else {
            //返回按钮
            document.addEventListener("backbutton", function (e) {

            }, false);
            //网络检测
            document.addEventListener("offline", function () {

            }, false);
            document.addEventListener("online", function () {

            }, false);
        }
    }

    trackCordovaEvents();

})();

