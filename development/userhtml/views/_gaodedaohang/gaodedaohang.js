/**
 * Created with JetBrains WebStorm.
 * User: kk
 * Date: 15-1-9
 * Time: 上午11:55
 * To change this template use File | Settings | File Templates.
 */
function ui_gaodedaohang(){

    var ui;
    ui = {
        isInit:false
        , context:null
        , dom:{
            iframe:'iframe'
        }, iscroll:null
        , mapObj:null
        , targetdata:null            //目标数据
        , init:function (context) {
            if (!this.isInit) {
                this.isInit = true;
                this.context = context;
                utils.jqmapping(this.dom, context);
                this.r_init();
            }
            this.c_init();
        }, c_init:function () {
            var me = this;

            $(document.body).attr('ontouchmove','return true');
            console.log(this.targetdata);
            /**
             *
             * start	116.403124,39.940693	(必填)表示路线的起点。格式：（经度，纬度），小数点后不超过6位。若此参数为空，则默认使用HTML5获取用户位置作为起点。若此参数为空，则默认使用HTML5获取用户位置作为起点。部分手机或不支持。
             dest	116.481488,39.990464	(必填)用于表示待标注点的坐标。格式为（经纬，纬度），小数点后不超过6位。可通过高德坐标拾取工具获得某点的精确经纬度。
             destName	阜通西	(必填)，用于表示待标注点的文字描述。如“方恒国际中心”，鉴于移动端屏幕限制，字符最大支持数为8个，超过部分将不能显示。
             naviBy	car	(选填)表示用户希望指定的路线规划方式，取值为car/bus/walk，分别对应“驾车/公交/步行”三种方式。若用户使用此参数，则start不能为空。
             key	（您的KEY）	(必填)用户通过开发者控制台获取的密钥
             */
            var para={
                dest:this.targetdata.point.lng + ',' + this.targetdata.point.lat
                ,destName:this.targetdata.name
                ,key:'bc59f27d65900532cc4f3c1048dd6122'
            }

            var src = 'http://m.amap.com/navi/';
            var tmp = [];
            for(var k in para){
                tmp.push(k+'='+para[k]);
            }
            src +='?'+tmp.join('&');
            console.log(src);
            this.dom.iframe.attr('src', src);
        }
        , settarget:function (data) {
            this.targetdata = data;
        }
        , r_init:function () {
            var me = this;


        }, close:function () {
            $(document.body).attr('ontouchmove','return false');
        }
    };
    return  ui;
}
