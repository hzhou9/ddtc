/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_daohang(){

    var ui;
    ui = {
        isInit:false, context:null, dom:{
            daohanginfo:'.daohanginfo', list:'[name=list]', row:'.template [name=row]', title:'.template [name=title]'
        }, iscroll:null, mapObj:null, targetdata:null            //目标数据
        , init:function (context) {
            if (!this.isInit) {
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            this.c_init();
        }, c_init:function () {
            var me = this;
            this.c_initMap(function (locposition) {
                if(!me.targetdata.point){
                    me.targetdata.point = new AMap.LngLat(me.targetdata.lng,me.targetdata.lat);
                }
                me.c_startDaohang(locposition, me.targetdata.point);
            });
        }, c_startDaohang:function (start, end) {
            var MDrive;
            var me = this;
            AMap.service(["AMap.Driving"], function () {
                var DrivingOption = {
                    //驾车策略，包括 LEAST_TIME，LEAST_FEE, LEAST_DISTANCE,REAL_TRAFFIC
                    policy:AMap.DrivingPolicy.LEAST_TIME
                };
                MDrive = new AMap.Driving(DrivingOption); //构造驾车导航类
                //根据起终点坐标规划驾车路线
                MDrive.search(start, end, function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        //me.driving_routeCallBack(result, start, end);
                        me.c_driving_routeCallBack(result, start, end);
                    } else {
                        alert(result);
                    }
                });
            });
        }, driving_routeCallBack:function (data, start, end) {
            var routeS = data.routes;
            if (routeS.length <= 0) {
                alert("未查找到任何结果!<br />建议：<br />1.请确保所有字词拼写正确。<br />2.尝试不同的关键字。<br />3.尝试更宽泛的关键字。");
            } else {
                var steps;
                window['daohangui'] = ui;
                route_text = "";
                for (var v = 0; v < routeS.length; v++) {
                    //驾车步骤数
                    steps = this.steps = routeS[v].steps
                    var route_count = steps.length;
                    //行车距离（米）
                    var distance = routeS[v].distance;
                    //拼接输出html
                    for (var i = 0; i < steps.length; i++) {
                        route_text += "<tr><td align=\"left\" onMouseover=\"window['daohangui'].driveDrawFoldline('" + i + "')\">" + i + "." + steps[i].instruction + "</td></tr>";
                    }
                }
                //输出行车路线指示
                route_text = "<table cellspacing=\"5px\"><tr><td style=\"background:#e1e1e1;\">路线</td></tr><tr><td><img src=\"http://code.mapabc.com/images/start.gif\" />&nbsp;&nbsp;北京南站</td></tr>"
                    + route_text
                    + "<tr><td><img src=\"http://code.mapabc.com/images/end.gif\" />&nbsp;&nbsp;北京西站</td></tr></table>";
                this.dom.daohanginfo.html(route_text);
                this.drivingDrawLine(start, end, steps);
            }
        }, c_driving_routeCallBack:function (data, start, end) {
            var me = this;
            var routeS = data.routes;
            this.dom.list.empty().unbind();
            if (routeS.length <= 0) {
                //alert("未查找到任何结果!<br />建议：<br />1.请确保所有字词拼写正确。<br />2.尝试不同的关键字。<br />3.尝试更宽泛的关键字。");
            } else {
                var steps;
                //title
                var title = this.dom.title.clone();
                title.html('路线导航');
                this.dom.list.append(title);

                for (var v = 0; v < routeS.length; v++) {
                    //驾车步骤数
                    steps = this.steps = routeS[v].steps
                    var route_count = steps.length;
                    //行车距离（米）
                    var distance = routeS[v].distance;
                    //拼接输出html
                    for (var i = 0; i < steps.length; i++) {
                        //route_text += "<tr><td align=\"left\" onMouseover=\"window['daohangui'].driveDrawFoldline('" + i + "')\">" + i +"." +steps[i].instruction  + "</td></tr>";
                        var row = this.c_getrow(i, steps[i]);
                        this.dom.list.append(row);
                    }
                }
                setTimeout(function () {
                    me.iscroll.refresh();
                });
                //输出行车路线指示
                this.drivingDrawLine(start, end, steps);
            }
        }, c_getrow:function (index, step) {
            var me = this;
            var row = this.dom.row.clone();
            row.html(step.instruction);
            row.aclick(function () {
                me.c_activeRow(row, index);
            });
            return row;
        }, c_activeRow:function (row, index) {
            if (!row.hasClass('active')) {
                this.driveDrawFoldline(index);
                this.dom.list.find('>*').removeClass('active');
                row.addClass('active');
            }
        }, drivingDrawLine:function (start, end, steps) {
            //起点、终点图标
            var sicon = new AMap.Icon({
                image:"http://api.amap.com/Public/images/js/poi.png",
                size:new AMap.Size(44, 44),
                imageOffset:new AMap.Pixel(-334, -180)
            });
            var startmarker = new AMap.Marker({
                icon:sicon, //复杂图标
                visible:true,
                position:start,
                map:this.mapObj,
                offset:{
                    x:-16,
                    y:-40
                }
            });
            var eicon = new AMap.Icon({
                image:"http://api.amap.com/Public/images/js/poi.png",
                size:new AMap.Size(44, 44),
                imageOffset:new AMap.Pixel(-334, -134)
            });
            var endmarker = new AMap.Marker({
                icon:eicon, //复杂图标
                visible:true,
                position:end,
                map:this.mapObj,
                offset:{
                    x:-16,
                    y:-40
                }
            });
            //起点到路线的起点 路线的终点到终点 绘制无道路部分
            var extra_path1 = new Array();
            extra_path1.push(start);
            extra_path1.push(steps[0].path[0]);
            var extra_line1 = new AMap.Polyline({
                map:this.mapObj,
                path:extra_path1,
                strokeColor:"#9400D3",
                strokeOpacity:0.7,
                strokeWeight:4,
                strokeStyle:"dashed",
                strokeDasharray:[10, 5]
            });

            var extra_path2 = new Array();
            var path_xy = steps[(steps.length - 1)].path;
            extra_path2.push(end);
            extra_path2.push(path_xy[(path_xy.length - 1)]);
            var extra_line2 = new AMap.Polyline({
                map:this.mapObj,
                path:extra_path2,
                strokeColor:"#9400D3",
                strokeOpacity:0.7,
                strokeWeight:4,
                strokeStyle:"dashed",
                strokeDasharray:[10, 5]
            });

            var drawpath = new Array();
            for (var s = 0; s < steps.length; s++) {
                var plength = steps[s].path.length;
                for (var p = 0; p < plength; p++) {
                    drawpath.push(steps[s].path[p]);
                }
            }
            var polyline = new AMap.Polyline({
                map:this.mapObj,
                path:drawpath,
                strokeColor:"#9400D3",
                strokeOpacity:0.7,
                strokeWeight:4,
                strokeDasharray:[10, 5]
            });
            this.mapObj.setFitView();
        }, driveDrawFoldline:function (num) {
            var steps = this.steps;
            var drawpath1 = new Array();
            drawpath1 = steps[num].path;
            polyline = this.polyline;
            if (polyline != null) {
                polyline.setMap(null);
            }
            polyline = new AMap.Polyline({
                map:this.mapObj,
                path:drawpath1,
                strokeColor:"#FF3030",
                strokeOpacity:0.9,
                strokeWeight:4,
                strokeDasharray:[10, 5]
            });

            this.mapObj.setFitView(polyline);
        }, settarget:function (data) {
            this.targetdata = data;
        }, c_initMap:function (fn) {
            var me = this;
            sysmanager.loadMapscript.load(function(){
            var mapObj = me.mapObj = window.mapobj = new AMap.Map("daohang_html_mapid", {
                view:new AMap.View2D({//创建地图二维视口
                    //center:position,//创建中心点坐标
                    zoom:15, //设置地图缩放级别
                    rotation:0 //设置地图旋转角度
                }),
                lang:"zh_cn"//设置地图语言类型，默认：中文简体
            });//创建地图实例
            mapObj.plugin(["AMap.ToolBar", "AMap.Scale"], function () {
                //加载工具条
                var maptool = window.maptool = new AMap.ToolBar({
                    direction:false, //隐藏方向导航
                    ruler:true, //隐藏视野级别控制尺
                    autoPosition:false//自动定位
                    , offset:new AMap.Pixel(10, me.context.height() - 50)
                });
                mapObj.addControl(maptool);
                //加载比例尺
                var scale = new AMap.Scale();
                mapObj.addControl(scale);

                AMap.event.addListener(maptool, 'location', function callback(e) {
                    locposition = e.lnglat;
                    fn && fn(locposition);
                });
                maptool.doLocation();
            });
            });
        }, c_showInfo:function () {
            this.dom.info.panel.show();
        }, r_init:function () {
            var me = this;
            this.iscroll = new iScroll(this.dom.list[0], {desktopCompatibility:true});
        }, close:function () {
            this.mapObj && this.mapObj.destroy();
        }
    };
    return  ui;
}
