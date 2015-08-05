/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_orderpay(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            rules:'[name=rules]'
            ,prepay:'[name=prepay]'
            ,prepay_old:'[name=prepay_old]'
            ,pretype:'[name=pretype]'
            ,coupon_panel:'[name=coupon_panel]'
            ,couponinfo:'[name=couponinfo]'
            ,couponinfo_select:'[name=couponinfo_select]'
            ,couponinfo_none:'[name=couponinfo_none]'
            ,couponinfo_load:'[name=couponinfo_load]'
            ,coupon_list:'[name=coupon_panel] [name=list]'
            ,carid:'[name=carid]'
            ,btpay:'[name=dopay]'
            ,btmodifycarid:'[name=btmodifycarid]'
            ,qurow_1:'.template [name=row-1]'
            ,qurow_0:'.template [name=row-0]'
            ,my_invisible_radio:'#my_invisible_radio'
            ,pay_method:'[name=pay_method]'
        }
        ,iscroll:null
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
            this.c_fill();
        }
        ,c_fill:function(data){
            this.dom.rules.html(this.nowdata.r);
            if(this.nowdata.d){//活动
                if(this.nowdata.d[0] == 1){//停车只要1元
                    this.dom.prepay.html(this.nowdata.d[1]);
                }else{
                    var p = parseInt((this.nowdata.p - this.nowdata.d[1])*100)/100;
                    if(p <= 0){
                        p = 0.01;
                    }
                    this.dom.prepay.html(p);
                }
                this.dom.prepay_old.html(this.nowdata.p+'元');
            }else{
                this.dom.prepay.html(this.nowdata.p);
                this.dom.prepay_old.html('');
            }
            this.dom.carid.html(this.extinfo.c || '没有设置车牌');
            if(this.nowdata.y){
                this.dom.pretype.html(this.nowdata.y);
            }else{
                this.dom.pretype.html('元');
            }
            this.c_initcoupon();
        }
        ,c_initcoupon:function(){          //初始化抵扣券信息
            var me = this;
            if(this.couponlist){
                fillcouponinfo(this.couponlist);
            }else{
                loadcouponinfo();
                this.m_getcoupon(function(list){
                    me.couponlist = list;
                    setTimeout(function(){
                        if(0 == list.length){
                            nonecouponinfo();
                        }else{
                            fillcouponinfo(me.couponlist);
                        }
                    },200);
                });
            }
            function loadcouponinfo(){
                me.dom.couponinfo.hide();
                me.dom.couponinfo_none.hide();
                me.dom.couponinfo_select.hide();
                me.dom.couponinfo_load.show();
                me.dom.coupon_panel.find('a').removeClass('mui-navigate-right');
            }
            function nonecouponinfo(){
                me.dom.couponinfo.hide();
                me.dom.couponinfo_none.show();
                me.dom.couponinfo_select.hide();
                me.dom.couponinfo_load.hide();
                me.dom.coupon_panel.find('a').removeClass('mui-navigate-right');
            }
            function fillcouponinfo(coupon){
                me.dom.coupon_panel.find('a').addClass('mui-navigate-right');
                me.dom.couponinfo.show().find('span').html(coupon.length);
                me.dom.couponinfo_select.hide();
                me.dom.couponinfo_none.hide();
                me.dom.couponinfo_load.hide();
                
                var listui = me.dom.coupon_list.empty().unbind();
                var qurow_1= me.dom.qurow_1;
                var qurow_0= me.dom.qurow_0;
                var dqselectdata = null;
                
                var list = coupon;
                var firstrow = null;
                for(var i=0;i<list.length;i++){
                    var data = list[i];
                    var row = getcouponrow(data);
                    if(!firstrow){
                        firstrow = row;
                    }
                    listui.append(row);
                }
                if(!me.nowdata.d){//活动时不默认选择优惠券
                    setTimeout(function(){firstrow && firstrow.find('[name=radio]').click();});
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
                            //row.find('[name=etime]').html((data.e+'').split(' ')[0]);
                            break;
                    }
                    row.find('[name=radio]').click(function(){
                              couponrow_active(data, $(this));
                    });
                    
                    return row;
                }
                
                function couponrow_active(data,row){
                    if(dqselectdata && dqselectdata.id == data.id){           //选择后在选择：取消选择
                        dqselectdata = null;
                        me.dom.couponinfo.show();
                        me.dom.couponinfo_select.hide();
                        me.dom.my_invisible_radio.click();
                        
                    }else{      //选择
                        me.dom.couponinfo.hide();
                        me.dom.couponinfo_select.show();
                        if('-1' == data.t+''){       //支付一元
                            me.dom.couponinfo_select.html('只需支付1元');
                        }else{
                            me.dom.couponinfo_select.html('抵扣{0}元'.replace('{0}',data.m));
                        }
                        dqselectdata = data;
                        setTimeout(function(){me.dom.coupon_panel.removeClass('mui-active');});
                    }
                    onselect(dqselectdata);
                }
                
                function onselect(dqselectdata){
                    me.dqselectdata = dqselectdata;
                    var preprice = me.nowdata.p;
                    if(dqselectdata){
                        var m = Math.round(me.nowdata.p*100)/100;
                        if('-1' == dqselectdata.t+''){  //壹元券
                            m = 1;
                        }else{                          //抵用券
                            m = m - dqselectdata.m;
                        }
                        if(m<0){
                            m = 0.1;
                        }
                        var preprice = m;
                    }
                    if(me.nowdata.d){//活动
                        if(me.nowdata.d[0] == 1){//停车只要1元
                            me.dom.prepay.html(me.nowdata.d[1]);
                        }else{
                            var p = parseInt((preprice - me.nowdata.d[1])*100)/100;
                            if(p <= 0){
                                p = 0.01;
                            }
                            me.dom.prepay.html(p);
                        }
                        me.dom.prepay_old.html(preprice+'元');
                    }else{
                        me.dom.prepay.html(preprice);
                        me.dom.prepay_old.html('');
                    }
                }
            }
        }
        ,r_init:function(){
            var me = this;
            this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});

            this.dom.btpay.aclick(function(){
                me.c_startPay();
                var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.D('D5');}

                window.TongjiObj.orderpay('click', 'pay');
            });

            this.dom.btmodifycarid.aclick(function(){
                me.c_modifycarid();
                //修改车牌号的情况：D3
                var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.D('D3');}
            });
            this.dom.coupon_panel.find('a').aclick(function(){
                 if(me.dom.coupon_panel.hasClass('mui-active')){
                                                   me.dom.coupon_panel.removeClass('mui-active');
                                                   }else{
                                                   me.dom.coupon_panel.addClass('mui-active');
                                                   }
                                                   me.iscroll.refresh();
            });
            
            setTimeout(function(){me.dom.pay_method.show();me.iscroll.refresh();});
        }
        ,setdata:function(data,ext){
            this.nowdata =  data;
            this.extinfo = ext;
            this.c_tongji();
        }

        ,c_tongji:function() {
            var label = "";
            window.TongjiObj.orderpay('pv', label);
        }
        ,c_modifycarid:function(fn){
            var me = this;
            sysmanager.loadpage('views/', 'userinfo', null, '个人信息',function(v){
                                if(fn){
                                v.obj.qcheck = true;
                                }
                                v.obj.onclose = function(info){
                                var defaultcarid = null;
                                for(var i=0;i<info.carids.length;i++){
                                var d = info.carids[i];
                                if('1' == d.status+''){
                                defaultcarid = d.carid;
                                break;
                                }
                                }
                                me.dom.carid.html(defaultcarid || '没有设置车牌');
                                
                                me.extinfo.c = defaultcarid;
                                
                                fn && fn(defaultcarid);
                                }
                                v.obj.c_showquit(true);
                                });
        }
        ,c_startPay:function(){
            var me = this;
            var method = $('[name="paymethod"]:checked').val();

            if (!this.extinfo.c) {
                this.c_modifycarid(function (carid) {
                    if (carid) {
                        if ('alipay' == method) {
                            innerpay_app();
                        } else if ('weixin' == method) {
                            alipay_app();
                        } else {
                            sysmanager.alert('请选择支付方式');
                        }
                    }
                });
            } else {
                if (sysmanager.isapp) {
                    if ('alipay' == method) {
                        alipay_app();
                    } else if ('weixin' == method) {
                        innerpay_app();
                    } else {
                        sysmanager.alert('请选择支付方式');
                    }
                } else {
                    innerpay();
                }

            }
            var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.D('D1');}
            function innerpay(){
                me.m_startPay(me.nowdata.id,(me.dqselectdata?me.dqselectdata.id:0), function(data){
                              me.nowoid = data.oid;
                              //alert(data.oid);
                              //return [alert('跳过支付直接成功![测试s]'), me.c_startPayok()];
                              console.log(data);
                              WeixinJSBridge.invoke('getBrandWCPayRequest', data.paydata,function(res){
                                                    //WeixinJSBridge.log(res.err_msg);
                                                    //alert(res.err_code+'\n'+res.err_desc+'\n'+res.err_msg);
                                                    if('get_brand_wcpay_request:ok' == res.err_msg){
                                                    me.c_startPayok();
                                                    
                                                    }else{
                                                    //                             alert(res.err_msg);
                                                    me.c_startPayfalid();
                                                    }
                                                    });
                              });
            }
            function innerpay_app(){
                me.m_startPay_app(me.nowdata.id,(me.dqselectdata?me.dqselectdata.id:0), function(data){
                                  me.nowoid = data.oid;
                                  //alert(data.oid);
                                  //return [alert('跳过支付直接成功![测试s]'), me.c_startPayok()];
                                  
                                  console.log(data);
                                  /**
                                   * oid:
                                   * paydata:* Object
                                   *  appid:
                                   *  noncestr:
                                   *  partnerid:
                                   *  prepayid:
                                   *  timestamp:
                                   *  Object
                                   */
                                  var paydata = data.paydata;
                                  
                                  
                                  //绑定窗口事件（只一次）
                                  window.removeEventListener("message", me.innerpay_app_onmessage);
                                  window.addEventListener("message", me.innerpay_app_onmessage, false );
                                  //发送支付信息给父窗口
                                  me.innerpay_app_postmessage(JSON.stringify({t:'pay',d:paydata}));
                                  });
            }
            function alipay_app() {
                me.m_startAlipay(me.nowdata.id,(me.dqselectdata?me.dqselectdata.id:0), function(data) {
                    me.nowoid = data.orderId;

                    console.log(JSON.stringify(data));

                    window.removeEventListener("message", me.alipay_onmessage);
                    window.addEventListener("message", me.alipay_onmessage, false);
                    window.parent.postMessage(JSON.stringify({t:'alipay', d:data}), '*');
                });
            }
            //发送信息到父窗口
        }
        ,innerpay_app_postmessage:function(data){   //发送支付信息
            window.parent.postMessage(data,'*');
        }
        ,innerpay_app_onmessage:function(event){         //接受支付信息返回
            var me = ui;
            var data = JSON.parse(event.data);
            if(data.t == 'pay'){
                var success = data.d;
            if(0 == success.code){
                me.c_startPayok();
            }else{
                sysmanager.alert({'-1':'支付失败','-2':'支付参数错误'}[success.code+'']);
                me.c_startPayfalid();
            }
            }
        }
        ,c_startPayok:function(){           //预付款成功
            if(sysmanager.isapp){
                this.innerpay_app_postmessage(JSON.stringify({t:'nav',d:{target:'iframe3',href:'userorder'}}));
            }else{setTimeout(function(){window.clear2Init('userorder');});}
            
            //支付成功：D6
            var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.A('D6');}

            window.TongjiObj.orderpay('info', 'B1');

        }
        ,c_startPayfalid:function(){        //预付款失败
            //alert('预付款失败');
            //this.c_startPayok();
        }
        ,m_startPay:function(pid,cid, fn){
            var me = this;
            window.myajax.userget('index','genorder',{pid:pid,cid:cid?cid:0}, function(result){
                                  me.couponlist = null;
                                  fn && fn(result.data);
                                  }, null, false);
        }
        ,m_startPay_app:function(pid,cid, fn){      //app支付接口
            var me = this;
            //genOrderAPP($pid, $cid)
            window.myajax.userget('index','genOrderAPP',{pid:pid,cid:cid?cid:0}, function(result){
                                  me.couponlist = null;
                                  fn && fn(result.data);
                                  }, null, false);
        }
        ,m_startAlipay:function(pid, cid, fn){      //app支付接口
            var me = this;
            //genOrderAPP($pid, $cid)
            window.myajax.userget('index','genOrderAlipay',{pid:pid,cid:cid?cid:0}, function(result){
                me.couponlist = null;
                fn && fn(result.data);
            }, null, false);
        }
        ,m_getcoupon:function(fn){      //获取抵扣我的券列表
            if(this.couponlist){
                fn && fn(this.couponlist);
            }else{
                window.myajax.userget('index','listMyCoupons',{all:0}, function(result){
                                      fn && fn(result.data.coupon);

                                      if(result.data.coupon && result.data.coupon.length>0){
                                          window.TongjiObj.orderpay('info', 'A1');

                                      }else{
                                          window.TongjiObj.orderpay('info', 'A0');
                                      //没有抵用劵的情况：D2
                                      var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.D('D2');}
                                      }
                                      
                                      }, null, false);
                setTimeout(function(){sysmanager.loading.hide();});
            }
        }
        ,close:function(){

        }
    };
    return  ui;
}
