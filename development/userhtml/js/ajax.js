/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function(cfg, utils){
    var ajaxroot= window.cfg.ajaxroot;
    var userinfo = null;
    var userinfokey = 'userinfo';
    var key = 'uuid';
    var uid = 'uid';



    var process = function(result,model,control,data, success, error, myprocess){
        switch(result.code){
            case 0:     //正确返回
                return true;
            case 10:    //错误警告信息
                sysmanager.alert(result.data);
                return false;
            case 100:   //没有登录
                sysmanager.loginUI(function(){
                    myajax.userget(model,control,data, success, error, myprocess);
                },'本功能需要登录后才可以使用');
                return false;
        }
    }
    var myajax = {
        get:function(model,control,data, success, error, myprocess){        //myprocess true：表示自己处理状态
            var url = ajaxroot+model+'/'+control+'/';
            console.log(url);
            sysmanager.loading.show();
            $.ajax({
                url:url,       
                type:'GET',                                //jsonp 类型下只能使用GET,不能用POST,这里不写默认为GET
                dataType:'jsonp',                          //指定为jsonp类型
                data:data,                //数据参数
                jsonp:'callback',                          //服务器端获取回调函数名的key，
                //jsonpCallback:'myjsonpReturn',                   //回调函数名
                success:function(result){                  //成功执行处理，对应后台返回的getName(data)方法。
                    sysmanager.loading.hide();
                    console.log(result);
                    if(!!myprocess){
                        success && success(result);
                    }else if(process.apply(this, [result,model,control,data, success, error, myprocess])){
                        success && success(result);
                    }
                },
                error:function(msg){
                    sysmanager.loading.hide();
                    console.log(msg);
                }
            }); 
        }
        ,userget:function(model,control,data, success, error,myprocess){            //带用户身份的访问
            if(userinfo && uid && key){
                data = data || {};
                data.uid = this.uid();
                data.uuid = this.key();
            }
            this.get(model,control,data, success, error, myprocess);

        }
        ,userinfo:function(_userinfo){      //获取或者设置用户信息
            if(arguments.length>0) {
                userinfo = _userinfo;
                utils.cache.setItem(userinfokey,JSON.stringify(_userinfo));
            }else{

            }
            return userinfo;
        }
        ,key:function(){
            return userinfo && userinfo['uuid'];
        }
        ,uid:function(){
            return userinfo && userinfo['uid'];
        }
        ,clearInfo:function(){
            userinfo = null;
            window[key] = null;
            window[uid] = null;
            utils.cache.removeItem(userinfokey);
        }
    }
    window.myajax =  myajax;

    var tmp = utils.cache.getItem(userinfokey);

    userinfo = tmp?JSON.parse(tmp):null;
})(null, window.utils);

