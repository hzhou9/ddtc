/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_mapfull(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            list:'.innerlist>ul'
            ,row:'.template [name=row]'
            ,nonerow:'.template [name=nonerow]'
            ,listcontaion:'.list'

            ,bttitle:'[name=title]'

            ,daohangmenu:'[name=daohangmenu]'
            ,daohang_gaode:'[name=daohang_gaode]'
            ,daohang_my:'[name=daohang_my]'
            ,btclosemenu:'[name=btclosemenu]'
            ,mk1:'.template [name=mk1]'
            ,searchtxt:'[name=searchtxt]'
            ,infopanel:{
                panel:'[name=infopanel]'
                ,btback:'[name=infopanel] [name=btback]'
                ,btdaohang:'[name=infopanel] [name=btdaohang]'
                ,btpay:'[name=infopanel] [name=btpay]'
                ,title:'[name=infopanel] [name=title]'
                ,address:'[name=infopanel] [name=address]'
                ,note:'[name=infopanel] [name=note]'
                ,noteline:'[name=infopanel] [name=noteline]'
                ,rules:'[name=infopanel] [name=rules]'
                ,numberstatus:'[name=infopanel] [name=numberstatus]'
                ,numbermax:'[name=infopanel] [name=numbermax]'
                ,carid:'[name=infopanel] [name=carid]'
                ,btmodifycarid:'[name=infopanel] [name=btmodifycarid]'
                ,innerlist:'[name=infopanel] .innerpanellist>ul'
                ,dqpanel:'[name=infopanel] [name=dqpanel]'
                ,payinfo:'[name=infopanel] [name=payinfo] span'
                ,paytype:'[name=infopanel] [name=payinfo] [name=paytype]'

            }
            ,searchpanel:{
                searchpanel:'[name=searchpanel]'
                ,searchform:'[name=searchform]'
                ,searchtxt:'[name=searchtxt]'
                ,list:'[name=searchpanel] [name=list]'
                ,listpanel:'[name=searchpanel] [name=listpanel]'
                ,muiclear:'[name=searchpanel] [name=mui-icon-clear]'
                ,muiback:'[name=searchpanel] [name=mui-icon-back]'
                ,searchrow:'.template [name=searchrow]'
            }
            ,loadinfopanel:{
                panel:'[name=loadinfopanel]'
                ,info:'[name=info]'
            }
            ,detailinfo_local:{
                panel:'[name=detailinfo_local_panel]'
            }
            ,detailinfo_search:{
                panel:'[name=detailinfo_search_panel]'
            }
            ,infowindow:'[name=infowindow]'
        }
        ,iscroll:null
        ,infoiscroll:null
        ,mapObj:null
        ,datas:null
        ,nowdata:null
        ,dqselectdata:null
        ,nowoid:null
        ,homecontrol:null
        ,geolocation:null
        ,showSearchnumber:0
        ,searchNumber:0
        ,couponlist:null
        ,load_location:false            //当前是否在加载本地状态
        ,select_address:null               //当前选择的地址
        ,init:function(context){
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
            this.c_showLoadinfo('地图初始化中...')
            sysmanager.loadMapscript.load(function(){
                me.c_initMap(function(){
//                    me.m_getdata(center,function(datas){
//                        me.c_addpoint(me.mapObj,datas);
//                        me.c_fill(datas);
//                    });
                    me.dom.searchpanel.searchpanel.show();
                    me.c_loaction_findpoint();
                });

            });
        }
        ,c_showLoadinfo:function(txt){      //显示加载信息
            this.dom.loadinfopanel.panel.show();
            this.dom.loadinfopanel.info.html(txt);
            this.dom.detailinfo_local.panel.hide();
            this.dom.detailinfo_search.panel.hide();
        }
        ,c_showLocal_detail:function(position, datas){
            this.dom.loadinfopanel.panel.hide();
            this.dom.detailinfo_search.panel.hide();
            this.dom.detailinfo_local.panel.show();
        }
        ,c_showSearch_detail:function(){
            this.dom.loadinfopanel.panel.hide();
            this.dom.detailinfo_local.panel.hide();
            this.dom.detailinfo_search.panel.show();
        }
        ,c_initMap:function(fn){//fn 加载后的回调， placedata 预定义的地图搜索位置

              var mapObj = this.mapObj = window.mapobj = new AMap.Map("map_html_mapid",{
              view: new AMap.View2D({
                //创建地图二维视口
              //center:position,//创建中心点坐标
              zoom:16, //设置地图缩放级别
              rotation:0 //设置地图旋转角度
             }),
             lang:"zh_cn"//设置地图语言类型，默认：中文简体
            });//创建地图实例

                var homecontrol = this.homecontrol = new AMap.myHomeControl({
                    offset:new AMap.Pixel(10,100)
                });
            var maptool = null;
                mapObj.plugin(["AMap.ToolBar","AMap.Scale","AMap.myHomeControl"],function(){

                     //加载工具条
                    maptool = window.maptool = new AMap.ToolBar({
                       direction:false,//隐藏方向导航
                       ruler:false,//隐藏视野级别控制尺
                       autoPosition:false//自动定位
//                       ,locationMarker1:new AMap.Marker({
//                           map:mapObj
//                           ,content:"<div style='width: 50px;height: 50px;border-radius: 25px;background-color: rgba(0,0,0,.2)'><div style='position: absolute;left: 50%;top:50%;width: 6px;height: 6px;border-radius: 3px;margin-left: -3px;margin-top: -3px;background-color:red'></div></div>"
                            ,offset:new AMap.Pixel(10,180)
//                       })
                     });
                     mapObj.addControl(maptool);
                     //加载比例尺
                     var scale = new AMap.Scale();
                     mapObj.addControl(scale);
                       //加载回原点
                     mapObj.addControl(homecontrol);
               });
            //window.mapobj1 = mapObj;
            if(mapObj.loaded){
                onmapload(mapobj);
            }else{
                AMap.event.addListener(mapObj,'complete',function(){
                        onmapload(mapobj);
                });
            }


            function onmapload(mapobj){
                fn && fn();

            }
            function onmapload1(mapobj){
                var center = mapobj.getCenter();
                console.log(center);                /**
                 * B: 39.9092295056561lat: 39.90923lng: 116.397428r: 116.39742799999999
                 */
                if(placedata){
                    mapObj.setCenter(placedata);
                    setTimeout(function(){
                        homecontrol.setPosition(placedata,mapObj, true);
                        fn && fn(placedata);
                    });
                }else{
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
                            maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                            showButton: false,        //显示定位按钮，默认：true
                            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                            showMarker: false,        //定位成功后在定位到的位置显示点标记，默认：true
                            showCircle: false,        //定位成功后用圆圈表示定位精度范围，默认：true
                            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
                            zoomToAccuracy:false      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                        });
                        mapObj.addControl(geolocation);
                        AMap.event.addListener(geolocation, 'complete', function(arg){
                            //console.log('定位成功', arg);
                            homecontrol.setPosition(arg.position,mapObj, true);
                            if(!callbacking){
                                fn && fn(arg.position);
                            }else{
                                callbacking = true;
                            }
                        });//返回定位信息
                        AMap.event.addListener(geolocation, 'error', function(){
                            //返回定位出错信息
                            alert('当前环境不支持获取定位,请在设置中允许使用[位置定位服务]');
                        });
                        geolocation.getCurrentPosition();

                    });

                }
                mapObj.gotoHome = function(){
                    this.panTo(homecontrol.position);
                }
            }
        }
        ,c_loaction_findpoint:function(){       //通过当前坐标查询停车位
            var me = this;
            this.load_location = true;
            this.c_showLoadinfo('获取当前位置...');
            this.c_location(function(center){
                me.m_getdata(center,function(datas){
                    if(me.load_location){
                        me.load_location = false;
                        me.c_addpoint(me.mapObj,datas);
                        me.c_fill(datas);
                        me.c_showLocal_detail(center, datas);
                    }
                });
            });
        }
        ,c_location:function(fn){          //本地搜索停车位
            var me = this;
            var mapObj = this.mapObj;
            var geolocation = this.geolocation;
            var homecontrol = this.homecontrol;

            if(!geolocation){
                mapObj.plugin('AMap.Geolocation', function () {
                    var geolocation = this.geolocation = new AMap.Geolocation({
                        enableHighAccuracy: true,//是否使用高精度定位，默认:true
                        timeout: 5000,          //超过10秒后停止定位，默认：无穷大
                        maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                        convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                        showButton: false,        //显示定位按钮，默认：true
                        buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                        buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                        showMarker: false,        //定位成功后在定位到的位置显示点标记，默认：true
                        showCircle: false,        //定位成功后用圆圈表示定位精度范围，默认：true
                        panToLocation: false,     //定位成功后将定位到的位置作为地图中心点，默认：true
                        zoomToAccuracy:false      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    });
                    mapObj.addControl(geolocation);
                    AMap.event.addListener(geolocation, 'complete', function(arg){
                        console.log('定位成功', arg);
                        if(me.load_location){
                            homecontrol.setPosition(arg.position,mapObj, true);
                            mapObj.setCenter(arg.position);
                            fn && fn(arg.position);
                        }
                    });//返回定位信息
                    AMap.event.addListener(geolocation, 'error', function(){
                        //返回定位出错信息
                        alert('当前环境不支持获取定位,请在设置中允许使用[位置定位服务]');
                    });
                      geolocation.getCurrentPosition();
               });
            }else{
                geolocation.getCurrentPosition();
            }
        }
        ,c_search_PlaceSearch:function(){
            var me = this;
            var keywords = this.dom.searchtxt.val();
            if(keywords.length>0){
                var MSearch;
                var nowsearchNumber = this.searchNumber++;
                AMap.service(["AMap.PlaceSearch"], function() {
                    MSearch = new AMap.PlaceSearch({ //构造地点查询类
                        pageSize:10,
                        pageIndex:1,
                        city:"021" //城市
                    });
                    //关键字查询
                    MSearch.search(keywords, function(status, result){
                        if(status === 'complete' && result.info === 'OK'){
                            //console.log('nowsearchNumber',nowsearchNumber);

                            if(nowsearchNumber>=me.showSearchnumber){
                                me.showSearchnumber = nowsearchNumber;
                                //me.dom.testnumber.html(me.dom.testnumber.html()+','+nowsearchNumber);
                                me.c_search_PlaceSearch_callback(result);
                            }else{
                                //me.dom.testnumber.html(me.dom.testnumber.html()+','+ "<span style='color: red'>"+nowsearchNumber+'-'+me.showSearchnumber+"</span>" );
                            }
                        }
                    });
                });
            }
        }
        ,c_search_PlaceSearch_callback:function(data){
            console.log('c_search_PlaceSearch_callback',data);
            var me = this;
            this.dom.searchpanel.list.empty();
            if(!data.poiList.pois || data.poiList.pois.length<=0){
                var row = this.dom.searchpanel.searchrow.clone();
                row.html('<span style="color: red">没有查询到相关位置信息</span>');
                this.dom.searchpanel.list.append(row);
            }else{
                for(var i=0;i<data.poiList.pois.length;i++){
                    var row = this.c_getrow_PlaceSearch(data.poiList.pois[i]);
                    this.dom.searchpanel.list.append(row);
                }
            }
        }
        ,c_getrow_PlaceSearch:function(data){
            var me = this;
            var row = this.dom.searchpanel.searchrow.clone();
            row.find('[name=name]').html(data.name);
            row.click(function(){
                me.load_location = false;
                me.c_search_PlaceSearch_row_select(data);
            });
            return row;
        }
        ,c_search_PlaceSearch_row_select:function(data){//选择了一个搜索结果
            var me = this;
            this.select_address = data.name;
            this.dom.searchpanel.listpanel.hide();
            this.dom.searchpanel.searchtxt.val(data.name).blur();
            this.dom.searchpanel.searchpanel.addClass('select');
            this.m_getdata(data.location,function(datas){
                me.c_addpoint(me.mapObj,datas);
                me.c_fill(datas);
                me.homecontrol.setPosition(data.location,me.mapObj, true);
                me.mapObj.panTo(data.location);
            });
        }
        ,r_init:function(){
            var me = this;
            this.iscroll = new iScroll(this.dom.list[0], {desktopCompatibility:true});
            this.infoiscroll = new iScroll(this.dom.infopanel.innerlist[0], {desktopCompatibility:true});

            this.dom.infopanel.btback.aclick(function(){
                me.c_back();
            });
            this.dom.infopanel.btdaohang.aclick(function(){
                if(sysmanager.isapp){
                    me.c_daohang();
                }else{
                    me.c_daohang_my();
                }
            });
            this.dom.daohang_gaode.aclick(function(){
                me.c_daohang_gaode($(this));
            });
            this.dom.btclosemenu.aclick(function(){
               me.dom.daohangmenu.hide();
            });
            this.dom.daohang_my.aclick(function(){
                me.c_daohang_my();
            });
            //this.dom.bttitle.aclick(function(){alert('title');});
            this.dom.infopanel.btback.aclick(function(){
                me.dom.infopanel.panel.hide();
            });
            this.dom.infopanel.btpay.aclick(function(){
               me.c_startPay()
            });

            this.dom.infopanel.btmodifycarid.click(function(){
                me.c_modifycarid();
            });
            this.dom.searchpanel.searchtxt.bind('keyup', function(){
               me.c_search_PlaceSearch();
            });
            this.dom.searchpanel.searchtxt.bind('focus', function(){
                me.dom.searchpanel.searchpanel.addClass('keypress');
                me.dom.searchpanel.listpanel.show();

            });
            this.dom.searchpanel.searchtxt.bind('blur', function(){
                me.dom.searchpanel.searchpanel.removeClass('keypress');
                return false;
            });
            this.dom.searchpanel.muiclear.aclick(function(){
                me.dom.searchpanel.searchtxt.val(me.select_address || '').blur();
                me.dom.searchpanel.searchpanel.removeClass('keypress');
                me.dom.searchpanel.listpanel.hide();
                return false;
            }).click(function(){
                return false;
            });
            this.dom.searchpanel.muiback.aclick(function(){
                me.select_address = null;
                me.dom.searchpanel.searchpanel.removeClass('select');
                me.dom.searchpanel.searchtxt.val(me.select_address || '').blur();
                me.dom.searchpanel.listpanel.hide();
                me.c_loaction_findpoint();
                return false;
            }).click(function(){

                    return false;
            });
            this.dom.searchpanel.searchform.bind('submit', function(){
                setTimeout(function(){
                    me.c_search_PlaceSearch();
                });
               return false;
            });
            this.dom.infopanel.dqpanel.find('>a').click(function(){
                if(me.couponlist){
                    me.dom.infopanel.dqpanel.toggleClass('mui-active');
                    setTimeout(function(){
                       me.infoiscroll.refresh();
                    });
                }
            });
        }
        ,c_modifycarid:function(fn){
            var me = this;
            sysmanager.loadpage('views/', 'userinfo', null, '个人信息',function(v){

                v.obj.onclose = function(info){
                    var defaultcarid = null;
                    for(var i=0;i<info.carids.length;i++){
                        var d = info.carids[i];
                        if('1' == d.status+''){
                            defaultcarid = d.carid;
                            break;
                        }
                    }
                    me.dom.infopanel.carid.html(defaultcarid || '没有设置车牌');

                    for(var i=0;i<me.datas.length;i++){
                       me.datas[i].carid = defaultcarid;
                    }

                    fn && fn(defaultcarid);
                }
                v.obj.c_showquit(true);
            });
        }
        ,c_startPay:function(){
            var me = this;

            if(!this.nowdata.carid){
                this.c_modifycarid(function(carid){
                    if(carid){
                        innerpay();
                    }
                });
            }else{
                innerpay();
            }
            function innerpay(){
                me.m_startPay(me.nowdata.pid,(me.dqselectdata?me.dqselectdata.id:0), function(data){
                    me.nowoid = data.oid;
                    //alert(data.oid);
                    //return [alert('跳过支付直接成功![测试s]'), me.c_startPayok()];

                    WeixinJSBridge.invoke('getBrandWCPayRequest', data.paydata,function(res){
                        //WeixinJSBridge.log(res.err_msg);
                        //alert(res.err_code+'\n'+res.err_desc+'\n'+res.err_msg);
                         if('get_brand_wcpay_request:ok' == res.err_msg){
                             me.c_startPayok();
                         }else{
    //                         alert(res.err_msg);
                             me.c_startPayfalid();
                         }
                     });
                });
            }


        }
        ,c_startPayok:function(){           //预付款成功
            var me = this;
//            sysmanager.loadpage('views/', 'orderpay', null, '当前停车订单',function(view){
//                view.obj.c_initinfo(me.nowdata, me.nowoid);
//                view.obj.onclose = function(){
//
//                }
//            });

            sysmanager.loadpage('views/', 'myorderdetail', null, '订单明细',function(v){
                //v.obj.initoid(me.oid);
                v.obj.initWait(5000);
            });

        }
        ,c_startPayfalid:function(){        //预付款失败
            //alert('预付款失败');
            //this.c_startPayok();
        }
        ,c_fill:function(datas){
            var me = this;
            this.datas = datas;
            this.dom.list.empty();
            if(datas){
                for(var i=0;i<datas.length;i++){
                    var row = this.c_getrow(datas[i]);
                    this.dom.list.append(row);
                }
            }
            if(!datas || datas.length == 0){
                var row = this.c_getnonerow();
                this.dom.list.append(row);
            }
            setTimeout(function(){
                me.iscroll.refresh();
            });
        }
        ,c_addpoint:function(map,datas){

            for(var i=0;i<datas.length;i++){
                var data = datas[i];
                var maker = this.c_getpoint(map,data, i);

            }
        }
        ,c_getpoint:function(map,data, index){
            var me = this;
            var content = this.dom.mk1.html();
            content = content.replace('{0}', '¥'+data.prepay).replace('{1}',data.parkstate);
            var marker = new AMap.Marker({                 
              map:map,                 
              position:data.point,
              icon:"http://webapi.amap.com/images/0.png",
             content:content,
             offset:new AMap.Pixel(-10,-35)               
           });
            data.marker = marker;
            AMap.event.addListener(marker,'touchstart',function callback(e){
                me.c_activeRow(index);
            });
        }
        ,c_showinfo:function(data){
                    this.nowdata = data;
                    this.dqselectdata = null;       //清空当前选择的抵用券
        //            this.dom.listcontaion.addClass('next');
                    //fill
                    var me = this;
                    this.dom.infopanel.panel.show();
        //            this.dom.infopanel.btpay.html('确认,预付{0}元'.replace('{0}',data.prepay));
                    this.dom.infopanel.title.html(data.name);
                    this.dom.infopanel.address.html(data.address);
                    this.dom.infopanel.rules.html(data.rules);

                    this.dom.infopanel.numbermax.html(data.spacesum>0?(data.spacesum+'个'):'未知');
                    this.dom.infopanel.numberstatus.html(window.cfg.parkstatestring[data.parkstate]);

                    this.dom.infopanel.carid.html(data.carid || '没有设置车牌');

                    this.dom.infopanel.payinfo.html(data.prepay);
            
            if(data.pretype){
                this.dom.infopanel.paytype.html(data.pretype);
            }else{
                this.dom.infopanel.paytype.html('元');
            }

                    if(data.note){
                        this.dom.infopanel.note.html(data.note);
                        this.dom.infopanel.noteline.show();
                    }else{
                        this.dom.infopanel.noteline.hide();
                    }
                    this.c_showinfo_initcoupon(function(dqselectdata){
                        me.dqselectdata = dqselectdata;
                        if(!dqselectdata){
                            me.dom.infopanel.payinfo.html(data.prepay);
                        }else{
                            var m = Math.round(data.prepay)/100;
                            if('1' == dqselectdata.t+''){
                                m = 1;
                            }else{
                                m = m - dqselectdata.m;

                            }
                            m =  Math.round(m*100)/100;
                            if(m<0){
                                m = 0.1;
                            }
                            me.dom.infopanel.payinfo.html(m);
                        }
                    });

                    setTimeout(function(){
                       me.infoiscroll.refresh();
                    });
                }
        ,c_showinfo_initcoupon:function(onselect){          //初始化抵扣券信息
                    var me = this;
                    if(this.couponlist){
                        fillcouponinfo(this.couponlist);
                    }else{
                        loadcouponinfo();
                        this.m_getcoupon(function(data){
                           console.log(data);
                            var list = [];
                            if(data.coupon){
                                for(var k in data.coupon){
                                    var d = data.coupon[k];
                                    d.id = k;
                                    list.push(d);
                                }
                            }
                            list.sort(function(a,b){
                                return a.t - b.t;
                            });
                            setTimeout(function(){
                                if(0 == list.length){
                                    nonecouponinfo();
                                }else{
                                    me.couponlist = list;
                                    fillcouponinfo(me.couponlist);
                                }
                            },1000);
                        });
                    }
                    function loadcouponinfo(){
                        me.dom.infopanel.dqpanel.find('[name=couponinfo]').hide();
                        me.dom.infopanel.dqpanel.find('[name=couponinfo_none]').hide();
                        me.dom.infopanel.dqpanel.find('[name=couponinfo_select]').hide();
                        me.dom.infopanel.dqpanel.find('[name=selecttext]').hide();
                        me.dom.infopanel.dqpanel.find('[name=couponinfo_load]').show();
                        me.dom.infopanel.dqpanel.find('>a').removeClass('mui-navigate-right');
                    }
                    function nonecouponinfo(){
                        me.dom.infopanel.dqpanel.find('[name=couponinfo]').hide();
                        me.dom.infopanel.dqpanel.find('[name=couponinfo_none]').show();
                        me.dom.infopanel.dqpanel.find('[name=couponinfo_select]').hide();
                        me.dom.infopanel.dqpanel.find('[name=selecttext]').hide();
                        me.dom.infopanel.dqpanel.find('[name=couponinfo_load]').hide();
                        me.dom.infopanel.dqpanel.find('>a').removeClass('mui-navigate-right');
                    }
                    function fillcouponinfo(coupon){
                        me.dom.infopanel.dqpanel.find('[name=couponinfo]').show().find('span').html(coupon.length);
                        me.dom.infopanel.dqpanel.find('[name=selecttext]').show();
                        me.dom.infopanel.dqpanel.find('[name=couponinfo_select]').hide();
                        me.dom.infopanel.dqpanel.find('[name=couponinfo_none]').hide();
                        me.dom.infopanel.dqpanel.find('[name=couponinfo_load]').hide();
                        me.dom.infopanel.dqpanel.find('>a').addClass('mui-navigate-right');

                        var listui = me.dom.infopanel.dqpanel.find('[name=list]').empty();
                        var qurow_1= me.dom.infopanel.dqpanel.find('.template [name=row-1]');
                        var qurow_0= me.dom.infopanel.dqpanel.find('.template [name=row-0]');
                        var dqselectdata = null;

                        var list = coupon;
                        for(var i=0;i<list.length;i++){
                            var data = list[i];
                            var row = getcouponrow(data);
                            listui.append(row);
                        }

                        function getcouponrow(data){
                            var row = null;
                            switch (data.t+''){
                                case '-1':              //1元券
                                    row = qurow_1.clone();
                                    break;
                                case '0':               //抵消券
                                    row = qurow_0.clone();
                                    row.find('[name=money]').html(data.m);
                                    break;
                            }
                            row.click(function(){
                                couponrow_active(data, $(this));
                            });
                            return row;
                        }

                        function couponrow_active(data,row){
                            var clsname = 'mui-active'
                            if(dqselectdata && dqselectdata.id == data.id){           //选择后在选择：取消选择
                                dqselectdata = null;
                                row.removeClass(clsname);
                                me.dom.infopanel.dqpanel.find('[name=couponinfo]').show();
                                me.dom.infopanel.dqpanel.find('[name=couponinfo_select]').hide();

                            }else{      //选择
                                listui.find('>*').removeClass(clsname);
                                row.addClass(clsname);
                                me.dom.infopanel.dqpanel.find('[name=couponinfo]').hide();
                                me.dom.infopanel.dqpanel.find('[name=couponinfo_select]').show();
                                if('1' == data.t+''){       //支付一元
                                    me.dom.infopanel.dqpanel.find('[name=couponinfo_select]').html('只需支付1元');
                                }else{
                                    me.dom.infopanel.dqpanel.find('[name=couponinfo_select]').html('抵扣{0}元'.replace('{0}',data.m));
                                }
                                dqselectdata = data;
                            }
                            onselect && onselect(dqselectdata);
                        }
                    }
            }
        ,c_back:function(){
            this.dom.listcontaion.removeClass('next');
        }
        ,c_daohang:function(){
            var me = this;
            this.dom.daohangmenu.show();

        }
        ,c_daohang_gaode:function(alink){
            var me = this;

            var iosinfo = {
                root:'iosamap://navi?'
                ,ioskey: {
                    sourceApplication: 'dudutingche'            //应用名称
                    , backScheme: ''                              //第三方调回使用的 scheme
                    , poiname: ''                             //poi 名称
                    , poiid: ''                             //sourceApplication的poi id
                    , lat: this.nowdata.point.lat                           //经度
                    , lon: this.nowdata.point.lng                             //纬度
                    , dev: 1                             //是否偏移(0:lat 和 lon 是已经加密后的,不需要国测加密; 1:需要国测加密
                    , style: 2                       //导航方式：(=0：速度最快，=1：费用最少，=2：距离最短，=3：不走高速，=4：躲避拥堵，=5：不走高速且避免收费，=6：不走高速且躲避拥堵，=7：躲避收费和拥堵，=8：不走高速躲避收费和拥堵)
                }
            };

            var androidinfo = {
                root:'androidamap://navi?'
                ,ioskey: {
                    sourceApplication: 'dudutingche'            //应用名称
                    //, backScheme: ''                              //第三方调回使用的 scheme
                    , poiname: ''                             //poi 名称
                    //, poiid: ''                             //sourceApplication的poi id
                    , lat: this.nowdata.point.lat                           //经度
                    , lon: this.nowdata.point.lng                             //纬度
                    , dev: 1                             //是否偏移(0:lat 和 lon 是已经加密后的,不需要国测加密; 1:需要国测加密
                    , style: 2                       //导航方式：(=0：速度最快，=1：费用最少，=2：距离最短，=3：不走高速，=4：躲避拥堵，=5：不走高速且避免收费，=6：不走高速且躲避拥堵，=7：躲避收费和拥堵，=8：不走高速躲避收费和拥堵)
                }
            };
            //$(this).attr('href','iosamap://navi?sourceApplication=applicationName&backScheme=applicationScheme&poiname=fangheng&poiid=BGVIS&lat=36.547901&lon=104.258354&dev=1&style=2');


            var info = utils.browser.versions.ios?iosinfo:androidinfo;

            var href = info.root;
            var first = true;
            for(var k in info.ioskey){
                var v = info.ioskey[k];
                if(!first){
                    href+='&';
                }else{
                    first = false;
                }
                href+=k+'='+v;
            }
            //alert(href);
            console.log(href);

            alink.attr('href', href);
            setTimeout(function(){
                me.dom.daohangmenu.hide();
            },1e3);
            window.open(href, '_system');

        }
        ,c_daohang_my:function(){
            var me = this;
            setTimeout(function(){
                me.dom.daohangmenu.hide();
            },1e3);
            sysmanager.loadpage('views/', 'daohang', null, '导 航',function(v){
                v.obj.settarget(me.nowdata);
            });
        }
        ,c_setActiveRow:function(row, data, elemmove){
            this.dom.list.find('>*').removeClass('active');
            row.addClass('active');
            this.mapObj.setCenter(data.marker.getPosition());
            data.marker.setAnimation('AMAP_ANIMATION_DROP');
            data.marker.setTop(true);
            if(!!elemmove){
                this.iscroll.scrollToElement(row[0]);
            }
        }
        ,c_activeRow:function(index){
            var row = this.dom.list.find('>*').eq(index);
            var data = this.datas[index];
            this.c_setActiveRow(row,data, true);
            this.c_showInfowindow(data);
        }
        ,c_getrow:function(data, index){
            /**
             * address: "中山北路3300号"
             * lat: "31.232164"
             * lng: "121.476364"
             * marker: c
             * name: "环球港地下车库及5楼车库"
             * note: ""
             * parkstate: "2"
             * pid: "8"
             * prepay: "5"
             * rules: "5元/半小时，9元/小时，封顶72元，购物满200元可免费停车2小时"spacesum: "2200"
             * @type {*}
             *
             * parkstate 0-已满，1-较少，2-较多
             */
            var me = this;
            var row = this.dom.row.clone();
            row.find('[name=title]').html(data.name);
            row.find('[name=distance]>span').html(data.distance);
            row.find('[name=rules]').html(data.rules);
            row.find('[name=address]').html(data.address);

            row.bind('touchstart', function(){
                //data.marker.setAnimation('AMAP_ANIMATION_DROP');
                //me.mapObj.panTo(data.point);
                me.c_setActiveRow(row, data);
            });
            row.bind('touchend', function(){
//               me.mapObj.gotoHome();
            });
            var parkstatestring = window.cfg.parkstatestring[parseInt(data.parkstate)];

            switch(data.parkstate+''){
                case '0':
                    row.find('.mui-btn').css({
                        border: 'none'
                        ,color: '#999'
                        ,'background-color':'#eee'
                    }).html(parkstatestring);
                    break;
                case '1':
                case '2':
                    row.find('.mui-btn').click(function(){
                       me.c_showinfo(data);
                    });
                    break;
            }

            return row;
        }
        ,c_getnonerow:function(){
            var nonerow = this.dom.nonerow.clone();
            return nonerow;
        }
        ,
        /**
         * 显示一个指定地图标记的信息窗口
         * @param market
         * @param data
         */
        c_showInfowindow:function(data){
            var me = this;
            var row = this.dom.infowindow.clone();

            var me = this;

            row.find('[name=title]').html(data.name);
            row.find('[name=distance]>span').html(data.distance);
            row.find('[name=rules]').html(data.rules);
            row.find('[name=address]').html(data.address);
            row.find('[name=prepay]').html(data.prepay);
            var parkstatestring = window.cfg.parkstatestring[parseInt(data.parkstate)];

            switch(data.parkstate+''){
                case '0':
                    row.find('.mui-btn').css({
                        border: 'none'
                        ,color: '#999'
                        ,'background-color':'#eee'
                    }).html(parkstatestring);
                    break;
                case '1':
                case '2':
                    row.find('.mui-btn').click(function(){
                       me.c_showinfo(data);
                    });
                    break;
            }
            var funcclickname = 'mapfull_btn_calick';
            window[funcclickname] = function(){
                console.log(data);
                me.c_showinfo(data);
            }

            row.find('.mui-btn').attr('onclick','window["{0}"]()'.replace('{0}',funcclickname));

            var inforWindow = new AMap.InfoWindow({
              offset:new AMap.Pixel(0,-5),
              content:row.html(),
                isCustom:true      //显示自己定义的窗体
            });
            setTimeout(function(){
                inforWindow.open(me.mapObj,data.marker.getPosition());
            },500);
        }
        ,m_getdata:function(center, fn){
            var clng = center.lng;
            var clat = center.lat;
            window.myajax.userget('index','search',{lat:clat,lng:clng}, function(result){
                var data = result.data;
                for(var i=0;i<data.length;i++){
                    var d = data[i];
                    d.point = new AMap.LngLat(d.lng, d.lat);
                    d.distance = Math.abs(parseInt(d.point.distance(center)));
                    d.prepay = parseInt(d.prepay);
                }
                fn && fn(result.data);
            }, null, false);
        }
        ,m_getdata1:function(center, fn){
            var clng = center.lng;
            var clat = center.lat;
            var datas = [];
            for(var i=0;i<10;i++){
                var lng = clng+GetRandomNum(-0.004,0.004);
                var lng = clng+GetRandomNum(-0.004,0.004);
                var lat = clat+GetRandomNum(-0.0025,0.0025);
                var point = new AMap.LngLat(lng,lat);
                (function(point){
                    var data = {
                        point:point
                        ,name:'第{0}街，第{0}号'.replace('{0}',i).replace('{0}',i)
                        ,distance:Math.abs(parseInt(point.distance(center)))+'米'
                    }
                    datas.push(data);
                })(point);
            }
            datas.sort(function(a,b){
                return parseInt(a.distance) - parseInt(b.distance);
            });
            function GetRandomNum(Min,Max){
                    var Range = Max - Min;
                    var Rand = Math.random();
                    return(Min + Rand * Range);
            }
            fn && fn(datas);
        }
        ,m_startPay:function(pid,cid, fn){
            window.myajax.userget('index','genorder',{pid:pid,cid:cid?cid:0}, function(result){
                fn && fn(result.data);
            }, null, false);
        }
        ,m_getcoupon:function(fn){      //获取抵扣我的券列表
            window.myajax.userget('index','listMyCoupons',{all:1}, function(result){
                fn && fn(result.data);
            }, null, false);
            setTimeout(function(){sysmanager.loading.hide();});
        }
        ,close:function(){

        }
    };
    return  ui;
}
