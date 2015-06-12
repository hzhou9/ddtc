/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_userinfo(){
    var ui = {
        isInit: false
        ,context:null
        ,dom:{
            telphone:'[name=telphone]'
            ,pailist:'[name=pailist]'
            ,row:'.template [name=row]'
            ,row_head:'.template [name=row_head]'
            ,row_tail:'.template [name=row_tail]'
            ,btreg:'[name=btreg]'
            ,btquit:'[name=btquit]'
            ,coupon:'[name=coupon]'
            ,order:'[name=order]'
            ,btmyorder:'[name=myorder]'
        }
        ,iscroll:null
        ,info:null
        ,showquit:false
        ,init:function(context){
            if (!this.isInit){
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            /*
            if(this.showquit){
                this.dom.btquit.show();
            }
            */
            this.c_init();
        }
        ,c_init:function(){
            var me = this;
            var model = utils.tools.getUrlParam('m');
            if('userorder' == model){
                sysmanager.loadpage('views/', 'myorderdetail', null, '订单明细',function(v){v.obj.waittimes=3000;v.obj.onclose = function(){setTimeout(function(){me.iscroll && me.iscroll.refresh();});}});
            }
            this.m_getuserinfo(function(data){
                me.info = data;
                me.info.carids = me.info.carids || [];
                me.c_fill(me.info);
                me.dom.coupon.find('strong').html(me.info.c_count);
                if(me.info.l_order){
                    me.dom.order.find('[name=title]').html(me.info.l_order.parkname);
                    me.dom.order.find('[name=cost]').html(me.info.l_order.cost);
                    me.dom.order.find('[name=address]').html(me.info.l_order.address);
                    me.dom.order.find('[name=time]').html(me.info.l_order.startTime);
                    me.dom.order.find('[name=row]').click(function(){
                        sysmanager.loadpage('views/', 'myorderdetail', null, '订单明细',function(v){
                            v.obj.initoid(me.info.l_order.oid);
                            v.obj.onclose = function(){};
                        });
                    });
                }else{
                    me.dom.order.hide();
                }
            });
        }
        ,c_showquit:function(isshow){
            this.showquit = !!isshow;
        }
        ,c_fill:function(info){
            var me = this;
            this.dom.telphone.html(info.telephone);
            this.c_fillcarid(info.carids);
            setTimeout(function(){me.iscroll && me.iscroll.refresh();});
        }
        ,c_fillcarid:function(carids){
            var me = this;
            //carid
            this.dom.pailist.empty().unbind();
            var row_head = this.dom.row_head.clone();
            if(carids.length==0){
                row_head.find('name=row_head_hint').html('您还没有设置车牌，请添加');
            }
            this.dom.pailist.append(row_head);
            if(carids.length>0){
                for(var i=0;i<carids.length;i++){
                    var d = carids[i];
                    var row = this.c_getcaridrow(d);
                    this.dom.pailist.append(row);
                }
            }
            var row_tail = this.dom.row_tail.clone();
            row_tail.find('[name=btadd]').click(function(){
                                              me.c_addCarid();
                                              });
            this.dom.pailist.append(row_tail);
        }
        ,c_getcaridrow:function(data){
            var me=  this;
            var row = this.dom.row.clone();
            row.find('b').html(data.carid);
            if('1' == data.status+''){
                row.addClass('mui-active');
            }else{
                row.click(function(){
                    me. c_rowactive(row, data);
                });
            }
            row.find('a').click(function(){
                me.c_rowcaridedit(row, data);
                return false;
            });
            row.find('.table [name=btcancel]').click(function(){
                row.find('.table input').blur();
                row.removeClass('edit');
                return false;
            });
            row.find('.table [name=btsave]').click(function(){
                me.c_rowcraideitsave(row, data);
                return false;
            });
            return row;
        }
        ,c_rowcraideitsave:function(row, data){

            var carid = row.find('.table input').val();
            carid = this.c_valideCarid(carid);
            if(carid){
                var me = this;
                this.m_modifycadid(data.id, carid, function(data){
                    me.info = data;
                    me.c_fill(me.info);
                })
            }
        }
        ,c_rowcaridedit:function(row, data){
            this.dom.pailist.find('>').removeClass('edit');
            row.addClass('edit');
            row.find('.table input').val(data.carid).focus();
        }
        ,c_rowactive:function(row, data){
            var me = this;
            if(!row.hasClass('edit')){
                sysmanager.confirm('设置<span style="color:#16a7de">{0}</span>为当前使用的默认车牌?'.replace('{0}',data.carid),function(){
                   me.m_setdefaultcarid(data.id,function(){
                       var info = me.info;
                          for(var i=0;i<info.carids.length;i++){
                              var d  = info.carids[i];
                              if(d.id == data.id){
                                  d.status = 1;
                              }else{
                                  d.status = 0;
                              }
                          }
                          me.c_fillcarid(me.info.carids);
                   });

               });
            }
        }
        ,c_addCarid:function(){
            var inputbox = this.dom.pailist.find('[name=input_add]');
            var carid = inputbox.val();
            inputbox.blur();

            carid = this.c_valideCarid(carid);
            if(carid){
                var me = this;
                this.m_addcadid(carid, function(data){
                    me.info = data;
                    me.c_fill(me.info);
                    inputbox.val('');
                    
                    if(!me.from_menu && me.info.carids.length == 1){
                    	//第一次添加
                    	me.dom.btquit.show();
                    }
                })
            }
        }
        ,c_valideCarid:function(carid){
            carid = carid.replace(/[ ]/g,"");
            carid = carid.toUpperCase();

            if(!carid){
                sysmanager.alert('请输入正确的车牌号!');
                return false;
            }
            var msg = [];
            //验证重复
            for(var i = 0;i<this.info.carids.length;i++){
                var d = this.info.carids[i];
                if(d.carid == carid){
                    msg.push('车牌号<span style="color: #16a7de">{0}</span>已经存在'.replace('{0}', carid));
                }
            }
            if(msg.length){
                sysmanager.alert(msg.join('<br>'));
                return false;
            }else{
                return carid;
            }
        }
        ,c_quit:function(){
            var me = this;
            var c = me.context.parent().parent();
            sysmanager.pagecontainerManager.hide(c);
            me.close();
        }
        ,r_init:function(){
            var model = utils.tools.getUrlParam('m');
            if('userinfo' == model || 'userorder' == model){
                this.from_menu = true;
                this.dom.coupon.show();
                this.dom.order.show();
            }
            var me = this;
            this.iscroll = new iScroll(this.context[0], {desktopCompatibility:true});
            this.dom.btreg.click(function(){
                sysmanager.loginUI(function(){
                    me.c_init();
                },'请输入要切换的手机号',true);
            });
            this.dom.btquit.click(function(){
                $('#topheardpagecontainer [name=btupclose]').click();
            });
            this.dom.btmyorder.click(function(){
                sysmanager.loadpage('views/', 'myorder', null, '我的订单',function(v){
                });
            });
            this.dom.coupon.click(function(){
                sysmanager.loadpage('views/', 'coupon', null, '我的优惠券',function(v){
                });
            });
        }
        ,close:function(){
            this.onclose && this.onclose(this.info);
        }
        ,m_getuserinfo:function(fn){
            window.myajax.userget('index','getDriverInfo',null, function(result){
                fn && fn(result.data);
            }, null, false);
        }
        ,m_addcadid:function(carid, fn){
            window.myajax.userget('index','addCarid',{carid:carid}, function(result){
                fn && fn(result.data);
            }, null, false);
        }
        ,m_modifycadid:function(id, carid, fn){
            window.myajax.userget('index','modifyCarid',{id:id,newCarid:carid}, function(result){
                fn && fn(result.data);
            }, null, false);
        }
        ,m_setdefaultcarid:function(id,fn){
            window.myajax.userget('index','setDefaultCar',{id:id}, function(result){
                fn && fn(result.data);
            }, null, false);
        }
    };
    return  ui;
}
