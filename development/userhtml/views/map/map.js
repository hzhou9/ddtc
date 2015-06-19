/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_map(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            scrollarea:'[name=scrollarea]'
            ,list:'.innerlist .park-list'
            ,pointlist:'.innerlist [name=pointlist]'
            ,row:'.template [name=row]'
            ,row0:'.template [name=row0]'
            ,row1:'.template [name=row1]'
            ,rowfree:'.template [name=rowfree]'
            ,nonerow:'.template [name=nonerow]'
            ,tujianrow:'.template [name=tujianrow]'
            ,areablock:'.template [name=areablock]'
            ,mk1:'.template [name=mk1]'
            ,destbar:{
                panel:'[name=searchbar]',
                txt:'[name=searchbar] b',
                bt:'[name=searchbar] [name=search]'
            }
        }
        ,homecontrol:null
        ,iscroll:null
        ,mapObj:null
        ,datas:null
        ,userpos:null
        ,center:null
        ,placename:''
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

            me.c_searchPosition(function(placedata){
                sysmanager.loadMapscript.load(function(){
                    me.c_initMap(function(center){
                        me.dom.destbar.panel.show();
                        me.m_getdata(center,function(datas,area){
                            me.c_addpoint(me.mapObj,datas);
                            me.c_fill(datas,area);
                        });
                    }, placedata);
                });
            });
        }
        ,c_new_search:function(){
            var me = this;
            
            me.c_doSearch(function(placedata){
                me.mapObj.clearMap();me.homecontrol.marker = null;
                me.mapObj.setCenter(placedata);
                me.mapObj.setZoom(15);
                setTimeout(function(){
                    me.homecontrol.setPosition(placedata,me.mapObj, true);
                    me.m_getdata(placedata,function(datas,area){
                        me.c_addpoint(me.mapObj,datas);
                        me.c_fill(datas,area);
                    });
                });
            },true);
        }
        ,c_init_search:function(placedata){
            var me = this;
            sysmanager.loadMapscript.load(function(){
                me.c_initMap(function(center){
                    me.m_getdata(center,function(datas,area){
                        me.c_addpoint(me.mapObj,datas);
                        me.c_fill(datas,area);
                    });
                }, placedata);
            });
        }
        ,c_searchPosition:function(fn){     //搜索地图

            var model = utils.tools.getUrlParam('m');
            if('mapsearch' == model){
                this.c_doSearch(fn);
            }else if('discover' == model){
                this.c_doDiscover(fn);
            }else{
                fn && fn(null);
            }
        }
        ,c_doDiscover:function(fn){
            var me = this;
            sysmanager.loadpage('views/', 'discover', $('#pop_pagecontaion'),'发现', function(view){
                                view.obj.onclose = function(placedata,name){
                                if(placedata){
                                fn && fn(placedata);
                                me.dom.destbar.txt.html(name);
                                    me.placename=name;
                                }
                                }
                                });
        }
        ,c_doSearch:function(fn,back){
            var me = this;
            sysmanager.loadpage('views/', 'searchmap', $('#pop_pagecontaion'),'搜索地图', function(view){
                if(back){
                    view.obj.showclose = true;
                }else{
                    view.obj.showclose = false;
                }
                view.obj.onclose = function(placedata,name){
                    fn && fn(placedata);
                    me.dom.destbar.txt.html(name);
                    me.placename=name;
                }
            });
        }
        ,c_initMap:function(fn, placedata){//fn 加载后的回调， placedata 预定义的地图搜索位置
            var me = this;
              var mapObj = this.mapObj = window.mapobj = new AMap.Map("map_html_mapid",{
              view: new AMap.View2D({
                //创建地图二维视口
              //center:position,//创建中心点坐标
              zoom:15, //设置地图缩放级别
              rotation:0 //设置地图旋转角度
             })
             ,lang:"zh_cn"//设置地图语言类型，默认：中文简体
             ,resizeEnable:true
            });//创建地图实例

                var homecontrol = this.homecontrol = new AMap.myHomeControl({
                    offset:new AMap.Pixel(10,100)
                });
            var maptool = null;

                mapObj.plugin(["AMap.ToolBar","AMap.Scale"/*,"AMap.myHomeControl"*/],function(){

                     //加载工具条
                    maptool = window.maptool = new AMap.ToolBar({
                       direction:false,//隐藏方向导航
                       ruler:false,//隐藏视野级别控制尺
                       autoPosition:false//自动定位
//                       ,locationMarker1:new AMap.Marker({
//                           map:mapObj
//                           ,content:"<div style='width: 50px;height: 50px;border-radius: 25px;background-color: rgba(0,0,0,.2)'><div style='position: absolute;left: 50%;top:50%;width: 6px;height: 6px;border-radius: 3px;margin-left: -3px;margin-top: -3px;background-color:red'></div></div>"
                            ,offset:new AMap.Pixel(10,80)
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
            if(mapObj.loaded){
                onmapload(mapobj);
            }else{
                AMap.event.addListener(mapObj,'complete',function(){
                        onmapload(mapobj);
                });
            }


            function onmapload(mapobj){
                var center = mapobj.getCenter();
                homecontrol.setPosition(center,mapObj, true);
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
                            me.userpos = arg.position;
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
                /*mapObj.gotoHome = function(){
                    this.panTo(homecontrol.position);
                }*/
            }

        }
        ,r_init:function(){
            var me = this;
            this.iscroll = new iScroll(this.dom.scrollarea[0], {desktopCompatibility:true});
            
            this.dom.destbar.bt.click(function(){
                me.c_new_search();

                window.TongjiObj.map('click', 'search');
            });

        }
        ,c_fill_free:function(datas){//插入免费停车场
            if(datas.f && datas.f.length > 0){
                var row0 = this.dom.row0.clone();
                row0.find('b').html(datas.f.length);
                var intro = null;
                var freelist = row0.find('ul');
                for(var i=0;i<datas.f.length;i++){
                    var row = this.c_getrow(datas.f[i]);
                    freelist.append(row);
                    if(i < 3){
                        if(intro == null){
                            intro = datas.f[i].n;
                        }else{
                            intro = intro+'、'+datas.f[i].n;
                        }
                    }else if(i == 3){
                        intro = intro+'等';
                    }
                }
                if(intro){
                    row0.find('.park-free-intro').html(intro);
                }
                row0.find('[name=head]').aclick(function(){freelist.toggle();});
                this.dom.list.append(row0);
            }else if(datas.a && datas.a.distance < 5000){ //最近的免费停车场
                var me = this;
                var row1 = this.dom.row1.clone();
                row1.find('b').html(datas.a.distance);
                row1.find('p').html(datas.a.n);
                row1.find('[name=head]').aclick(function(){
                    sysmanager.loadpage('views/', 'freelist', null, me.placename+'附近免费停车点',function(v){if(me.center){v.obj.setdata(me.center.lng,me.center.lat);}});
                    window.TongjiObj.map('click', 'free_list');
                });
                this.dom.list.append(row1);
            }
        }
        ,c_fill:function(datas,area){
            var me = this;
            this.datas = datas;
            this.dom.list.empty().unbind();
            if(datas.p && datas.p.length > 0){
                var first = false;
                for(var i=0;i<datas.p.length;i++){
                    if(!first && datas.p[i].c == 0){
                        first = true;
                        //插入免费停车场
                        this.c_fill_free(datas);
                    }
                    var row = this.c_getrow(datas.p[i]);
                    this.dom.list.append(row);
                }
                this.dom.pointlist.hide();
            }else{
                //插入免费停车场
                this.c_fill_free(datas);
                if(datas.f && datas.f.length > 0){
                    this.dom.pointlist.find('[name=nonerow]').html('按商圈查看');
                }else{
                    this.dom.pointlist.find('[name=nonerow]').html('<div style="font-size:18px;margin-bottom:10px;">附近没有合作停车场</div><div>您可以尝试：</div>');
                }
                this.c_getnonerow(area);
                this.dom.pointlist.show();
            }
            
            setTimeout(function(){
                me.iscroll.refresh();
                setTimeout(function(){me.iscroll.scrollTo(0,0);});
            });
        }
        ,c_addpoint:function(map,datas){
            for(var i=0;i<datas.p.length;i++){ // 信息化停车点
                var data = datas.p[i];
                this.c_getpoint(map,data, i);
            }
            for(var i=0;i<datas.f.length;i++){ // 免费停车点
                var data = datas.f[i];
                this.c_getpoint(map,data, i);
            }
        }
        ,c_getpoint:function(map,data, index){
            var me = this;
            var content = this.dom.mk1.html();
            if(data.c==2){//免费
                content = content.replace('{0}', '免费').replace('{1}',data.c);
            }else{
                content = content.replace('{0}', '¥'+data.p).replace('{1}',(data.o && data.o[0] == 0)?'no':data.c);
            }
            
            var marker = new AMap.Marker({
              map:map,
              position:data.point,
              icon:"",
             content:content,
             offset:new AMap.Pixel(-16,-64)
           });
            data.marker = marker;
            /*AMap.event.addListener(marker,'touchstart',function callback(e){
                me.c_activeRow(index);
            });*/
        }
        ,c_setActiveRow:function(row, data, elemmove){
            this.dom.list.find('>*').removeClass('active');
            this.dom.list.find('[name=row0] ul>*').removeClass('active');
            row.addClass('active');
            for(var i=0;i<this.datas.p.length;i++){
                if(this.datas.p[i] == data){
                    this.datas.p[i].marker.show();
                }else{
                    this.datas.p[i].marker.hide();
                }
            }
            for(var i=0;i<this.datas.f.length;i++){
                if(this.datas.f[i] == data){
                    this.datas.f[i].marker.show();
                }else{
                    this.datas.f[i].marker.hide();
                }
            }
            var vbounds = this.mapObj.getBounds();
            if(!vbounds.contains(data.point)){
                this.mapObj.zoomOut();
                var me = this;
                setTimeout(function(){
                    var vbounds = me.mapObj.getBounds();
                    if(!vbounds.contains(data.point)){//还未能显示点:跳到该点
                        me.mapObj.setCenter(data.marker.getPosition());
                    }
                },1000);
            }
            data.marker.setAnimation('AMAP_ANIMATION_DROP');
            data.marker.setTop(true);
            if(!!elemmove){
                this.iscroll.scrollToElement(row[0]);
                this.iscroll.scrollToElement(row[0]);
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
        ,c_activeRow:function(index){
            var row = this.dom.list.find('>*').eq(index);
            var data = this.datas[index];
            this.c_setActiveRow(row,data, true);
        }
        ,c_getrow:function(data, index){
            var me = this;
            var row = null;
            
            if(data.c == 2){//免费
                row = this.dom.rowfree.clone();
                row.find('[name=title]').html(data.n);
                row.find('[name=distance]').html(data.distance);
                row.find('[name=desc ]').html(data.b);
            }else{
            row = this.dom.row.clone();
            row.find('[name=title]').html(data.n);
            row.find('[name=distance]').html(data.distance);
            data.r = data.r.replace(/<p>/g, "").replace(/<\/p>/g, "");
            row.find('[name=rules]').html(data.r);
            //row.find('[name=address]').html(data.a);
        if(data.o && data.o[0] == 0){//现在不开放
            row.find('[name=spaces]').remove();//不显示空位信息
            if(data.o[1] == data.o[2]){//工作日不开放
                row.find('[name=openwd]').html('不开放');
            }else{
                row.find('[name=openwd]').html(data.o[1].substr(0,5)+'~'+data.o[2].substr(0,5));
            }
            if(data.o[3] == data.o[4]){//休息日不开放
                row.find('[name=openwe]').html('不开放');
            }else{
                row.find('[name=openwe]').html(data.o[3].substr(0,5)+'~'+data.o[4].substr(0,5));
            }
        }else{//现在开放
            row.find('[name=notopen]').remove();//不显示开放信息
            if(data.s >= 0){
            row.find('[name=numberstatus1]').html(window.cfg.parkstatestring2[data.s]);
            if(data.e && data.e[1]){
                row.find('[name=numberstatus2]').html(window.cfg.parkstatestring2[data.e[0]]);
                row.find('[name=numberstatus2t]').html(data.e[1].substr(0,5));
                row.find('mytag').show();
            }}else{
                row.find('[name=spaces]').hide();
            }
        }
            if(data.d){//活动
                if(data.d[0] == 1){//停车只要1元
                    row.find('[name=activity]').html('现在预订只要'+data.d[1]+'元');
                }else{
                    row.find('[name=activity]').html('现在预订优惠'+data.d[1]+'元');
                }
            }else{
                row.find('[name=activity]').remove();
            }
            
            if(data.c == 0){//信息化
                row.find('[name=preorder]').hide();
                for (c in data.t) {
                    if (data.t[c] == '实惠') {
                        row.find('[name=benefits]').show();
                    }
                }
            }else if(data.c == 1) {//收费

            }
            }

            row.click(function(){
                //data.marker.setAnimation('AMAP_ANIMATION_DROP');
                //me.mapObj.panTo(data.point);
                me.c_setActiveRow(row, data);
            });
            
            row.find('.mui-btn').click(function(){
                me.c_daohang_my(data);
            });

            return row;
        }
        ,c_daohang_my:function(nowdata){
            var me = this;
            sysmanager.loadpage('views/', 'parkinfo', null, nowdata.n,function(v){
                v.obj.setdata(nowdata,me.datas.e,nowdata.c == 1);
            });
            var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.D('D4');}
            
        }
        ,c_getsub:function(sub,blocklist){
            var block = this.dom.areablock.clone();
            if(sub){
                var me = this;
                block.find('.mui-media-body').html(sub[0]);
                block.click(function(){
                        me.dom.destbar.txt.html(sub[0]);
                        var lnglat = new  AMap.LngLat(sub[2], sub[1]);
                        //$(me).addClass('active');
                        me.c_init_search(lnglat);
                        });
            }
            blocklist.append(block);
        }
        ,c_getdefaultrow:function(data,pointlist){
            var me = this;
            var row = this.dom.tujianrow.clone();
            row.find('[name=name]').html(data[0]);
            row.find('[name=desc]').html(data[1]);
            var expandbt = row.find('.mui-icon');
            var blocklist = row.find('[name=areablocks]');
            expandbt.aclick(function(){
                      if(expandbt.hasClass('mui-icon-arrowup')){
                      expandbt.removeClass('mui-icon-arrowup');
                      expandbt.addClass('mui-icon-arrowdown');
                          row.find('.search_desc').show();
                      }else{
                      expandbt.removeClass('mui-icon-arrowdown');
                      expandbt.addClass('mui-icon-arrowup');
                          row.find('.search_desc').hide();
                      }
                      blocklist.toggle();
                      me.iscroll.refresh();
                      });
            for(var j=0;j<data[2].length;j++){
                var sub = data[2][j];
                this.c_getsub(sub,blocklist);
            }
            var emptynum = data[2].length%3;
            if(emptynum != 0){
                while(emptynum < 3){
                    this.c_getsub(null,blocklist);
                    emptynum++;
                }
            }
            pointlist.append(row);
        }
        ,c_getnonerow:function(area){
            if(this.tuijian_init){//已初始化
                return;
            }
            if(area && !window.cfg.defaultpoint){
                window.cfg.defaultpoint = area;
            }else if(!area && window.cfg.defaultpoint){
                area = window.cfg.defaultpoint;
            }
            var me = this;
            area = area || [];
            for(var i=0;i<area.length;i++){
                var data = area[i];
                this.c_getdefaultrow(data,this.dom.pointlist);
            }
            if(area.length > 1){
                this.tuijian_init = true;
            }
        }
        ,m_getdata:function(center, fn){
            this.center = center;
            var args = {lat:center.lat,lng:center.lng};
            var me = this;
            if(this.userpos){
                args['curlat'] = this.userpos.lat;
                args['curlng'] = this.userpos.lng;
            }
            window.myajax.userget('public','search2', args, function(result){
                var data = result.data.p;
                for(var i=0;i<data.length;i++){
                    var d = data[i];
                    d.point = new AMap.LngLat(d.lng, d.lat);
                    d.distance = Math.abs(parseInt(d.point.distance(center)));
                    d.p = parseInt(d.p);
                }
                data = result.data.f;//免费停车场
                for(var i=0;i<data.length;i++){
                    var d = data[i];
                    d.point = new AMap.LngLat(d.lng, d.lat);
                    d.distance = Math.abs(parseInt(d.point.distance(center)));
                }
                if(result.data.a){//免费停车场补充信息
                    result.data.a.point = new AMap.LngLat(result.data.a.lng, result.data.a.lat);
                    result.data.a.distance = Math.abs(parseInt(result.data.a.point.distance(center)));
                }
                fn && fn(result.data,result.area);

                // tracking
                var label = "nearby";
                if (me.placename.length > 0) {
                    label = "place:" + me.placename;
                }
                if (result.data.p.length > 0) {
                    var shihui = false, hezuo = false;
                    for(var i=0;i<result.data.p.length;i++){
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

                setTimeout(function(){
                    /**
                     *     列表中停车场全是满的状态：C1
                         列表中1000米范围内有可预定的停车场：C2
                         列表中1000～2000米范围内有可预定的停车场：C3
                         范围内无停车场的状态：C4
                      */
                    var datas = data;
                    var obj = {
                        C1:true
                        ,C2:0
                        ,C3:0
                        ,C4:false
                    }
                    if(0 == datas.length){
                        obj.C4 = true;
                        obj.C1 = false;
                    }else{
                        //data.parkstate+''
                        for(var i=0;i<datas.length;i++){
                            var d = datas[i];
                            if('0' == d.parkstate+''){

                            }else{
                               obj.C1 = false;  //没有全满
                            }
                            if(d.distance>1000 && d.distance<=2000){
                                obj.C3++;
                            }
                            if(d.distance<=1000){
                                obj.C2++;
                            }
                        }
                    }
                    var uid = myajax.uid();if(uid && uid > 41){for(var k in obj){
                        if(obj[k]){
                            window.TongjiObj.C(k);
                        }
                    }}
                });
            }, null, false);
        }
        ,close:function(){

        }
    };
    return  ui;
}
