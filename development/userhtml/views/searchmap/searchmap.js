/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_searchmap(){

    var ui = {
        isInit: false
        ,showclose:false
        ,context:null
        ,dom:{
            btetst:'[name=test]'
            ,form1:'[name=form1]'
            ,input:'[name=searchinpit]'
            ,list:'[name=coop] .innerlist'
            ,row:'.template [name=row]'
            ,tujianrow:'.template [name=tujianrow]'
            ,historyrow:'.template [name=historyrow]'
            ,areablock:'.template [name=areablock]'
            //,testnumber:'[name=testnumber]'
            ,historylist:'[name=history] .innerlist'
            ,history:'[name=history]'
            ,hintlist:'[name=hint]'
            ,scrollarea:'[name=scrollarea]'
            ,scrollparent:'[name=scrollparent]'
            ,searchmap_contaion:'.searchmap_contaion'
            ,historyrow_head:'.template [name=historyrow_head]'
            ,tujianrow_head:'.template [name=tujianrow_head]'
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
        ,history_key:'_searchmap_history'
        ,history_max:3
        ,c_init:function(){
            var me = this;
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
                        p.sub[j] = {name:d[2][j][0],location:new AMap.LngLat(d[2][j][2],d[2][j][1])};
                    }
                    this.defaulPointtList.push(p);
                }
            }
            if(this.defaulPointtList.length > 0){
                this.dom.list.empty().unbind();
                this.dom.list.append(this.dom.tujianrow_head.clone());
                for(var i=0;i<this.defaulPointtList.length;i++){
                    var d = this.defaulPointtList[i];
                    var row = this.c_getrow_defaultpoint(d);
                    this.dom.list.append(row);
                }
            }
            //搜索历史
            var tmp = utils.cache.getItem(this.history_key);
            historydata = tmp?JSON.parse(tmp):null;
            if(historydata){
                this.dom.historylist.empty().unbind();
                if(historydata.length > 0){
                    this.dom.historylist.append(this.dom.historyrow_head.clone());
                    for(var i=0;i<historydata.length;i++){
                        var d = historydata[i];
                        if(!(d.location instanceof AMap.LngLat)){
                            d.location = new AMap.LngLat(d.location.lng,d.location.lat);//修正对象
                        }
                        var row = this.c_getrow_historypoint(d);
                        this.dom.historylist.append(row);
                    }
                }
                this.dom.history.show();
            }
            var me = this;
            setTimeout(function(){me.iscroll.refresh();});
        }
        ,c_search_geocoder:function(){
            var me = this;
            var keywords = this.dom.input.val();
            AMap.service(["AMap.Geocoder"], function() {     //加载地理编码插件
                var MGeocoder = new AMap.Geocoder();
                //返回地理编码结果
                AMap.event.addListener(MGeocoder, "complete", function(data){
                    me.c_search_geocoder_callback(data);
                });
                MGeocoder.getLocation(keywords);  //地理编码
            });
        }
        ,c_search_callback:function(data){
            //console.log('search',data);
            var me = this;
            this.dom.hintlist.empty().unbind();
            if(!data.tips || data.tips.length<=0){
                var row = this.c_getrow_nodata();
                this.dom.hintlist.append(row);
            }else{
                for(var i=0;i<data.tips.length;i++){
                    var row = this.c_getrow(data.tips[i]);
                    this.dom.hintlist.append(row);
                }
            }
        }
        ,c_search_geocoder_callback:function(data){
            console.log('search',data);
            /**
             * geocodes: Array[10]
             *      adcode: "411103"
             *      addressComponent: Object
             *      formattedAddress: "河南省漯河市郾城区西康路"
             *      level: "道路"
             *      location: cB: 33.647901lat: 33.647901lng: 114.038094r: 114.038094
             * info: "OK"
             * resultNum: "10"
             * type: "complete"
             */
            var me = this;
            this.dom.hintlist.empty().unbind();
            if(!data.geocodes || data.geocodes.length<=0){
                var row = this.c_getrow_nodata();
                this.dom.hintlist.append(row);
            }else{
                for(var i=0;i<data.geocodes.length;i++){
                    var row = this.c_getrow_geocode(data.geocodes[i]);
                    this.dom.hintlist.append(row);
                }
            }
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
        ,c_getrow_historypoint:function(data){
            var me = this;
            var row = this.dom.historyrow.clone();
            row.find('[name=name]').html(data.name);
            row.click(function(){
                      //从地区列表选择时不存历史
                      me.c_select(data.location,data.name);
                      });
            return row;
        }
        ,c_getrow_defaultpoint:function(data){
            var me = this;
            var row = this.dom.tujianrow.clone();
            row.find('[name=name]').html(data.name);
            row.find('[name=desc]').html(data.desc);
            var expandbt = row.find('.mui-icon');
            var blocklist = row.find('[name=areablocks]');
            row.click(function(){
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
                      setTimeout(function(){me.iscroll.refresh();});
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
                block.find('.mui-media-body').html(sub.name);
                block.click(function(){me.c_select(sub.location,sub.name);});
            }
            blocklist.append(block);
        }
        ,c_getrow:function(data){
            var me = this;
            var row = this.dom.row.clone();
            row.html(data.name);
            row.click(function(){
                me.c_save_history(data,data.name);
                me.c_select(data,data.name);
            });
            return row;
        }
        ,c_getrow_geocode:function(data){
            var me = this;
            var row = this.dom.row.clone();
            row.html(data.formattedAddress);
            row.click(function(){
                me.c_save_history(data.location,data.formattedAddress);
                me.c_select(data.location,data.formattedAddress);
            });
            return row;
        }
        ,c_getrow_nodata:function(){
            var row = this.dom.row.clone();
            row.html('<span style="color: red">没有查询到相关位置信息</span>');
            return row;
        }
        ,r_init:function(){
            var me = this;
            //this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});
            this.dom.btetst.click(function(){
                me.dom.input.blur();
                var c = me.context.parent().parent();
                //me.close();
                sysmanager.pagecontainerManager.hide(c);

            });
            this.dom.input.blur(function(){
                setTimeout(function(){me.dom.hintlist.empty().unbind();},1000);
            });
            sysmanager.loadMapscript.load(function(){
                me.r_init_input();
                me.c_fill_defaulPointtList();
            });
            
            var scrollheight = this.dom.searchmap_contaion.height() - this.dom.form1.height();
            this.dom.scrollparent.css('height',scrollheight+'px');
            me.iscroll = new iScroll(me.dom.scrollarea[0], {desktopCompatibility:true});
        }
        ,c_select:function(position,name){
            var me = this;
            this.dom.input.blur();
            var c = me.context.parent().parent();
            sysmanager.pagecontainerManager.hide(c);
            me.close(position,name);
        }
        ,r_init_input:function(){
            var me = this;
            this.dom.input.bind('keyup', function(event){
                //var key = (event || window.event).keyCode;
                //var result = document.getElementById("result1");
                //var cur = result.curSelect;
                //me.c_search();
                //me.c_search_geocoder();
                me.c_search_PlaceSearch();

            });
            this.dom.form1.bind('submit', function(){
                setTimeout(function(){
                    me.c_search_PlaceSearch();
                });
               return false;
            });
            if(this.showclose){
                this.dom.btetst.show();
            }else{
                this.dom.btetst.hide();
            }
        }
        ,close:function(data,name){
            this.onclose && this.onclose(data,name);
        }
    };
    return  ui;
}
