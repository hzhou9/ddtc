/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_map() {
    var ui = {
        isInit: false
        , context: null
        , dom: {
            scrollarea: '[name=scrollarea]'
            , list: '.innerlist .park-list'
            , pointlist: '.innerlist [name=pointlist]'
            , row: '.template [name=row]'
            , row0: '.template [name=row0]'
            , row1: '.template [name=row1]'
            , rowfree: '.template [name=rowfree]'
            , nonerow: '.template [name=nonerow]'
            , tujianrow: '.template [name=tujianrow]'
            , areablock: '.template [name=areablock]'
            , mk1: '.template [name=mk1]'
            , destbar: {
                panel: '[name=searchbar]',
                txt: '[name=searchbar] b',
                bt: '[name=searchbar] [name=search]'
            }
        }
        , homecontrol: null
        , iscroll: null
        , mapObj: null
        , datas: null
        , userpos: null
        , pinitOffset : 0
        , finitOffset : 0
        , center: null
        , mm:0
        , page:0
        , placename: ''
        , init: function (context) {
            if (!this.isInit) {
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            this.c_init();
        }
        , c_init: function () {
            var me = this;

            me.c_searchPosition(function (placedata) {
                sysmanager.loadMapscript.load(function () {
                    me.c_initMap(function (center) {
                        me.dom.destbar.panel.show();
                        me.m_getdata(center, function (datas, area) {
                            me.c_addpoint(me.mapObj, datas);
                            me.c_fill(datas, area);
                        });
                    }, placedata);
                });
            });
        }
        , c_new_search: function () {
            var me = this;

            me.c_doSearch(function (placedata) {
                me.mapObj.clearMap();
                me.datas = null;
                me.mm = 0;
                me.page = 0;
                me.homecontrol.marker = null;
                me.mapObj.setCenter(placedata);
                me.mapObj.setZoom(15);
                setTimeout(function () {
                    me.homecontrol.setPosition(placedata, me.mapObj, true);
                    me.m_getdata(placedata, function (datas, area) {
                        me.c_addpoint(me.mapObj, datas);
                        me.c_fill(datas, area);
                    });
                });
            }, true);
        }
        , c_init_search: function (placedata) {
            var me = this;
            sysmanager.loadMapscript.load(function () {
                me.c_initMap(function (center) {
                    me.m_getdata(center, function (datas, area) {
                        me.c_addpoint(me.mapObj, datas);
                        me.c_fill(datas, area);
                    });
                }, placedata);
            });
        }
        , c_searchPosition: function (fn) {     //搜索地图

            var model = utils.tools.getUrlParam('m');
            if ('mapsearch' == model) {
                this.c_doSearch(fn);
            } else if ('discover' == model) {
                this.c_doDiscover(fn);
            } else {
                fn && fn(null);
            }
        }
        , c_doDiscover: function (fn) {
            var me = this;
            sysmanager.loadpage('views/', 'discover', $('#pop_pagecontaion'), '发现', function (view) {
                view.obj.onclose = function (placedata, name) {
                    if (placedata) {
                        fn && fn(placedata);
                        me.dom.destbar.txt.html(name);
                        me.placename = name;
                    }
                }
            });
        }
        , c_doSearch: function (fn, back) {
            var me = this;
            sysmanager.loadpage('views/', 'searchmap', $('#pop_pagecontaion'), '搜索地图', function (view) {
                if (back) {
                    view.obj.showclose = true;
                } else {
                    view.obj.showclose = false;
                }
                view.obj.onclose = function (placedata, name) {
                    fn && fn(placedata);
                    me.dom.destbar.txt.html(name);
                    me.placename = name;
                }
            });
        }
        , c_initMap: function (fn, placedata) {//fn 加载后的回调， placedata 预定义的地图搜索位置
            var me = this;
            var mapObj = this.mapObj = window.mapobj = new AMap.Map("map_html_mapid", {
                view: new AMap.View2D({
                    //创建地图二维视口
                    //center:position,//创建中心点坐标
                    zoom: 15, //设置地图缩放级别
                    rotation: 0 //设置地图旋转角度
                })
                , lang: "zh_cn"//设置地图语言类型，默认：中文简体
                , resizeEnable: true
            });//创建地图实例

            var homecontrol = this.homecontrol = new AMap.myHomeControl({
                offset: new AMap.Pixel(10, 100)
            });
            var maptool = null;

            mapObj.plugin(["AMap.ToolBar", "AMap.Scale"/*,"AMap.myHomeControl"*/], function () {

                //加载工具条
                maptool = window.maptool = new AMap.ToolBar({
                    direction: false,//隐藏方向导航
                    ruler: false,//隐藏视野级别控制尺
                    autoPosition: false//自动定位
//                       ,locationMarker1:new AMap.Marker({
//                           map:mapObj
//                           ,content:"<div style='width: 50px;height: 50px;border-radius: 25px;background-color: rgba(0,0,0,.2)'><div style='position: absolute;left: 50%;top:50%;width: 6px;height: 6px;border-radius: 3px;margin-left: -3px;margin-top: -3px;background-color:red'></div></div>"
                    , offset: new AMap.Pixel(10, 80)
//                       })
                });
                mapObj.addControl(maptool);
                //加载比例尺
                var scale = new AMap.Scale();
                mapObj.addControl(scale);
                //加载回原点
                //mapObj.addControl(homecontrol);
            });
            //window.mapobj1 = mapObj;
            if (mapObj.loaded) {
                onmapload(mapobj);
            } else {
                AMap.event.addListener(mapObj, 'complete', function () {
                    onmapload(mapobj);
                });
            }


            function onmapload(mapobj) {
                var center = mapobj.getCenter();
                homecontrol.setPosition(center, mapObj, true);
                //console.log(center);
                /**
                 * B: 39.9092295056561lat: 39.90923lng: 116.397428r: 116.39742799999999
                 */
                if (placedata) {
                    mapObj.setCenter(placedata);
                    setTimeout(function () {
                        homecontrol.setPosition(placedata, mapObj, true);
                        fn && fn(placedata);
                    });
                } else {
                    //setTimeout(function() {
                    //    window._map_location_callback = function(pos) {
                    //        // set location
                    //        var locposition = new AMap.LngLat(pos.position.lng, pos.position.lat);
                    //        mapObj.setCenter(locposition);
                    //        homecontrol.setPosition(locposition, mapObj, true);
                    //        me.userpos = locposition;
                    //        fn && fn(locposition);
                    //        // reset handler
                    //        window._map_location_callback = null;
                    //    };
                    //    window.parent.postMessage(JSON.stringify({t: 'setlocation'}), '*');
                    //});

                    /**
                     AMap.event.addListener(maptool,'location',function callback(e){
                        var locposition = e.lnglat;
                        homecontrol.setPosition(locposition, mapObj, true);
                        fn && fn(locposition);
                    });
                     maptool.doLocation();
                     */

                    /***/

                    var callbacking = false;
                    mapObj.plugin('AMap.Geolocation', function () {
                        var geolocation = new AMap.Geolocation({
                            enableHighAccuracy: true,//是否使用高精度定位，默认:true
                            timeout: 5000,          //超过10秒后停止定位，默认：无穷大
                            maximumAge: 60000,           //定位结果缓存0毫秒，默认：0
                            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                            showButton: false,        //显示定位按钮，默认：true
                            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                            showMarker: false,        //定位成功后在定位到的位置显示点标记，默认：true
                            showCircle: false,        //定位成功后用圆圈表示定位精度范围，默认：true
                            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
                            zoomToAccuracy: false      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                        });
                        mapObj.addControl(geolocation);

                        window.TongjiObj.map('geolocation', 'start');
                        AMap.event.addListener(geolocation, 'complete', function (arg) {
                            window.TongjiObj.map('geolocation', 'browser', arg.accuracy);
                            //console.log('定位成功:' + JSON.stringify(arg));
                            homecontrol.setPosition(arg.position, mapObj, true);
                            me.userpos = arg.position;
                            if (!callbacking) {
                                fn && fn(arg.position);
                            } else {
                                callbacking = true;
                            }

                            if (arg.accuracy == null) { // 高德使用IP定位精度返回为null
                                window.TongjiObj.map('geolocation', 'timeout');
                                setTimeout(function () {
                                    window._map_location_callback = function (pos) {
                                        if (null != pos) {
                                            window.TongjiObj.map('geolocation', 'native');
                                            // set location
                                            var locposition = new AMap.LngLat(pos.position.lng, pos.position.lat);
                                            mapObj.setCenter(locposition);
                                            homecontrol.setPosition(locposition, mapObj, true);
                                            me.userpos = locposition;
                                            fn && fn(locposition);
                                            // reset handler
                                            window._map_location_callback = null;
                                        }
                                    };
                                    window.parent.postMessage(JSON.stringify({t: 'setlocation'}), '*');
                                });
                            }
                        });//返回定位信息
                        AMap.event.addListener(geolocation, 'error', function () {
                            window.TongjiObj.map('geolocation', 'error');
                            setTimeout(function () {
                                window._map_location_callback = function (pos) {
                                    if (null != pos) {
                                        window.TongjiObj.map('geolocation', 'native');
                                        // set location
                                        var locposition = new AMap.LngLat(pos.position.lng, pos.position.lat);
                                        mapObj.setCenter(locposition);
                                        homecontrol.setPosition(locposition, mapObj, true);
                                        me.userpos = locposition;
                                        fn && fn(locposition);
                                        // reset handler
                                        window._map_location_callback = null;
                                    }
                                };
                                window.parent.postMessage(JSON.stringify({t: 'setlocation'}), '*');
                            });
                            //返回定位出错信息
                            //alert('当前环境不支持获取定位,请在设置中允许使用[位置定位服务]');
                        });
                        geolocation.getCurrentPosition();

                    });

                }

                /*mapObj.gotoHome = function(){
                 this.panTo(homecontrol.position);
                 }*/
            }

        }
        , r_init: function () {
            var me = this;
            this.iscroll = new iScroll(this.dom.scrollarea[0], {desktopCompatibility: true});

            this.dom.destbar.bt.click(function () {
                me.c_new_search();

                window.TongjiObj.map('click', 'search');
            });

        }
        , c_fill_free: function (datas) {//插入免费停车场
            var me = this;
            var offset = 30 * me.page+(me.mm==0?0:me.finitOffset);
            if (datas.f && datas.f.length > 0 && offset < datas.f.length) {
                var row0 = this.dom.row0.clone();
                row0.find('b').html(datas.f.length);
                var intro = null;
                var freelist = row0.find('ul');
                for (var i = 0;i < (me.mm == 0?datas.f.length:30) && i + offset < datas.f.length; i++) {
                    var row = this.c_getrow(datas.f[i+offset]);
                    freelist.append(row);
                    if (i+offset < 3) {
                        if (intro == null) {
                            intro = datas.f[i+offset].n;
                        } else {
                            intro = intro + '、' + datas.f[i+offset].n;
                        }
                    } else if (i+offset == 3) {
                        intro = intro + '等';
                    }
                }
                if (intro) {
                    row0.find('.park-free-intro').html(intro);
                }
                row0.find('[name=head]').fclick(function () {
                    freelist.toggle();
                    me.iscroll.refresh();
                });
                this.dom.list.append(row0);
            } else if (datas.a && datas.a.distance < 5000 && me.mm == 0) { //最近的免费停车场
                var row1 = this.dom.row1.clone();
                row1.find('b').html(datas.a.distance);
                row1.find('p').html(datas.a.n);
                row1.find('[name=head]').fclick(function () {
                    sysmanager.loadpage('views/', 'freelist', null, me.placename + '附近免费停车点', function (v) {
                        if (me.center) {
                            v.obj.setdata(me.center.lng, me.center.lat);
                        }
                    });
                    window.TongjiObj.map('click', 'free_list');
                });
                this.dom.list.append(row1);
            }
        }
        , c_fill: function (datas, area) {
            var me = this;
            if (me.mm == 0) {
                this.dom.list.empty().unbind();
            }
            if (datas.p && datas.p.length > 0) {
                var first = false;
                var offset = me.page * 30+(me.mm == 0?0:me.pinitOffset);
                for (var i = 0; i < (this.mm === 0?datas.p.length:30) && (i+offset)<datas.p.length; i++) {
                    if (!first && datas.p[i+offset].c == 0) {
                        first = true;
                        //插入免费停车场
                        this.c_fill_free(datas);
                    }
                    var row = this.c_getrow(datas.p[i+offset]);
                    this.dom.list.append(row);
                }
                if (this.mm == 0) {
                    this.dom.list.append("<li class='mui-table-view-cell'><button class='mui-btn-primary mui-btn-outlined mui-btn-block findMore'>查看更多</button></li>");//TODO;
                    $(".findMore").unbind('click').bind('click', searchMore);
                } else {
                    if (i+offset != datas.p.length) {
                        this.dom.list.append("<li class='mui-table-view-cell'><button class='mui-btn-primary mui-btn-outlined mui-btn-block pageNext'>查看更多</button></li>");//TODO;
                        $(".pageNext").unbind('click').bind('click', pageNext);
                    }
                }
                this.dom.pointlist.hide();
            } else {
                //插入免费停车场
                this.c_fill_free(datas);
                if (datas.f && datas.f.length > 0) {
                    this.dom.pointlist.find('[name=nonerow]').html('按商圈查看');
                } else {
                    this.dom.pointlist.find('[name=nonerow]').html('<div style="font-size:18px;margin-bottom:10px;">附近没有合作停车场</div><div>您可以尝试：</div>');
                }
                this.c_getnonerow(area);
                this.dom.pointlist.show();
            }

            setTimeout(function () {
                me.iscroll.refresh();
                setTimeout(function () {
                    //if (me.page == 0) {
                        //me.iscroll.scrollTo(0, 0);
                    //}
                });
            });
        }
        , c_addpoint: function (map, datas) {
            //if (this.mm == 1) {
            //    var $arr = $.merge(datas.f, datas.p);
            //    var offset = 20 * this.page;
            //    for (var i = 0; i < 20 && i < $arr.length; i++) {
            //        var data = $arr[i+offset];
            //        this.c_getpoint(map, data, i);
            //    }
            //} else {
            var offset = this.page * 30 + (this.mm == 0?0:this.pinitOffset);
                for (var i = 0; i < (this.mm == 0?datas.p.length:30) && (i+offset)<datas.p.length; i++) { // 信息化停车点
                    var data = datas.p[i+offset];
                    if (data === undefined) break;
                    this.c_getpoint(map, data, i+offset);
                }
            if (this.page == 0) {
                for (var i = 0; i < datas.f.length; i++) { // 免费停车点
                    var data = datas.f[i];
                    this.c_getpoint(map, data, i);
                }
            }
        }
        , c_getpoint: function (map, data, index) {
            var me = this;
            var content = this.dom.mk1.html();
            if (data.c == 2) {//免费
                content = content.replace('{0}', '免费').replace('{1}', data.c);
            } else {
                content = content.replace('{0}', '¥' + data.p).replace('{1}', (data.o && data.o[0] == 0) ? 'no' : data.c);
            }

            var marker = new AMap.Marker({
                map: map,
                position: data.point,
                icon: "",
                content: content,
                offset: new AMap.Pixel(-16, -64)
            });
            data.marker = marker;
            ~function(i, marker, data){
                AMap.event.addListener(marker,'touchstart',function(e){
                    var row = $("[shdataId="+data.id+"]");
                    if (data.c == 2) {
                        $("[name=row0] > ul").show();
                    } else {
                        $("[name=row0] > ul").hide();
                    }
                    me.c_setActiveRow(row, data, true, true);
                });
            }(index, marker, data);
        }
        , c_setActiveRow: function (row, data, elemmove, keepOtherMarkers) {
            this.dom.list.find('>*').removeClass('active');
            this.dom.list.find('[name=row0] ul>*').removeClass('active');
            row.addClass('active');
            if (keepOtherMarkers !== true) {
                for (var i = 0; i < this.datas.p.length; i++) {
                    if  (!this.datas.p[i].marker) {break;}
                    if (this.datas.p[i] == data) {
                        this.datas.p[i].marker.show();
                    } else {
                        this.datas.p[i].marker.hide();
                    }
                }
                for (var i = 0; i < this.datas.f.length; i++) {
                    if  (!this.datas.f[i].marker) {break;}
                    if (this.datas.f[i] == data) {
                        this.datas.f[i].marker.show();
                    } else {
                        this.datas.f[i].marker.hide();
                    }
                }
            }
            var vbounds = this.mapObj.getBounds();
            if (!vbounds.contains(data.point)) {
                this.mapObj.zoomOut();
                var me = this;
                setTimeout(function () {
                    var vbounds = me.mapObj.getBounds();
                    if (!vbounds.contains(data.point)) {//还未能显示点:跳到该点
                        me.mapObj.setCenter(data.marker.getPosition());
                    }
                }, 1000);
            }
            data.marker.setAnimation('AMAP_ANIMATION_DROP');
            data.marker.setTop(true);
            if (!!elemmove) {
                this.iscroll.scrollToElement(row[0], 200);
                this.iscroll.scrollToElement(row[0], 200);
            }

            if (data.c == 2) {
                window.TongjiObj.map("click", 'freepark');
            } else if (data.c == 1) {
                var shihui = false;
                for (c in data.t) {
                    if (data.t[c] == '实惠') {
                        shihui = true;
                    }
                }

                window.TongjiObj.map("click", 'orderable+A1' + shihui ? '+C1' : '');
            }
        }
        , c_activeRow: function (index, field) {
            if (field === 'f') {
                $(".park-list [name=row0] ul").css("display", "block");
                var row = this.dom.list.find("[name=rowfree]").eq(index);
            } else {
                $(".park-list [name=row0] ul").css("display", "none");
                var row = this.dom.list.find('>*').eq(index);
            }
            var data = this.datas[field][index];
            this.c_setActiveRow(row, data, true, true);
        }
        , c_getrow: function (data, index) {
            var me = this;
            var row = null;

            if (data.c == 2) {//免费
                row = this.dom.rowfree.clone();
                row.find('[name=title]').html(data.n);
                row.find('[name=distance]').html(data.distance);
                row.find('[name=desc ]').html(data.b);
            } else {
                row = this.dom.row.clone();
                row.find('[name=title]').html(data.n);
                row.find('[name=distance]').html(data.distance);
                data.r = data.r.replace(/<p>/g, "").replace(/<\/p>/g, "");
                row.find('[name=rules]').html(data.r);
                //row.find('[name=address]').html(data.a);
                if (data.o && data.o[0] == 0) {//现在不开放
                    row.find('[name=spaces]').remove();//不显示空位信息
                    if (data.o[1] == data.o[2]) {//工作日不开放
                        row.find('[name=openwd]').html('不开放');
                    } else {
                        row.find('[name=openwd]').html(data.o[1].substr(0, 5) + '~' + data.o[2].substr(0, 5));
                    }
                    if (data.o[3] == data.o[4]) {//休息日不开放
                        row.find('[name=openwe]').html('不开放');
                    } else {
                        row.find('[name=openwe]').html(data.o[3].substr(0, 5) + '~' + data.o[4].substr(0, 5));
                    }
                } else {//现在开放
                    row.find('[name=notopen]').remove();//不显示开放信息
                    if (data.c_t == 1) {
                        if (data.s >= 0) {
                            row.find('[name=numberstatus1]').html(window.cfg.parkstatestring2[data.s]);
                            if (data.e && data.e[1]) {
                                row.find('[name=numberstatus2]').html(window.cfg.parkstatestring2[data.e[0]]);
                                row.find('[name=numberstatus2t]').html(data.e[1].substr(0, 5));
                                row.find('mytag').show();
                            }
                        } else {
                            row.find('[name=spaces]').hide();
                        }
                    } else if (data.c_t == 2) {
                        if (data.s > 0) {
                            row.find('[name=spaces]').html("现有"+data.s+"个空位");
                        } else {
                            row.find('[name=preorder]').html("抢光了").addClass('tips-blue');
                            row.find('[name=activity]').hide();
                            row.find('[name=spaces]').hide();
                        }
                    }
                }
                if (data.d && data.c != 0) {//活动
                    if (data.d[0] == 1) {//停车只要1元
                        row.find('[name=activity]').html('现在预订只要' + data.d[1] + '元');
                    } else {
                        row.find('[name=activity]').html('现在预订优惠' + data.d[1] + '元');
                    }
                } else {
                    row.find('[name=activity]').remove();
                }

                if (data.c == 0) {//信息化
                    row.find('[name=preorder]').hide();
                    for (c in data.t) {
                        if (data.t[c] == '实惠') {
                            row.find('[name=benefits]').show();
                        }
                    }
                } else if (data.c == 1) {//收费

                }
            }

            row.attr("shDataId", data.id);

            row.fclick(function () {
                //data.marker.setAnimation('AMAP_ANIMATION_DROP');
                //me.mapObj.panTo(data.point);
                me.c_setActiveRow(row, data);
            });

            row.find('.mui-btn').click(function () {
                me.c_daohang_my(data);
            });

            return row;
        }
        , c_daohang_my: function (nowdata) {
            var me = this;
            sysmanager.loadpage('views/', 'parkinfo', null, nowdata.n, function (v) {
                v.obj.setdata(nowdata, me.datas.e, nowdata.c == 1);
            });
            var uid = myajax.uid();
            if (uid && uid > 41) {
                window.TongjiObj.D('D4');
            }

        }
        , c_getsub: function (sub, blocklist) {
            var block = this.dom.areablock.clone();
            if (sub) {
                var me = this;
                block.find('.mui-media-body').html(sub[0] + ' <small>(' + sub[3] + ')</small>');
                block.click(function () {
                    me.dom.destbar.txt.html(sub[0]);
                    var lnglat = new AMap.LngLat(sub[2], sub[1]);
                    //$(me).addClass('active');
                    me.c_init_search(lnglat);
                });
            }
            blocklist.append(block);
        }
        , c_getdefaultrow: function (data, pointlist) {
            var me = this;
            var row = this.dom.tujianrow.clone();
            row.find('[name=name]').html(data[0]);
            row.find('[name=desc]').html(data[1]);
            var expandbt = row.find('.mui-icon');
            var blocklist = row.find('[name=areablocks]');
            row.fclick(function () {
                if (expandbt.hasClass('mui-icon-arrowup')) {
                    expandbt.removeClass('mui-icon-arrowup');
                    expandbt.addClass('mui-icon-arrowdown');
                    row.find('.search_desc').show();
                } else {
                    expandbt.removeClass('mui-icon-arrowdown');
                    expandbt.addClass('mui-icon-arrowup');
                    row.find('.search_desc').hide();
                }
                blocklist.toggle();
                me.iscroll.refresh();
            });
            for (var j = 0; j < data[2].length; j++) {
                var sub = data[2][j];
                this.c_getsub(sub, blocklist);
            }
            var emptynum = data[2].length % 3;
            if (emptynum != 0) {
                while (emptynum < 3) {
                    this.c_getsub(null, blocklist);
                    emptynum++;
                }
            }
            pointlist.append(row);
        }
        , c_getnonerow: function (area) {
            if (this.tuijian_init) {//已初始化
                return;
            }
            if (area && !window.cfg.defaultpoint) {
                window.cfg.defaultpoint = area;
            } else if (!area && window.cfg.defaultpoint) {
                area = window.cfg.defaultpoint;
            }
            var me = this;
            area = area || [];
            for (var i = 0; i < area.length; i++) {
                var data = area[i];
                this.c_getdefaultrow(data, this.dom.pointlist);
            }
            if (area.length > 1) {
                this.tuijian_init = true;
            }
        }
        , m_getdata: function (center, fn) {
            this.center = center;
            var args = {lat: center.lat, lng: center.lng};
            var me = this;
            if (this.userpos) {
                args['curlat'] = this.userpos.lat;
                args['curlng'] = this.userpos.lng;
            }
            if (window.pushid) {
                args['pushid'] = window.pushid;
            }
            args['mm'] = me.mm;
            window.myajax.userget('public', 'search2', args, function (result) {
                var np = [], fp = [];
                if (me.datas !== null) {
                    np = me.datas.p.map(function(e){return e.id;});
                    fp = me.datas.f.map(function(e){return e.id;});
                }
                var data = result.data.p;
                var len = data.length;
                for (var i = 0; i < len; i++) {
                    var d = data[i];
                    d.point = new AMap.LngLat(d.lng, d.lat);
                    d.distance = Math.abs(parseInt(d.point.distance(center)));
                    d.p = parseInt(d.p);
                    var offset = $.inArray(d.id, np);
                    if (offset >= 0) {
                        data.splice(i, 1);
                        len-=1;
                        i-=1;
                    }
                }
                data = result.data.f;//免费停车场
                var len = data.length;
                for (var i = 0; i < len; i++) {
                    var d = data[i];
                    d.point = new AMap.LngLat(d.lng, d.lat);
                    d.distance = Math.abs(parseInt(d.point.distance(center)));
                    var offset = $.inArray(d.id, fp);
                    if (offset >= 0) {
                        data.splice(i, 1);
                        len-=1;
                        i-=1;
                    }
                }
                if (result.data.a) {//免费停车场补充信息
                    result.data.a.point = new AMap.LngLat(result.data.a.lng, result.data.a.lat);
                    result.data.a.distance = Math.abs(parseInt(result.data.a.point.distance(center)));
                }
                if (me.datas !== null) {
                    result.data.p.forEach(function(d) {
                        me.datas.p.push(d);
                    });
                    result.data.f.forEach(function(d) {
                        me.datas.f.push(d);
                    });
                } else {
                    me.finitOffset = result.data.f.length;
                    me.pinitOffset = result.data.p.length;
                    me.datas = result.data;
                }
                fn && fn(me.datas, result.area);

                // tracking
                var label = "nearby";
                if (me.placename.length > 0) {
                    label = "place:" + me.placename;
                }
                if (result.data.p.length > 0) {
                    var shihui = false, hezuo = false;
                    for (var i = 0; i < result.data.p.length; i++) {
                        var d = result.data.p[i];
                        if (d.c == 1) {
                            hezuo = true;
                        } else {
                            for (c in d.t) {
                                if (d.t[c] == '实惠') {
                                    shihui = true;
                                }
                            }
                        }
                    }

                    label += "+A1";
                    if (shihui) label += "+C1";
                    if (hezuo) label += "+D1";
                } else {
                    label += "+A0"
                }

                if (result.data.f.length > 0) {
                    label += "+B1";
                } else {
                    label += "+B0";
                }

                window.TongjiObj.map('pv', label);

                setTimeout(function () {
                    /**
                     *     列表中停车场全是满的状态：C1
                     列表中1000米范围内有可预定的停车场：C2
                     列表中1000～2000米范围内有可预定的停车场：C3
                     范围内无停车场的状态：C4
                     */
                    var datas = data;
                    var obj = {
                        C1: true
                        , C2: 0
                        , C3: 0
                        , C4: false
                    };
                    if (0 == datas.length) {
                        obj.C4 = true;
                        obj.C1 = false;
                    } else {
                        //data.parkstate+''
                        for (var i = 0; i < datas.length; i++) {
                            var d = datas[i];
                            if ('0' == d.parkstate + '') {

                            } else {
                                obj.C1 = false;  //没有全满
                            }
                            if (d.distance > 1000 && d.distance <= 2000) {
                                obj.C3++;
                            }
                            if (d.distance <= 1000) {
                                obj.C2++;
                            }
                        }
                    }
                    var uid = myajax.uid();
                    if (uid && uid > 41) {
                        for (var k in obj) {
                            if (obj[k]) {
                                window.TongjiObj.C(k);
                            }
                        }
                    }
                });
            }, null, false);
        }
        , close: function () {

        }
    };
    function searchMore() {
        $('.findMore').parents('li').remove();
        ui.mm = 1;
        ui.m_getdata(ui.center, function (datas, area) {
            ui.c_addpoint(ui.mapObj, datas);
            ui.c_fill(datas, area);
        });
    }
    function pageNext() {
        $(".pageNext").parents('li').remove();
        ui.page += 1;
        ui.c_addpoint(ui.mapObj, ui.datas);
        ui.c_fill(ui.datas, null);
    }
    return ui;
}
