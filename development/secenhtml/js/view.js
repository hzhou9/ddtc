/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 14-9-10
 * Time: 下午11:15
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'utils'], function($, utils){
    var root = '';
    var view = function(wininfo){
        this.dom = wininfo.dom;
        this.obj = wininfo.obj;
    }
    view.prototype.renderer = function(contaion, arg){
        this.dom.appendTo(contaion);
        var me = this;
        setTimeout(function(){
            me.obj.init(me.dom, arg);
        });

    }
    var obj = {
        viewroot:function(_root){
            root = _root;
        }
        ,loadview:function(viewname, callback){
            var wininfo = {
                dom:null
                ,obj:null
            };
            var me = this;
            var htmlurl = root + viewname +'/'+viewname+'.html';
            var jslurl = root + viewname +'/'+viewname+'.js';
            utils.sys.loading.show();
            $.get(htmlurl , function(html){
                wininfo.dom = $(html);
                require([jslurl], function(objfunc){
                    wininfo.obj = objfunc();
                    var myview = new view(wininfo);
                    callback(myview);
                    utils.sys.loading.hide();
                });
            });
        }
    }
    return obj;
});