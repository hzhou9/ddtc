/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_parkinfo(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            btdaohang:'[name=btdaohang]'
            ,address:'[name=address]'
            ,address2:'[name=address2]'
            ,bg:'[name=bg]'
            ,bg_map:'[name=bg_map]'
            ,name:'[name=name]'
            ,rules:'[name=rules]'
            ,spaces:'[name=spaces]'
            ,spaces_icon:'[name=spaces_icon]'
            ,numberstatus1:'[name=numberstatus1]'
            ,numberstatus2:'[name=numberstatus2]'
            ,numberstatus2t:'[name=numberstatus2t]'
            ,activity:'[name=activity]'
            ,tags:'[name=tags]'
            ,btios:'#map-list [name=btios]'
            ,btbaidu:'#map-list [name=btbaidu]'
            ,btgaode:'#map-list [name=btgaode]'
            ,btlocal:'#map-list [name=btlocal]'
            ,infoarea:'[name=infoarea]'
            ,reserve:'[name=reserve]'
            ,scrollparent:'[name=scrollparent]'
            ,bgbox:'[name=bgbox]'
            ,daohanglist:'#map_list'
            ,sharelist:'#share_list'
            ,action_list_bg:'#action-list-bg'
            ,close_map_list:'[name=close_map-list]'
            ,close_share_list:'[name=close_share-list]'
            ,tags_item:'.template [name=tags-item]'
            ,mytag:'[name=spaces] mytag'
            ,share:'#share_park_info'
        }
        ,iscroll:null
        ,nowdata:null
        ,extinfo:null
        ,init:function(context){
            if(!this.nowdata){
                context.hide();
                var model = utils.tools.getUrlParam('m');
                if('parkinfo' == model){
                    var shortname = utils.tools.getUrlParam('n');
                    var me = this;
                    window.myajax.get('Public','parkinfo',{'n':shortname},function(result){
                                      if(0 == result.code && result.data.p){
                                      me.setdata(result.data.p,result.data.e);
                                      me.init(context);
                                      }else{
                                      sysmanager.alert('参数错误，无法获得停车场信息');
                                      }
                                      },null,true);
                }
                return;
            }else{
                context.show();
            }
            if (!this.isInit){
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            this.c_init();
        }
        ,c_init:function(){
            var me = this;
            this.c_fill();
        }
        ,setdata:function(data,ext,showbt){
            this.nowdata =  data;
            this.extinfo = ext;
            this.showbt = showbt;
            this.c_tongji();
        }
        ,c_tongji:function() {

            var label = "";
            if (this.nowdata.c == 0) { // 信息化
                label = "A0";
            } else if (this.nowdata.c == 1) { // 收费
                label = "A1";
            } else if (this.nowdata.c == 2) { // 免费
                label = "A2";
            }

            if (null != this.nowdata.i) {
                label += "+B1"
            }

            window.TongjiObj.parkinfo('pv', label);

        }
        ,c_fill:function(){
            var me = this;
            this.dom.name.html(this.nowdata.n);
            me.dom.bg_map.find('img').attr('src',sysmanager.getMapimage(me.nowdata.lng,me.nowdata.lat,16,me.dom.bgbox.width(),me.dom.bgbox.height()));
            var imgurl = this.nowdata.i;
            if(this.extinfo && imgurl && imgurl != '' && imgurl.indexOf('http://') != 0){
                imgurl = this.extinfo.u+imgurl;
            }
            if(imgurl && imgurl != ''){
                me.dom.bg.find('img').attr('src',imgurl);
                me.dom.bg.find('img').load(function(){
                    me.dom.bg.show();
                    me.dom.bgbox.find('.mui-slider-indicator').show();
                    me.dom.bg_map.unbind().bind('touchstart',function (e){
                        me.dom.bg.show();
                        me.dom.bgbox.find('.mui-slider-indicator>div').toggleClass('mui-active');
                    });
                    me.dom.bg.unbind().bind('touchstart',function (e){
                        me.dom.bg.hide();
                        me.dom.bgbox.find('.mui-slider-indicator>div').toggleClass('mui-active');
                    });
                });
            }
            if(this.nowdata.b){
                this.dom.address2.html(this.nowdata.b).show();
            }else{
                this.dom.address2.hide();
            }
            
            if(this.nowdata.c == 2){//免费
                this.dom.spaces.html('本免费停车点信息由网友提供，我们已尽量检查，但仍可能有误哦。');
                this.dom.activity.parent().hide();
                if(this.nowdata.t){
                    var tags=this.nowdata.t.split("|");
                    for(var i=0;i<tags.length;i++){
                    var tagstr = window.cfg.freeparktags[tags[i]];
                    if(tagstr && tagstr != ''){var row = this.c_gettags(tagstr);this.dom.tags.append(row);}
                }}
            }else{
            this.dom.address.html(this.nowdata.a);
            this.dom.rules.html(this.nowdata.r);
            if(this.nowdata.s!==undefined && this.nowdata.s >= 0){
            this.dom.numberstatus1.html(window.cfg.parkstatestring2[this.nowdata.s]);
            if(this.nowdata.e && this.nowdata.e[1]){
                this.dom.numberstatus2.html(window.cfg.parkstatestring2[this.nowdata.e[0]]);
                this.dom.numberstatus2t.html(this.nowdata.e[1].substr(0,5));
                this.dom.mytag.show();
            }}else if(this.nowdata.startTime){
                this.dom.spaces.html('开始计费：'+this.nowdata.startTime);
            }else if(this.nowdata.o && this.nowdata.o[0] == 0){//非开放时段
                var openwd=(this.nowdata.o[1] == this.nowdata.o[2])?'不开放':this.nowdata.o[1].substr(0,5)+'~'+this.nowdata.o[2].substr(0,5);
                var openwe=(this.nowdata.o[3] == this.nowdata.o[4])?'不开放':this.nowdata.o[3].substr(0,5)+'~'+this.nowdata.o[4].substr(0,5);
                this.dom.spaces.html('非开放时段。开放时间：工作日<b>'+openwd+'</b>，休息日<b>'+openwe+'</b>');
            }else{
                this.dom.spaces.parent().hide();
            }
            if(this.nowdata.t){for(var i=0;i<this.nowdata.t.length;i++){
                var tagstr = this.nowdata.t[i];
                if(tagstr && tagstr != ''){
                var row = this.c_gettags(tagstr);
                this.dom.tags.append(row);
                }
            }}
            if(this.showbt){
                this.dom.reserve.show();
            }else{
                this.dom.reserve.hide();
            }
            if(this.nowdata.d){//活动
                if(this.nowdata.d[0] == 1){//停车只要1元
                    this.dom.activity.html('现在预订只要'+this.nowdata.d[1]+'元');
                }else{
                    this.dom.activity.html('现在预订优惠'+this.nowdata.d[1]+'元');
                }
            }else{
                this.dom.activity.hide();
            }
            }
            //是否显示滚动
            setTimeout(function () {
                var scrollheight = $('.userpage').parent().height();
                if (me.showbt) {
                    scrollheight -= me.dom.reserve.height();
                }
                var contentheight = me.dom.scrollparent.height();
                if (contentheight > scrollheight) {
                    me.dom.scrollparent.css('height', scrollheight - 44 + 'px');
                    me.iscroll = new iScroll(me.dom.infoarea[0], {desktopCompatibility: true});
                }
            });
        }
        ,c_gettags:function(str){
            var row = this.dom.tags_item.clone();
            row.html(str);
            return row;
        }
        ,c_daohang_ios_official:function(){
            var launcherinfo = {
                type: 'amap'
                ,dist: [this.nowdata.lat, this.nowdata.lng]
            };
            window.parent.postMessage(JSON.stringify({t: 'navi', d: launcherinfo}), '*');
            //var href='http://maps.apple.com/?q='+this.nowdata.address;
            //window.open(href, '_system');
        }

        ,c_daohang_baidu_app:function() {
            var launcherinfo = {
                type: 'baidu'
                ,dist: [this.nowdata.lat, this.nowdata.lng]
            };
            window.parent.postMessage(JSON.stringify({t: 'navi', d: launcherinfo}), '*');
        }

        ,c_daohang_baidu:function(){
            var iosinfo = {
            root:'baidumap://map/marker?'
                ,key: {
                src: '嘟嘟停车'            //应用名称
                    , location: this.nowdata.lat+','+this.nowdata.lng
                    , title: this.nowdata.n
                    , content: this.nowdata.a
                    , coord_type: 'gcj02'
                }
            };
            
            var androidinfo = {
            root:'bdapp://map/marker?'
                ,key: {
                src: '嘟嘟停车'            //应用名称
                    , location: this.nowdata.lat+','+this.nowdata.lng
                    , title: this.nowdata.n
                    , content: this.nowdata.a
                    , coord_type: 'gcj02'
                }
            };
            
            var info = utils.browser.versions.ios?iosinfo:androidinfo;
            
            var href = info.root;
            var first = true;
            for(var k in info.key){
                var v = info.key[k];
                if(!first){
                    href+='&';
                }else{
                    first = false;
                }
                href+=k+'='+v;
            }
            //alert(href);
            //console.log(href);
            window.open(href, '_system');
            
        }
        ,c_daohang_gaode_app:function() {
            var launcherinfo = {
                type: 'amap'
                ,dist: [this.nowdata.lat, this.nowdata.lng]
            };
            window.parent.postMessage(JSON.stringify({t: 'navi', d: launcherinfo}), '*');
        }
        ,c_daohang_gaode:function(){
            var iosinfo = {
            root:'iosamap://viewMap?'
                ,key: {
                sourceApplication: '嘟嘟停车'            //应用名称
                    , backScheme: ''                              //第三方调回使用的 scheme
                    , poiname: this.nowdata.n                             //poi 名称
                    , poiid: ''                             //sourceApplication的poi id
                    , lat: this.nowdata.lat                           //经度
                    , lon: this.nowdata.lng                             //纬度
                    , dev: 0                             //是否偏移(0:lat 和 lon 是已经加密后的,不需要国测加密; 1:需要国测加密
                    
                }
            };
            
            var androidinfo = {
            root:'androidamap://viewMap?'
                ,key: {
                sourceApplication: '嘟嘟停车'            //应用名称
                    //, backScheme: ''                              //第三方调回使用的 scheme
                    , poiname: this.nowdata.n                             //poi 名称
                    //, poiid: ''                             //sourceApplication的poi id
                    , lat: this.nowdata.lat                           //经度
                    , lon: this.nowdata.lng                             //纬度
                    , dev: 0                             //是否偏移(0:lat 和 lon 是已经加密后的,不需要国测加密; 1:需要国测加密
                    
                }
            };
            
            var info = utils.browser.versions.ios?iosinfo:androidinfo;
            
            var href = info.root;
            var first = true;
            for(var k in info.key){
                var v = info.key[k];
                if(!first){
                    href+='&';
                }else{
                    first = false;
                }
                href+=k+'='+v;
            }

            //alert(href);
            //console.log(href);
            window.open(href, '_system');

        }
        ,r_init:function(){
            var me = this;
            //if(utils.browser.versions.ios){
            //    me.dom.btios.show();
            //}

            me.dom.btdaohang.click(function(){

                window.TongjiObj.parkinfo('click', 'navi');

                if (sysmanager.isapp) {
                    if (utils.browser.versions.ios) {
                        me.c_daohang_ios_official();
                    } else {
                        me.dom.daohanglist.show();
                        me.dom.action_list_bg.show();
                    }
                } else {
                    if (window.Myweixinobj && window.Myweixinobj.isready) {
                        wx.openLocation({
                            latitude: parseFloat(me.nowdata.lat),
                            longitude: parseFloat(me.nowdata.lng),
                            name: me.nowdata.n,
                            address: me.nowdata.a,
                            scale: 16,
                            infoUrl: ''
                        });
                    } else {
                        sysmanager.loadpage('views/', 'daohang', null, '导航：' + me.nowdata.n,function(v) {
                            v.obj.settarget(me.nowdata);
                        });
                    }
                }
            });

            me.dom.btlocal.click(function(){
                window.TongjiObj.parkinfo('navi', 'local');
                sysmanager.loadpage('views/', 'daohang', null, '导航：'+me.nowdata.n,function(v){
                    v.obj.settarget(me.nowdata);
                });
                me.c_danghang_close();
            });

            me.dom.btios.click(function(){
                me.c_daohang_ios_official();
                me.c_danghang_close();
            });

            me.dom.btgaode.click(function(){
                window.TongjiObj.parkinfo('navi', 'gaode');
                if (sysmanager.isapp) {
                    me.c_daohang_gaode_app();
                } else {
                    me.c_daohang_gaode();
                }
                me.c_danghang_close();
            });

            me.dom.btbaidu.click(function(){
                window.TongjiObj.parkinfo('navi', 'baidu');
                if (sysmanager.isapp) {
                    me.c_daohang_baidu_app();
                } else {
                    me.c_daohang_baidu();
                }
                me.c_danghang_close();
            });

            me.dom.close_map_list.click(function(){
                me.c_danghang_close();
            });

            me.dom.close_share_list.click(function(){
                me.c_share_close();
            });

            me.dom.reserve.click(function(){
                window.TongjiObj.parkinfo('click', 'order');
                sysmanager.loadpage('views/', 'orderpay', null, '预订：' + me.nowdata.n,function(v){
                    v.obj.setdata(me.nowdata,me.extinfo);
                });
            });

            var title = '嘟嘟停车'
                , desc = '上海停车省钱神器'
                , url = 'http://app.duduche.me/redirect/user/indexhtml.php?m=parkinfo&n=' + me.nowdata.sn
                , thumb = null;

            if (sysmanager.isapp) {

                $('#share_to_friends').click(function() {
                    window.parent.postMessage(JSON.stringify({
                        t: 'wechatshare', d: {
                            scene: 1, // session
                            title: title,
                            description: desc,
                            url: url,
                            thumb: thumb
                        }
                    }), '*');
                    me.c_share_close();
                });

                $('#share_to_moments').click(function() {
                    window.parent.postMessage(JSON.stringify({
                        t: 'wechatshare', d: {
                            scene: 2, // timeline
                            title: title,
                            description: desc,
                            url: url,
                            thumb: thumb
                        }
                    }), '*');
                    me.c_share_close();
                });

                me.dom.share.click(function() {
                    me.dom.sharelist.show();
                    me.dom.action_list_bg.show();
                });

            } else {
                me.dom.share.hide();
                window.Myweixinobj.setDesc(desc).setTitle(title).setUrl(url).initBind();

            }
        }
        ,c_danghang_close:function(){
            this.dom.daohanglist.hide();
            this.dom.action_list_bg.hide();
        }
        ,c_share_close:function(){
            this.dom.sharelist.hide();
            this.dom.action_list_bg.hide();
        }
        ,close:function(){

        }
    };
    return  ui;
}
