		/**
     *     入口链接点击跟踪：
             提示语中的链接：（分母：公共号的关注人数－A、活跃人数－A0）
                 附近空车位：A1
                 搜索地址：A2
                 停车缴费：A3
             菜单中的链接：（分母：公共号的关注人数、活跃人数）
                 附近：B1
                 搜索：B2
                 缴费：B3
                 我的订单：B4
                 我的卡券：B5
                 我的信息：B6
         主体下单流程：
             选择停车场：（分母：附近停车场列表页面－C、目的地停车场列表页面－C0）
                 列表中停车场全是满的状态：C1
                 列表中1000米范围内有可预定的停车场：C2
                 列表中1000～2000米范围内有可预定的停车场：C3
                 范围内无停车场的状态：C4
             预付下单：（分母：预付下单界面－D）
                 还没车牌的状态：D1
                 没有抵用劵的情况：D2
                 修改车牌号的情况：D3
                 点击导航按钮：D4
                 确认预付按钮点击：D5
                 支付成功：D6
             缴费结清界面：（分母：缴费结清页面－E）
                 不需要再缴费的状态：E1
                 需要缴费结清的状态：E2
                 拨打管理员电话：E3

         停车场详情页面 - parkinfo - F
         预付下单页面 - orderpay - D
         支付成功页面 - userorder - E

     * @type {*}
     */
    window.TongjiObj = (function(){
        var obj = {

            /**
             *  category：事件类别，必填项，表示事件发生在谁身上，如“视频”、“小说”、“轮显层”等等。
                 action：事件操作，必填项，表示访客跟元素交互的行为动作，如"播放"、"收藏"、"翻层"等等。
                 label：事件标签，选填项，用于更详细的描述事件，从各个方面都可以，比如具体是哪个视频，哪部小说，翻到了第几层等等。
                 value：事件值，选填项，整数型，用于填写打分型事件的分值，加载时间型事件的时长，订单型事件的价格等等。
                 nodeid：div元素id，选填项，填写网页中的div元素id值，用于在“用户视点”功能上重绘元素的事件发生情况。
             */
            push:function(category, action, label, value){
                var uid = myajax.uid();
                if(uid && uid <=41) {
                    //console.log('Hello Superman!');
                    return;
                }

                setTimeout(function(){
                    _czc.push(["_trackEvent", category, action, label || 0         ,value || 0 , null]);
//                    _hmt.push(['_trackEvent', category, action, opt_label || 0, opt_value] || 0);
//                    console.log('_czc.push','_trackEvent', category, action, label, value);
                });
            }
            ,clickLink:function(action){          //模块链接
                this.push('B','B_'+action);
            }
            ,A:function(action){        //附近空车位：A1搜索地址：A2停车缴费：A3,
                this.push('A', action);
            }
            ,
            /**
             * 列表中停车场全是满的状态：C1
             * 列表中1000米范围内有可预定的停车场：C2
             * 列表中1000～2000米范围内有可预定的停车场：C3
             * 范围内无停车场的状态：C4
             * 范围内无停车场的状态：C4
             * @param active
             * @constructor
             */
            C:function(action){        //
                this.push('C', action);
            }
            ,
            /**
             *   还没车牌的状态：D1
                 没有抵用劵的情况：D2
                 修改车牌号的情况：D3
                 点击导航按钮：D4
                 确认预付按钮点击：D5
                 支付成功：D6
             * @param action
             * @constructor
             */
            D:function(action){
                this.push('D', action);
            }
            ,
            /**
            *   不需要再缴费的状态：E1
                 需要缴费结清的状态：E2
                 拨打管理员电话：E3
             * @constructor
             */
            E:function(action){
                this.push('E', action);
            },

            getlabel: function(label) {
                if (sysmanager.isapp) {
                    label += '+app1';
                } else {
                    label += '+app0';
                }

                if (myajax.uid()) {
                    label += '+auth1';
                } else {
                    label += '+auth0';
                }

                return label;
            }
            /**
             * A0: 信息
             * A1: 收费
             * A2: 免费
             * B1: 有引导图
             */
            ,parkinfo: function(action, label) {
                label = this.getlabel(label);
                this.push('parkinfo', action, label);
            }
            /**
             * A1: 有抵用券
             * B1: 支付成功
             */
            ,orderpay: function(action, label) {
                label = this.getlabel(label);
                this.push('orderpay', action, label);
            }
            /**
             * A1: 有合作停车场
             */
            ,discover: function(action, label) {
                label = this.getlabel(label);
                this.push('discover', action, label);
            }
            /**
             * A1: 有合作停车场
             */
            ,freelist: function(action, label) {
                label = this.getlabel(label);
                this.push('freelist', action, label);
            }
            /**
             * A1: 有普通停车场
             * D1: 有合作停车场
             * B1: 有免费停车场
             * C1: 有实惠停车场
             */
            ,map: function(action, label) {
                label = this.getlabel(label);
                this.push('map', action, label);
            }
            /**
             *
             */
            ,userinfo: function(action, label, value) {
                label = this.getlabel(label);
                this.push('userinfo', action, label, parseInt(value));
            }
        }
        return obj;
    })();