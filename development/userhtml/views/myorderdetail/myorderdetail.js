/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_myorderdetail(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            panel:{
                order_no:'[name=order_no]'
                ,order_pay:'[name=order_pay]'
                ,order_detail:'[name=orderdetail_pagecontainer]'
            }
            ,orderpanel:{
                title:'[name=order_pay] [name=title]'
                ,address:'[name=order_pay] [name=address]'
                ,btdaohang:'[name=order_pay] [name=btdaohang]'
                ,parkrule:'[name=order_pay] [name=parkrule]'
                ,starttime:'[name=order_pay] [name=starttime]'
                ,cost:'[name=order_pay] [name=cost]'
                ,costdetail:'[name=order_pay] [name=costdetail]'
                ,cost_r:'[name=order_pay] [name=cost_r]'
                ,cost_c:'[name=order_pay] [name=cost_c]'
                ,btdetail:'[name=order_pay] [name=btdetail]'
                ,endtime:'[name=order_pay] [name=endtime]'
            }
            ,orderdetailpanel:{
                btclose:'[name=orderdetail_pagecontainer] [name=btclose]'
                ,starttime:'[name=orderdetail_pagecontainer] [name=starttime]'
                ,stoptime:'[name=orderdetail_pagecontainer] [name=stoptime]'
                ,totalFee:'[name=orderdetail_pagecontainer] [name=totalFee]'
                ,preFee:'[name=orderdetail_pagecontainer] [name=preFee]'
                ,remainFee:'[name=orderdetail_pagecontainer] [name=remainFee]'
                ,btpay:'[name=orderdetail_pagecontainer] [name=btpay]'
            }
            ,lianxipanel:{
                list:'[name=lianxipanel]'
                ,lianxipanel_row:'.template [name=lianxipanel_row]'
            }
            ,scrolldom:'.myorderdetail_html_contaion'
            ,dqpanel:{
                panel:'[name=dqpanel]'
                ,active:'[name=dqpanel]>a'
                ,list:'[name=dqpanel] [name=list]'
                ,'qurow-1':'[name=dqpanel] .template [name=row-1]'
                ,'qurow0':'[name=dqpanel] .template [name=row0]'
                ,'qurownone':'[name=dqpanel] .template [name=rownone]'
                ,'couponinfo':'[name=dqpanel] [name=couponinfo]'
            }
            ,waittimedom:'[name=waittime]'
        }
        ,iscroll:null
        ,oid:null
        ,handler:null
        ,data:null              //当前的订单数据
        ,dqselectdata:null             //抵扣券的使用数据
        ,waittimes:0
        ,init:function(context){
            if (!this.isInit){
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            this.c_init();
        }
        ,c_clearHandler:function(){
            if(this.handler){
                clearInterval(this.handler);
            }
            this.handler = null;
        }
        ,initoid:function(oid){
            this.oid = oid;
        }
        ,initWait:function(times){     //设置加载等待时间
            this.waittimes = times || 0;
        }
        ,c_initinfo:function(){
            var me = this;
            this.c_clearHandler();
            if(this.oid){
                this.m_getordedertailFromoid(this.oid, function(data){
                    me.c_fill(data);
                });
            }else{
                this.m_getordedertail(function(data){
                    me.c_fill(data);
                });
            }
        }
        ,c_init:function(){
            var me = this;
            this.dom.panel.order_no.hide();
            this.dom.panel.order_pay.hide();
            if(this.waittimes>0){
                setTimeout(function(){
                    sysmanager.alert('您的车位最晚将于15分钟后开始计费，请尽快赶到停车场，谢谢！', '订单成功支付并已通知管理员');
                    me.c_initinfo();
                    me.dom.orderpanel.btdetail.hide();
                },this.waittimes);
            }else{
                this.dom.waittimedom.hide();
                me.c_initinfo();
            }
        }
        ,c_fill:function(data){
            this.dom.waittimedom.hide();
            this.dom.panel.order_no.hide();
            this.dom.panel.order_pay.hide();

            if(!data){
                this.c_fill_order_no(); //没有最后的缴费清单
            }else{
                this.data = data;
                this.oid = data.oid;
                this.c_fill_pay(data);
                //不需要再缴费的状态：E1
                //需要缴费结清的状态：E2
                var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.E('E1');}
            }
        }
        ,c_fill_coupon:function(coupon, refreshscroll){            //填充卡券列表
            console.log(coupon);
            this.dqselectdata = null;
            this.dom.dqpanel.list.empty();
            if(coupon || coupon.length){
                var list = [];
                for(k in coupon){
                    var data = coupon[k];
                    data.id = k;
                    list.push(data);
                }
                list.sort(function(a,b){
                    return a.t - b.t;
                });
                for(var i=0;i<list.length;i++){
                    var data = list[i];
                    var row = this.c_getcoupon_row(data);
                    this.dom.dqpanel.list.append(row);
                }
                this.dom.dqpanel.couponinfo.html('可用抵用券<span>{0}</span>张'.replace('{0}',list.length));
            }else{
                this.dom.dqpanel.list.append(this.dom.dqpanel.qurownone.clone());
                this.dom.dqpanel.couponinfo.html('当前无可用抵用券');
            }
            if(!!refreshscroll){
                this.c_refshScroll();
            }

        }
        ,c_getcoupon_row:function(data){
            var me = this;
            var row = null;
            switch (data.t+''){
                case '-1':              //1元券
                    row = this.dom.dqpanel['qurow-1'].clone();
                    break;
                case '0':               //抵消券
                    row = this.dom.dqpanel['qurow0'].clone();
                    row.find('[name=money]').html(data.m);
                    break;
            }
            row.click(function(){
                me.c_couponrow_active(data, $(this));
            });
            return row;
        }
        ,c_couponrow_active:function(data,row){
            var clsname = 'mui-active'
            if(this.dqselectdata && this.dqselectdata.id == data.id){           //选择后在选择：取消选择
                this.dqselectdata = null;
                row.removeClass(clsname);

            }else{      //选择
                this.dom.dqpanel.list.find('>*').removeClass(clsname);
                row.addClass(clsname);
                this.dqselectdata = data;
            }
            this.c_refreshPaymoney();
        }
        ,c_refreshPaymoney:function(){          //刷新需要支付的钱
            console.log(this.dqselectdata);
            var data = this.data;
            if(!this.dqselectdata){
                this.dom.remainFee.html(Math.round(data.remainFee*100)/100);
                var list = [];
                for(k in this.data.coupon){
                    var data = this.data.coupon[k];
                    data.id = k;
                    list.push(data);
                }
                this.dom.dqpanel.couponinfo.html('可用抵用券<span>{0}</span>张'.replace('{0}',list.length));
            }else{
                var m = Math.round(data.remainFee*100)/100;
                if('1' == this.dqselectdata.t+''){
                    m = 1;
                    this.dom.dqpanel.couponinfo.html('只付1元');
                }else{
                    m = m - this.dqselectdata.m;
                    this.dom.dqpanel.couponinfo.html('减免{0}元'.replace('{0}',this.dqselectdata.m));
                }
                m =  Math.round(m*100)/100;
                if(m<0){
                    m = 0.1;
                }
                this.dom.remainFee.html(m);
            }
        }
        ,c_fill_order_no:function(){
            this.dom.panel.order_no.show();
        }
        ,c_fill_lianxi:function(datas){      //填充联系
            if(datas && datas.length>0){
                this.dom.lianxipanel.list.empty();
                this.dom.lianxipanel.list.parent().show();
                for(var i=0;i<datas.length;i++){
                    var data = datas[i];
                    var row = this.c_getLianxirow(data, 0==i);
                    this.dom.lianxipanel.list.append(row);
                }
            }else{
                this.dom.lianxipanel.list.parent().hide();
            }
        }
        ,c_refshScroll:function(){
            if(this.iscroll){
                var me = this;
                setTimeout(function(){me.iscroll.refresh();});
            }
        }
        ,c_getLianxirow:function(data, isfirst){
            var me = this;
            var row = this.dom.lianxipanel.lianxipanel_row.clone();
            row.find('[name=name]').html(data.nickname);
            if(data.phone){
                row.find('[name=btlianxi]').attr('href','tel:'+data.phone).aclick(function(){
                    //拨打管理员电话：E3
                    var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.E('E3');}
                });
            }else{
                row.find('[name=btlianxi]').hide();
            }
            if(!isfirst){
                row.addClass('other');
            }else{
                row.find('[name=btmore]').aclick(function(){
                    me.dom.lianxipanel.list.addClass('all');
                    me.c_refshScroll();
                    return false;
                });
                row.find('[name=btmore_none]').aclick(function(){
                    me.dom.lianxipanel.list.removeClass('all');
                    me.c_refshScroll();
                    return false;
                });
            }
            return row;
        }
        ,c_fill_pay:function(data){
            var me = this;
            
            this.dom.orderdetailpanel.starttime.html(data.startTime);
            var stoptime = utils.tools.t2s(new Date - data.startTimeStamp*1000);
            this.dom.orderdetailpanel.stoptime.html(stoptime);
            this.dom.orderdetailpanel.totalFee.html(data.totalFee);
            this.dom.orderdetailpanel.preFee.html(parseInt((data.totalFee*100 - data.remainFee*100))/100);
            var remainFee = data.remainFee>0?Math.round(data.remainFee*100)/100:0;
            this.dom.orderdetailpanel.remainFee.val(remainFee);
            
            this.dom.panel.order_pay.show();
            this.dom.orderpanel.title.html(data.name);
            this.dom.orderpanel.address.html(data.address);
            this.dom.orderpanel.parkrule.html(data.rule);
            this.dom.orderpanel.starttime.html(data.startTime);
            var cost = parseInt((data.totalFee - data.remainFee)*100)/100;
            this.dom.orderpanel.cost.html(cost);
            if(data.cost_r < cost){
                this.dom.orderpanel.cost_r.html(data.cost_r);
                this.dom.orderpanel.cost_c.html(parseInt((cost - data.cost_r)*100)/100);
                this.dom.orderpanel.costdetail.show();
            }else{
                this.dom.orderpanel.costdetail.hide();
            }
            var endtime = new Date();
            endtime.setTime(endtime.getTime() + data.remaintime*1000);
            this.dom.orderpanel.endtime.html(endtime.Format("yyyy-MM-dd hh:mm:ss"));

            this.c_fill_lianxi(data.admin);

            this.c_fill_coupon(data.coupon);

            this.c_refshScroll();
        }
        ,m_getordedertail:function(fn){         //获取没有结算的订单
            //duduche.me/driver.php/home/index/getOrder
            window.myajax.userget('index','getOrder',{last:1}, function(result){
                fn && fn(result.data);
            }, null, false);
        }
        ,m_getordedertailFromoid:function(oid, fn){         //获取没有结算的订单
            //duduche.me/driver.php/home/index/getOrder
            window.myajax.userget('index','detailOrder',{oid:oid}, function(result){
                fn && fn(result.data);
            }, null, false);
        }
        ,m_checkout_start:function(oid, fee, fn){         //获取没有结算的订单
            //duduche.me/driver.php/home/index/checkOut /oid/1/
            var fee_i = parseInt(100*fee);
            if(fee_i <= 0){
                sysmanager.alert("输入的金额不正确！");
                return;
            }
            var data = {oid:oid};
            if(this.dqselectdata){
                data.cid = this.dqselectdata.id;
            }else{

            }
            //var fee_s = parseInt(100*this.data.remainFee);
            //if(fee_s != fee_i){
                data.fee = fee_i/100;
            //}
            window.myajax.userget('index','checkOut', data, function(result){
                fn && fn(result.data);
            }, null, false);
        }
        ,m_checkout_start_app:function(oid, fee, fn){         //获取没有结算的订单(app支付)
            //duduche.me/driver.php/home/index/checkOut /oid/1/
            var fee_i = parseInt(100*fee);
            if(fee_i <= 0){
                sysmanager.alert("输入的金额不正确！");
                return;
            }
            var data = {oid:oid};
            if(this.dqselectdata){
                data.cid = this.dqselectdata.id;
            }else{

            }
            //var fee_s = parseInt(100*this.data.remainFee);
            //if(fee_s != fee_i){
                data.fee = fee_i/100;
            //}
            window.myajax.userget('index','checkOutApp', data, function(result){
                fn && fn(result.data);
            }, null, false);
        }
        ,r_init:function(){
            var me = this;
            //this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});
            this.dom.orderdetailpanel.btpay.aclick(function(){
                if(sysmanager.isapp){
                    me.c_checkout_start_app();
                }else{
                    me.c_checkout_start();
                }
            });
            this.dom.orderdetailpanel.btclose.aclick(function(){
                me.dom.panel.order_detail.hide();
            });
            this.dom.orderpanel.btdaohang.aclick(function(){
                sysmanager.loadpage('views/', 'parkinfo', null, me.data.name,function(v){
                    v.obj.setdata(me.data);
                });
            });
            this.dom.orderpanel.btdetail.aclick(function(){
                me.dom.panel.order_detail.show();
            });
            this.dom.dqpanel.active.click(function(){
                me.dom.dqpanel.panel.toggleClass('mui-active');
                me.c_refshScroll();
            });
        }
        ,c_checkout_start:function(){
            var me = this;
            //alert(this.oid);
            this.m_checkout_start(this.oid, this.dom.orderdetailpanel.remainFee.val(), function(data){
                //return [alert('跳过支付直接成功［测试］'), me.c_startPayok()];
                WeixinJSBridge.invoke('getBrandWCPayRequest', data,function(res){
                    //WeixinJSBridge.log(res.err_msg);
                    //alert(res.err_code+'\n'+res.err_desc+'\n'+res.err_msg);
                     if('get_brand_wcpay_request:ok' == res.err_msg){
                         me.c_startPayok();
                     }else{
                         me.c_startPayfalid();
                     }
                 });
            });
        }
        ,c_checkout_start_app:function(){
            var me = this;
            this.m_checkout_start_app(this.oid, this.dom.orderdetailpanel.remainFee.val(), function(data){

                //me.nowoid = data.oid;
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
                var paydata = data;


                //绑定窗口事件（只一次）
                window.removeEventListener("message", me.innerpay_app_onmessage);
                window.addEventListener("message", me.innerpay_app_onmessage, false );
                //发送支付信息给父窗口
                me.innerpay_app_postmessage(JSON.stringify(paydata));
            });
        }
        ,innerpay_app_postmessage:function(data){   //发送支付信息
            window.parent.postMessage(data,'*');
        }
        ,innerpay_app_onmessage:function(event){         //接受支付信息返回
            var me = ui;
            var success = JSON.parse(event.data);
            if(0 == success.code){
                  me.c_startPayok();
              }else{
                  sysmanager.alert({'-1':'支付失败','-2':'支付参数错误'}[success.code+'']);
                  me.c_startPayfalid();
              }
        }
        ,c_startPayok:function(){
           // alert('支付成功');
            this.c_initinfo();
        }
        ,c_startPayfalid:function(){
            //alert('支付失败');
        }
        ,close:function(){
            this.c_clearHandler();
            this.onclose && this.onclose();
        }
    };
    return  ui;
}
