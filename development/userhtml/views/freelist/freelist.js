/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_freelist(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            btadd:'[name=btfreeadd]'
            ,btaddok:'[name=addok]'
            ,btaddcancel:'[name=addcancel]'
            ,panelfreelist:'[name=freelist]'
            ,list:'[name=list]'
            ,panelfreeadd:'[name=freeadd]'
            ,scrollarea_add:'[name=scrollarea_add]'
            ,tags_item_1:'[name=tags_item_1]'
            ,tags_item_2:'[name=tags_item_2]'
            ,tags_item_3:'[name=tags_item_3]'
            ,tags_item_4:'[name=tags_item_4]'
            ,tags_item_5:'[name=tags_item_5]'
            ,tags_item_6:'[name=tags_item_6]'
            ,tags_item_7:'[name=tags_item_7]'
            ,tags_item_8:'[name=tags_item_8]'
            ,txtName:'[name=txtName]'
            ,txtDsc:'[name=txtDsc]'
            ,bttag:'[name=bttag]'
            ,btarea:'[name=btarea]'
            ,paneltag:'[name=paneltag]'
            ,panelarea:'[name=panelarea]'
            ,btn_more:'[name=btn_more]'
            ,btn_prev:'[name=btn_prev]'
            ,row_park:'.template [name=row_park]'
            ,header:'header'
        }
        ,nowpage:0
        ,max:10
        ,parkdata:[]
        ,defaults:{
            area_sel:'0'
            ,tag_sel:'0'
        }
        ,areas:['0','xh','ja','hp','cn','mh','pd','pt','hk','zb','yp','bs','lw','sj','jd','qp','js']
        ,tags:['0','1','2','3','4','5','6','7','8','9']
        ,homecontrol:null
        ,geopos:null
        ,iscroll:null
        ,iscroll_add:null
        ,mapObj:null
        ,params:""
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

        }
        ,setdata:function(lng, lat){
            this.geopos = new AMap.LngLat(lng, lat);
        }
        ,c_initMap:function(fn, placedata){//fn 加载后的回调， placedata 预定义的地图搜索位置
            var me = this;
              var mapObj = this.mapObj = window.mapobj = new AMap.Map("map_html_mapid2",{
                                                                        view: new AMap.View2D({
                                                                                              //创建地图二维视口
                                                                                                //center:position,//创建中心点坐标
                                                                                                zoom:17, //设置地图缩放级别
                                                                                                rotation:0 //设置地图旋转角度
                                                                                               })
                                                                       ,lang:"zh_cn"//设置地图语言类型，默认：中文简体
                                                                      ,resizeEnable:true
                                                                      });//创建地图实例
            
            var homecontrol = this.homecontrol = new AMap.myHomeControl({
                                                                        offset:new AMap.Pixel(10,100)
                                                                        });
            var maptool = null;
            
            mapObj.plugin(["AMap.ToolBar","AMap.Scale"],function(){
                          
                          //加载工具条
                          maptool = window.maptool = new AMap.ToolBar({
                                                                      direction:false,//隐藏方向导航
                                                                      ruler:false,//隐藏视野级别控制尺
                                                                      autoPosition:false//自动定位
                                                                      ,offset:new AMap.Pixel(10,80)
                                                                      //                       })
                                                                      });
                          mapObj.addControl(maptool);
                          //加载比例尺
                          var scale = new AMap.Scale();
                          mapObj.addControl(scale);
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
                
                if(placedata){
                    mapObj.setCenter(placedata);
                    setTimeout(function(){
                               homecontrol.setPosition(placedata,mapObj, true);
                               fn && fn(placedata);
                               });
                }else{
                    var center = mapobj.getCenter();
                    console.log(center);
                    homecontrol.setPosition(center,mapObj, true);
                    setTimeout(function(){fn && fn(center,true);});//to make response faster
                    
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
                                                         console.log(arg.position);
                                                         if(!callbacking && (!me.geopos || Math.abs(me.geopos.lng - arg.position.lng) > 0.001 || Math.abs(me.geopos.lat - arg.position.lat) > 0.001)){
                                                         fn && fn(arg.position);
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
                AMap.event.addListener(mapObj,'moveend',function(){
                                       setposition();
                                       });
                AMap.event.addListener(mapObj,'mapmove',function(){
                                       setposition();
                                       });
                function setposition(){
                    homecontrol.setPosition(mapObj.getCenter(),mapObj,true);
                }
            }
            
        }
        ,r_init:function(){
            var me = this;
            var model = utils.tools.getUrlParam('m');
            if(model=='freelist'){
                this.dom.header.show();
            }
            this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});
            
            this.dom.btadd.click(function(){
                me.dom.panelfreelist.hide();
                me.dom.panelfreeadd.show();
                me.iscroll.disable();
                                 if(me.iscroll_add){
                                 me.iscroll_add.enable();
                                 }else{
                                 me.iscroll_add = new iScroll(me.dom.scrollarea_add[0], {desktopCompatibility:true});
                                 }
                window.TongjiObj.freelist('click', 'addpark');
            });
            this.dom.btaddok.click(function(){
                window.TongjiObj.freelist('click', 'addparkok');
                var name = me.dom.txtName.val(); var dsc = me.dom.txtDsc.val();
                                   if(name == ''){
                                   sysmanager.alert('请给停车场起一个名称');
                                   return;
                                   }else if(dsc == ''){
                                   sysmanager.alert('请给停车场写一些文字描述');
                                   return;
                                   }
                var note = '|';
                                   for(var i=1;i<=8;i++){
                                   if(me.dom.scrollarea_add.find('[name=tags_item_'+i+']').hasClass('tags-active')){
                                   note += i+'|';
                                   }
                                   }
                var pos = me.mapObj.getCenter();
                var arr = {'name':name,'lat':pos.lat,'lng':pos.lng,'dsc':dsc,'note':note};
                window.myajax.userget('index','addfreepark',arr, function(result){
                    me.dom.panelfreelist.show();me.dom.panelfreeadd.hide();
                    me.iscroll_add.disable();me.iscroll.enable();
                    sysmanager.alert('感谢您的参与，我们工作人员会尽快进行审核，通过后我们会联系您，再次感谢！','信息提交成功');
                }, null, false);
                
            });
            this.dom.btaddcancel.click(function(){
                me.dom.panelfreeadd.hide();
                me.dom.panelfreelist.show();
                me.iscroll_add.disable();me.iscroll.enable();
            });
            this.dom.tags_item_1.click(function(){
                                       me.dom.tags_item_1.toggleClass('tags-active');
            });
            this.dom.tags_item_2.click(function(){
                                       me.dom.tags_item_2.toggleClass('tags-active');
                                       });
            this.dom.tags_item_3.click(function(){
                                       me.dom.tags_item_3.toggleClass('tags-active');
                                       });
            this.dom.tags_item_4.click(function(){
                                       me.dom.tags_item_4.toggleClass('tags-active');
                                       });
            this.dom.tags_item_5.click(function(){
                                       me.dom.tags_item_5.toggleClass('tags-active');
                                       });
            this.dom.tags_item_6.click(function(){
                                       me.dom.tags_item_6.toggleClass('tags-active');
                                       });
            this.dom.tags_item_7.click(function(){
                                       me.dom.tags_item_7.toggleClass('tags-active');
                                       });
            this.dom.tags_item_8.click(function(){
                                       me.dom.tags_item_8.toggleClass('tags-active');
                                       });
            this.dom.bttag.click(function(){
                                 //me.dom.bttag.toggleClass("mui-navigate-down");me.dom.bttag.toggleClass("mui-navigate-up");
                                    me.dom.paneltag.toggle();
                                    me.dom.panelarea.hide();
                                 });
            this.dom.btarea.click(function(){
                                //me.dom.btarea.toggleClass("mui-navigate-down");me.dom.btarea.toggleClass("mui-navigate-up");
                                    me.dom.panelarea.toggle();
                                    me.dom.paneltag.hide();

                                 });
            this.dom.btn_more.click(function(){
                                    me.loaddata(me.nowpage+1);
                                    });
            this.dom.btn_prev.click(function(){
                                    me.loaddata(me.nowpage-1);
                                    });
            
            //地区点击
            $.each(this.areas, function(idx, obj) {
                   var areastr = obj;
                   var areatag = 'tags_area_'+areastr;
                   me.dom.panelarea.find('[name='+areatag+']').click(function(){
                                                                       var oldtag='tags_area_'+me.defaults.area_sel;me.defaults.area_sel=areastr;
                                                                       me.dom.btarea.html(window.cfg.areas[areastr]);
                                                                       me.dom.panelarea.find('[name='+oldtag+']').show();
                                                                       me.dom.panelarea.find('[name='+areatag+']').hide();
                                                                       me.dom.panelarea.hide();
                                                                       //todo：显示免费停车场
                                                                     me.parkdata = [];
                                                                       me.loaddata(0,true);
                                                                       });
            });
            //类型点击
            $.each(this.tags, function(idx, obj) {
                   var tagstr = obj;
                   var seltag = 'tags_sel_'+tagstr;
                   me.dom.paneltag.find('[name='+seltag+']').click(function(){
                                                                     var oldtag='tags_sel_'+me.defaults.tag_sel;me.defaults.tag_sel=tagstr;
                                                                     me.dom.bttag.html(window.cfg.freeparktags[tagstr]);
                                                                     me.dom.paneltag.find('[name='+oldtag+']').show();
                                                                     me.dom.paneltag.find('[name='+seltag+']').hide();
                                                                     me.dom.paneltag.hide();
                                                                     //todo：显示免费停车场
                                                                   me.parkdata = [];
                                                                   me.loaddata(0,true);
                                                                     });
                   });
            sysmanager.loading.show();
            sysmanager.loadMapscript.load(function(){
                me.c_initMap(function(center,istest){
                    if(!istest || !me.geopos){
                        me.geopos = center;
                        //todo:根据坐标加载停车场
                        me.loaddata(0,true);
                    }
                }, me.geopos);
            });
        }
        ,loaddata:function(pg,force){
            var me=this;
            me.params = "";
            if(!this.parkdata[pg]){
                var params = {lat:this.geopos.lat,lng:this.geopos.lng,province:'sh',city:'sh',page:pg,max:this.max};
                if(window.pushid){
                    params['pushid'] = window.pushid;
                }
            if(this.defaults.area_sel != '0'){
                params.district = this.defaults.area_sel;
                me.params += "+dist:" + params.district;
            }
            if(this.defaults.tag_sel != '0'){
                params.note = this.defaults.tag_sel;
                me.params += "+note:" + params.note;
            }

                window.TongjiObj.freelist('pv', me.params);

            window.myajax.userget('public','getfreepark',params,function(result){
                                  if(force || (result.data.p && result.data.p.length > 0)){
                                  for(var i=0;i<result.data.p.length;i++){//预处理
                                  var d = result.data.p[i];
                                  d.point = new AMap.LngLat(d.lng, d.lat);
                                  d.distance = Math.abs(parseInt(d.point.distance(me.geopos)));
                                  }
                                  me.parkdata[pg] = result.data;
                                  me.showdata(result.data);
                                  me.nowpage=pg;
                                  if(pg > 0){
                                  me.dom.btn_prev.show();
                                  }else{
                                  me.dom.btn_prev.hide();
                                  }
                                  if(me.parkdata[pg].m){
                                  me.dom.btn_more.show();
                                  }else{
                                  me.dom.btn_more.hide();
                                  }
                                  }else{
                                  sysmanager.alert('暂时没有更多数据了','已经是最后一条啦~');
                                  me.dom.btn_more.hide();
                                  }

            }, null, false);
            }else{
                this.showdata(this.parkdata[pg]);
                this.nowpage=pg;
                if(pg > 0){
                    this.dom.btn_prev.show();
                }else{
                    this.dom.btn_prev.hide();
                }
                if(this.parkdata[pg].m){
                    this.dom.btn_more.show();
                }else{
                    this.dom.btn_more.hide();
                }
            }
        }
        ,showdata:function(data){
            this.dom.list.empty().unbind();
            var me = this;
            $.each(data.p, function(idx, obj) {
                   var row = me.dom.row_park.clone();
                   row.find('.distance').html(obj.distance +'米');
                   row.find('[name=name]').html(obj.n);
                   if(obj.t && obj.t!=''){//寻找最小的tag
                   var tags=obj.t.split("|");
                   var mintag = 99;var tagdisp = null;
                   for(var i=0;i<tags.length;i++){
                   var tagstr = window.cfg.freeparktags[tags[i]];
                   if(tagstr && tags[i]<mintag){mintag=tags[i];tagdisp=tagstr;}
                   }
                   if(tagdisp){
                   row.find('[name=tag1]').html('[<span>' + tagdisp + '</span>]');
                   }
                   }
                   row.find('[name=desc]').html(obj.b);
                   row.find('a').click(function(){
                                       me.c_daohang_my(obj,data.e);
                   });
                   me.dom.list.append(row);
            });
            setTimeout(function(){me.iscroll.refresh();me.iscroll.scrollTo(0,0);});
        }
        ,c_daohang_my:function(data,ext){
            var me = this;

            window.TongjiObj.freelist('click', 'parkinfo' + me.params);

            sysmanager.loadpage('views/', 'parkinfo', null, data.n,function(v){
                                v.obj.setdata(data,ext,data.c == 1);
                                });
            var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.D('D4');}
            
        }
        ,close:function(){

        }
    };
    return  ui;
}
