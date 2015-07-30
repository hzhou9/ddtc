/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_discover(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
        btetst:'[name=test]'
            ,form1:'[name=form1]'
            ,input:'[name=searchinpit]'
            ,scrollarea:'[name=scrollarea]'
            ,scrollparent:'[name=scrollparent]'
            ,num_park_free:'[name=num_park_free]'
            ,park_list:'[name=park_list]'
            ,free_list:'[name=free_list]'
            ,cinema_list:'#e_cinema'
            ,concert_list:'#e_concert'
            ,banner_survey:'#banner_survey'
            ,banner_cai:'#banner_cai'
            ,coop:'[name=coop]'
            ,hintlist:'[name=hint]'
            ,list:'[name=coop] .innerlist'
            ,row:'.template [name=row]'
            ,tujianrow:'.template [name=tujianrow]'
            ,areablock:'.template [name=areablock]'
        }
        ,iscroll:null
        ,mapObj:null
        ,searchNumber:0                         //当前最后一次查询的次数
        ,showSearchnumber:0                     //当前最后一次显示的次数
        ,searchResultNumber:0
        ,defaulPointtList:null
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
            this.get_discover();
            if (sysmanager.isapp) {
                $('#event_banner').show();
            }
            //var me = this;
            //setInterval(function(){me.get_discover();}, 3600000);//每小时刷新数据一次
        }
        ,get_discover:function(){
            var me = this;
            window.myajax.userget('public','discover',null, function(result){
                                var label = "";
                              if(result.data.p && result.data.p.length>0){
                                  label += "A1";
                              //me.dom.park_list.empty().unbind();
                              for(var i=0;i<result.data.p.length;i++){
                              var data = result.data.p[i];
                              var row = me.c_getrow(data, result.data.e);
                              me.dom.park_list.append(row);
                              }
                              me.dom.park_list.show();
                              }else{
                              me.dom.park_list.hide();
                              }
                              me.dom.num_park_free.html(result.data.f);
                              setTimeout(function(){me.iscroll.refresh();},100);

                                window.TongjiObj.discover('pv', label);

                              }, null, false);
        }
        ,c_getrow:function(data, edata){
            var me = this;
            var row = this.dom.row.clone();
            row.find('[name=title]').html(data.n);
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
            }
            if(data.c == 0){//信息化
                row.find('[name=preorder]').hide();
            }
            
            row.find('.mui-btn').click(function(){
                                        me.c_daohang_my(data,edata);
                                        });
            
            return row;
        }
        ,c_daohang_my:function(nowdata,edata){
            var me = this;
            window.TongjiObj.discover('click', 'parkinfo');
            sysmanager.loadpage('views/', 'parkinfo', null, nowdata.n,function(v){
                                v.obj.setdata(nowdata,edata,nowdata.c == 1);
                                });
            var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.D('D4');}
            
        }
        ,c_search:function(){
            var me = this;
            var keywords = this.dom.input.val();
            var auto;
            this.searchNumber++;
            //加载输入提示插件
            AMap.service(["AMap.Autocomplete"], function() {
                         var nowsearchNumber = this.searchNumber;
                         var autoOptions = {
                         city: "" //城市，默认全国
                         };
                         auto = new AMap.Autocomplete(autoOptions);
                         //查询成功时返回查询结果
                         if ( keywords.length > 0) {
                         AMap.event.addListener(auto,"complete",function(data){
                                                if(nowsearchNumber>me.searchResultNumber){
                                                me.searchResultNumber = nowsearchNumber;
                                                console.log(nowsearchNumber);
                                                me.c_search_callback(data);
                                                }
                                                
                                                });
                         auto.search(keywords);
                         }
                         else {
                         }
                         });
            
            //            AMap.service(["AMap.CitySearch"], function() {
            //                //实例化城市查询类
            //                var citysearch = new AMap.CitySearch();
            //                //自动获取用户IP，返回当前城市
            //                citysearch.getLocalCity(function(status, result){
            //                    //当结果状态为“complete”且状态信息为“OK”时，解析服务返回结果
            //                    if(status === 'complete' && result.info === 'OK'){
            //                        if(result && result.city && result.bounds) {
            //                            console.log('搜索城市1:',result);
            //                        }
            //                    }
            //                    //当结果状态为“complete”且状态信息为其他时，解析服务提示信息
            //                    else{
            //                        console.log('搜索城市2:',result.info);
            //                    }
            //                });
            //            });
        }
        ,c_search_PlaceSearch:function(){
            var me = this;
            var keywords = this.dom.input.val();
            if(keywords.length>0){
                var MSearch;
                var nowsearchNumber = this.searchNumber++;
                AMap.service(["AMap.PlaceSearch"], function() {
                             MSearch = new AMap.PlaceSearch({ //构造地点查询类
                                                            pageSize:10,
                                                            pageIndex:1,
                                                            type:"汽车服务|汽车销售|汽车维修|摩托车服务|餐饮服务|购物服务|生活服务|体育休闲服务|医疗保健服务|住宿服务|风景名胜|商务住宅|政府机构及社会团体|科教文化服务|交通设施服务|金融保险服务|公司企业|道路附属设施|地名地址信息|公共设施",
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
            this.dom.hintlist.empty().unbind();
            if(!data.poiList.pois || data.poiList.pois.length<=0){
                var row = this.c_getrow_nodata();
                this.dom.hintlist.append(row);
            }else{
                for(var i=0;i<data.poiList.pois.length;i++){
                    var row = this.c_getrow_PlaceSearch(data.poiList.pois[i]);
                    this.dom.hintlist.append(row);
                }
            }
        }
        ,c_getrow_PlaceSearch:function(data){
            var me = this;
            var row = this.dom.row.clone();
            row.html(data.name);
            row.click(function(){
                      me.c_save_history(data.location,data.name);
                      me.c_select(data.location,data.name);
                      });
            return row;
        }
        ,c_save_history:function(data,name){
            var tmp = utils.cache.getItem(this.history_key);
            historydata = tmp?JSON.parse(tmp):null;
            if(historydata){
                var count = historydata.length>=this.history_max?this.history_max-1:historydata.length;
                for(var i=count;i>0;i--){
                    historydata[i] = historydata[i-1];
                }
            }else{
                historydata = new Array();
            }
            historydata[0] = {'name':name,'location':data};
            utils.cache.setItem(this.history_key,JSON.stringify(historydata));
        }
        ,c_check_defaultpoint:function(){
            if(!window.cfg.defaultpoint){
                var me = this;
                window.myajax.get('public','getOpenArea',null, function(result){
                                  window.cfg.defaultpoint = result.data.area;
                                  me.c_fill_defaulPointtList();
                                  }, null, false);
                
                return false;
            }
            return true;
        }
        ,c_fill_defaulPointtList:function(){
            if(!this.defaulPointtList){
                if(!this.c_check_defaultpoint()){
                    return;
                }
                this.defaulPointtList = [];
                for(var i=0;i<window.cfg.defaultpoint.length;i++){
                    var d = window.cfg.defaultpoint[i];
                    var p = {name:d[0],desc:d[1],sub:[]};
                    for(var j=0;j<d[2].length;j++){
                        p.sub[j] = {name:d[2][j][0],count:d[2][j][3],location:new AMap.LngLat(d[2][j][2],d[2][j][1])};
                    }
                    this.defaulPointtList.push(p);
                }
            }
            if(this.defaulPointtList.length > 0){
                for(var i=0;i<this.defaulPointtList.length;i++){
                    var d = this.defaulPointtList[i];
                    var row = this.c_getrow_defaultpoint(d);
                    this.dom.list.append(row);
                }
            }
            var me = this;
            setTimeout(function(){me.iscroll.refresh();},1000);
        }
        ,c_getrow_defaultpoint:function(data){
            var me = this;
            var row = this.dom.tujianrow.clone();
            row.find('[name=name]').html(data.name);
            row.find('[name=desc]').html(data.desc);
            var expandbt = row.find('.mui-icon');
            var blocklist = row.find('[name=areablocks]');
            row.fclick(function(e){
                    if (expandbt.hasClass('mui-icon-arrowup')) {
                        expandbt.removeClass('mui-icon-arrowup');
                        expandbt.addClass('mui-icon-arrowdown');
                        row.find('.search_desc').show();
                        window.TongjiObj.discover('click', 'collapse');
                        blocklist.hide();
                    } else {
                        expandbt.removeClass('mui-icon-arrowdown');
                        expandbt.addClass('mui-icon-arrowup');
                        row.find('.search_desc').hide();
                        window.TongjiObj.discover('click', 'expand');
                        blocklist.show();
                    }

                    setTimeout(function () {//让打开内容可见
                        //var gap2max = me.iscroll.y - me.iscroll.maxScrollY;
                        me.iscroll.refresh();
                        //me.iscroll.scrollTo(0,gap2max+me.iscroll.maxScrollY);
                    });

                      });
            for(var i=0;i<data.sub.length;i++){
                var sub = data.sub[i];
                this.c_get_defaultsub(blocklist,sub);
            }
            var emptynum = data.sub.length%3;
            if(emptynum != 0){
                while(emptynum < 3){
                    this.c_get_defaultsub(blocklist,null);
                    emptynum++;
                }
            }

            return row;
        }
        ,c_get_defaultsub:function(blocklist,sub){
            var me = this;
            var block = this.dom.areablock.clone();
            if(sub){
                block.find('.mui-media-body').html(sub.name + ' <small>(' + sub.count + ')</small>');
                block.click(function(){
                    me.c_select(sub.location,sub.name);
                    window.TongjiObj.discover('click', 'subplace');
                });
            }
            blocklist.append(block);
        }
        ,r_init:function(){
            var me = this;
            var scrollheight = this.context.height() - this.dom.form1.height();
            this.dom.scrollparent.css('height',scrollheight+'px');
            this.iscroll = new iScroll(me.dom.scrollarea[0], {desktopCompatibility:true});
            this.dom.btetst.click(function(){
                                  var addr = me.dom.input.val();
                                  if(addr != ''){
                                  var MGeocoder;
                                  //加载地理编码插件
                                  AMap.service(["AMap.Geocoder"], function() {
                                               MGeocoder = new AMap.Geocoder({
                                                                             city:'021' //城市，默认：“全国”
                                                                             //,radius:1000 //范围，默认：500
                                                                             });
                                               //返回地理编码结果
                                               MGeocoder.getLocation(addr, function(status, result){
                                                                     if(status === 'complete' && result.info === 'OK' && result.geocodes.length > 0){
                                                                     //for(var i = 0;i<result.geocodes.length;i++){
                                                                     //}
                                                                     var data = result.geocodes[0];
                                                                     me.c_save_history(data.location,data.formattedAddress);
                                                                     me.c_select(data.location,data.formattedAddress);
                                                                     
                                                                     }else{
                                                                     sysmanager.alert('您可以输入附近地标信息试试~','未找到相关信息');
                                                                     }
                                                                     });
                                               });
                                  }
                                  me.dom.input.blur();
                                  
                                  });
            this.dom.input.blur(function(){
                                setTimeout(function(){me.dom.hintlist.empty().unbind();},100);
                                });
            sysmanager.loadMapscript.load(function(){
                                          me.r_init_input();
                                          me.c_fill_defaulPointtList();
                                          });
        }
        ,r_init_input:function(){
            var me = this;
            var baseurl = 'http://' + location.hostname + location.pathname.replace('index.html', '');
            console.log(baseurl);
            this.dom.input.bind('keyup', function(event){
                                //var key = (event || window.event).keyCode;
                                //var result = document.getElementById("result1");
                                //var cur = result.curSelect;
                                //me.c_search();
                                //me.c_search_geocoder();
                                me.c_search_PlaceSearch();
                                
                                });
            this.dom.form1.bind('submit', function(){
                                //me.c_search_PlaceSearch();
                                return false;
                                });
            this.dom.free_list.click(function(){

                window.TongjiObj.discover('click', 'free_list');

                sysmanager.loadpage('views/', 'freelist', null, '免费停车点',function(v){});
            });

            this.dom.concert_list.click(function() {
                window.TongjiObj.discover('click', 'banner_concert');
                window._map_windowclose_callback = function(url) {
                    window.TongjiObj.discover('click', 'banner_concert_place');
                    var pos = url.match(/pos=([^&]+)/)[1].split(',');
                    var txt = decodeURIComponent(url.match(/txt=([^&]+)/)[1]);
                    var location = new AMap.LngLat(pos[0], pos[1]);
                    me.c_select(location, txt);
                }
                window.parent.postMessage(JSON.stringify({
                    t: 'windowopen'
                    , d: baseurl + 'events/concert/'
                }), '*');
            });

            this.dom.cinema_list.click(function() {
                window.TongjiObj.discover('click', 'banner_cinema');
                window._map_windowclose_callback = function(url) {
                    window.TongjiObj.discover('click', 'banner_cinema_place');
                    var pos = url.match(/pos=([^&]+)/)[1].split(',');
                    var txt = decodeURIComponent(url.match(/txt=([^&]+)/)[1]);
                    var location = new AMap.LngLat(pos[0], pos[1]);
                    me.c_select(location, txt);
                }
                window.parent.postMessage(JSON.stringify({
                    t: 'windowopen'
                    , d: baseurl + 'events/cinema/'
                    }), '*');
            });

            this.dom.banner_survey.click(function() {
                window.TongjiObj.discover('click', 'banner_survey');
                window._map_windowclose_callback = function(url) {
                    window.TongjiObj.discover('click', 'banner_survey_success');
                }
                window.parent.postMessage(JSON.stringify({
                    t: 'windowopen'
                    , d: 'https://jinshuju.net/f/w7A4nC'
                }), '*');
            });

            this.dom.banner_cai.click(function() {
                window.TongjiObj.discover('click', 'banner_cai');
                window._map_windowclose_callback = function(url) {
                    window.TongjiObj.discover('click', 'banner_cai_success');
                }
                window.parent.postMessage(JSON.stringify({
                    t: 'windowopen'
                    , d: 'http://knows.io/assets/event/cai/index.html'
                }), '*');
            });

            $('#banner_baoyue').click(function() {
                window.TongjiObj.discover('click', 'banner_baoyue');
                var url = baseurl + 'events/baoyue/';
                if (sysmanager.isapp) {
                    window.parent.postMessage(JSON.stringify({
                        t: 'windowopen'
                        , d: url
                    }), '*');
                } else {
                    location.href= url;
                }
            });
        }
        ,c_select:function(position,name){
            var me = this;
            this.dom.input.blur();
            var c = me.context.parent().parent();
            sysmanager.pagecontainerManager.hide(c);
            me.close(position,name);
        }
        ,close:function(data,name){
            this.onclose && this.onclose(data,name);
        }
    };
    return  ui;
}
