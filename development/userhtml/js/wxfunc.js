
    window.Myweixinobj = (function(){

        var title = ''; // 分享标题
        var desc  =  ''; // 分享描述
        var linkUrl = ''; // 分享链接
        var imgUrl = ''; // 分享图标
        var fenxiangcallback = null;

       var obj = {
           init:function(_title,_desc,_link,_imgUrl, _fenxiangcallback){      //初始化分享的内容
               title = _title;
               desc = _desc;
               linkUrl = _link;
               imgUrl = _imgUrl;
               fenxiangcallback = _fenxiangcallback;
           }
           ,isready:false
           ,initFenxiang:function(){
               var me = this;
               wx.ready(function () {
                // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。

                    wx.checkJsApi({
                      jsApiList: [
                        'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'openLocation'
                      ],
                      success: function (res) {
                        //alert(JSON.stringify(res));
                          me.isready = true;
                      }
                    });
                    me.initBind();
                });

                wx.error(function (res) {
                    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                    alert(res.errMsg);
                });
           }
           ,initBind:function(){
               //分享给朋友
                           wx.onMenuShareAppMessage({
                             title: title,
                             desc: desc,
                             link: linkUrl,
                             imgUrl: imgUrl,
                             trigger: function (res) {
                               //alert('用户点击发送给朋友');
                             },
                             success: function (res) {
                               //alert('已分享朋友');
                               fenxiangcallback && fenxiangcallback(); //分享统计发送
                             },
                             cancel: function (res) {
                               //alert('已取消');
                             },
                             fail: function (res) {
                               //alert(JSON.stringify(res));
                             }
                           });

                           //分享到朋友圈
                           wx.onMenuShareTimeline({
                             title: desc,
                             link: linkUrl,
                             imgUrl: imgUrl,
                             trigger: function (res) {
                               //alert('用户点击分享到朋友圈');
                             },
                             success: function (res) {
                               //alert('已分享朋友圈');
                                 fenxiangcallback && fenxiangcallback(); //分享统计发送
                             },
                             cancel: function (res) {
                               //alert('已取消');
                             },
                             fail: function (res) {
                               //alert(JSON.stringify(res));
                             }
                           });

                           //分享到QQ
                           wx.onMenuShareQQ({
                             title: title,
                             desc: desc,
                             link: linkUrl,
                             imgUrl: imgUrl,
                             trigger: function (res) {
                               //alert('用户点击分享到QQ');
                             },
                             complete: function (res) {
                               //alert(JSON.stringify(res));
                             },
                             success: function (res) {
                               //alert('已分享qq');
                                 fenxiangcallback && fenxiangcallback(); //分享统计发送
                             },
                             cancel: function (res) {
                               //alert('已取消');
                             },
                             fail: function (res) {
                               //alert(JSON.stringify(res));
                             }
                           });
           }
           ,config:function(cfg){
               /**
                * wx.config({
                        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: '', // 必填，公众号的唯一标识
                        timestamp:'' , // 必填，生成签名的时间戳
                        nonceStr: '', // 必填，生成签名的随机串
                        signature: '',// 必填，签名，见附录1
                        jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    });
                */
               wx.config(cfg);
               this.initFenxiang();
           }
           ,setDesc:function(_desc){
               desc = _desc;
               return this;
           }
           ,setTitle:function(_title){
               title = _title;
               return this;
           }
           ,setUrl:function(_url){
               linkUrl = _url;
               return this;
           }
       }
        return obj;
    })();

    var urlPath = (function() {
         var a = window.location.origin;
         var d = window.location.pathname.split("/");
         var c = a + "/";
         for (var b = 0; b < d.length - 1; b++) {
             if (d[b]) {
                 c += d[b] + "/"
             }
         }
         return c
     })();

var shareDescs = {
'freelist':'上海最完整的免费停车攻略！'
,'discover':'出发前用一下嘟嘟，发现目的地附近最省钱的停车场！'
};

    function geswxcfg(fn){
        window.myajax.get('weixin','getJsConfig',{url:window.location.href}, function(result){
            fn && fn(result.data);
        }, null, false);
    }
    function wxinit(cfginfo){
        /**
         * appId: "wx7402a94935807c76"
         * nonceStr: "OFXLWLTGSayHCOKL"
         * signature: "64f97be21281babd0728b683ef0b01934e0d4776"
         * timestamp: 1427710434
         * @type {*|String}
         */

        var type = utils.tools.getUrlParam('type') || '1';
        var model = utils.tools.getUrlParam('m');
        if('10' != type){
            var imgUrl = urlPath+'/img/icon.png';
             var lineLink = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd417c2e70f817f89&redirect_uri=http%3a%2f%2fdriver.duduche.me%2fdriver.php%2fhome%2fweixin%2fmenuCallBack%2f&response_type=code&scope=snsapi_base&state='+model+'#wechat_redirect';
            var descContent = shareDescs[model]?shareDescs[model]:"我在用嘟嘟停车，停车好方便";
             var shareTitle = '嘟嘟停车';
             Myweixinobj.init(shareTitle, descContent, lineLink, imgUrl, function(){
             });

             //封装微信 wx.cfg
             Myweixinobj.config(

                     {
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来
                        appId: cfginfo.appId, // 必填，公众号的唯一标识
                        timestamp: cfginfo.timestamp, // 必填，生成签名的时间戳
                        nonceStr: cfginfo.nonceStr, // 必填，生成签名的随机串
                        signature: cfginfo.signature,// 必填，签名
                        jsApiList: [
                            'checkJsApi',
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                            'onMenuShareQQ',
                            'onMenuShareWeibo',
                            'openLocation'
                        ] // 必填，需要使用的JS接口列表
                    }

             );
        }else{
            var hcode = utils.tools.getUrlParam('hcode') || '1';
            var fromid = utils.tools.getUrlParam('fromid') || '0';
            var imgUrl = urlPath+'/img/hongbao/fenxiang.jpg';
            var lineLink = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd417c2e70f817f89&redirect_uri={myurl}&response_type=code&scope=snsapi_base#wechat_redirect';
            var myurl = 'http://driver.duduche.me/driver.php/home/weixin/giftCallBack/type/10/hcode/{hcode}/fromid/{fromid}/';
            myurl = myurl.replace('{hcode}', hcode).replace('{fromid}', fromid);
            myurl = encodeURIComponent(myurl);
            lineLink = lineLink.replace('{myurl}', myurl);
             var descContent = "开车的小伙伴们，快来领嘟嘟停车红包吧!";
             var shareTitle = '嘟嘟停车发红包啦';
             Myweixinobj.init(shareTitle, descContent, lineLink, imgUrl, function(){

             });
             //封装微信 wx.cfg
             Myweixinobj.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来
                        appId: cfginfo.appId, // 必填，公众号的唯一标识
                        timestamp: cfginfo.timestamp, // 必填，生成签名的时间戳
                        nonceStr: cfginfo.nonceStr, // 必填，生成签名的随机串
                        signature: cfginfo.signature,// 必填，签名
                        jsApiList: [
                            'checkJsApi',
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                            'onMenuShareQQ',
                            'onMenuShareWeibo',
                            'openLocation'
                        ] // 必填，需要使用的JS接口列表
                    }

             );

        }
    }
    geswxcfg(function(data){
       wxinit(data);
    });
