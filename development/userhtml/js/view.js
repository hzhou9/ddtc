/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:46
 * To change this template use File | Settings | File Templates.
 */


var viewManager = (function(){
    var root = 'views/';
    var htmldata = {};

    var view = function(wininfo){
        this.dom = wininfo.dom;
        this.obj = wininfo.obj;
    }
    var extstr = new Date()-0;
    view.prototype.renderer = function(contaion, arg){
        var coverpage = $('#coverpage');
        coverpage.show();
        this.dom.appendTo(contaion);
        var me = this;
        setTimeout(function(){
            setTimeout(function(){coverpage.hide();});
            me.obj.init(me.dom, arg);
        });
    }
    var obj = {
        viewroot:function(_root){
            root = _root;
        }
        ,loadview:function(viewname, callback){
            sysmanager.loading.show();
            
            var jsname = 'ui_'+viewname;
            var onload = function(html){
                var wininfo = {
                   dom:html
                   ,obj:window[jsname]()
                };
                var myview = new view(wininfo);
                callback(myview);
                sysmanager.loading.hide();
            };
            var key = root + viewname;
            if(htmldata[key]){
                   onload(htmldata[key].clone(),jsname);
            }else{
                   var me = this;
                   var htmlurl = root + viewname +'/'+viewname+'.html?'+extstr;
                   $.get(htmlurl , function(html){htmldata[key] = $(html);onload(htmldata[key].clone(),jsname);});
            }
            var uid = myajax.uid();if(uid && uid > 41){window.TongjiObj.clickLink(viewname);}
        }
    }
    return obj;
})();
