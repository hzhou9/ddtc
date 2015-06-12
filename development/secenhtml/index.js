
				//接受消息处理
        (function receiveInfoFromAnotherDomain(){

            (function(){
                var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bparent\b/ : /.*/;
                var Class = function(){};
                Class.extend = function(prop) {
                        var parent = this.prototype;

                        initializing = true;
                        var prototype = new this();
                        initializing = false;

                        for( var name in prop ) {
                            if(
                                typeof(prop[name]) == "function" &&
                                    typeof(parent[name]) == "function" &&
                                    fnTest.test(prop[name])
                                ) {
                                prototype[name] = (function(name, fn){
                                    return function() {
                                        var tmp = this.parent;
                                        this.parent = parent[name];
                                        var ret = fn.apply(this, arguments);
                                        this.parent = tmp;
                                        return ret;
                                    };
                                })( name, prop[name] );
                            }
                            else {
                                prototype[name] = prop[name];
                            }
                        }
                        var ig = {
                            copy: function( object ) {
                                if(
                                    !object || typeof(object) != 'object' ||
                                        object instanceof HTMLElement ||
                                        //object instanceof ig.Class
                                        object instanceof Class
                                    ) {
                                    return object;
                                }
                                else if( object instanceof Array ) {
                                    var c = [];
                                    for( var i = 0, l = object.length; i < l; i++) {
                                        c[i] = ig.copy(object[i]);
                                    }
                                    return c;
                                }
                                else {
                                    var c = {};
                                    for( var i in object ) {
                                        c[i] = ig.copy(object[i]);
                                    }
                                    return c;
                                }
                            }
                        }

                        function Class() {
                            if( !initializing ) {
                                if( this.staticInstantiate ) {
                                    var obj = this.staticInstantiate.apply(this, arguments);
                                    if( obj ) {
                                        return obj;
                                    }
                                }
                                for( var p in this ) {
                                    if( typeof(this[p]) == 'object' ) {
                                        this[p] = ig.copy(this[p]); // deep copy!
                                    }
                                }
                                if( this.init ) {
                                    this.init.apply(this, arguments);
                                }
                            }
                            return this;
                        }

                        Class.prototype = prototype;
                        Class.constructor = Class;
                        Class.extend = arguments.callee;
                        Class.inject = function(prop) {
                            var proto = this.prototype;
                            var parent = {};
                            for( var name in prop ) {
                                if(
                                    typeof(prop[name]) == "function" &&
                                        typeof(proto[name]) == "function" &&
                                        fnTest.test(prop[name])
                                    ) {
                                    parent[name] = proto[name]; // save original function
                                    proto[name] = (function(name, fn){
                                        return function() {
                                            var tmp = this.parent;
                                            this.parent = parent[name];
                                            var ret = fn.apply(this, arguments);
                                            this.parent = tmp;
                                            return ret;
                                        };
                                    })( name, prop[name] );
                                }
                                else {
                                    proto[name] = prop[name];
                                }
                            }
                        };

                        return Class;
                    };
                var EventClass = Class.extend({
                        events:{}
                        ,bind:function(eventName,fireBack){
                            if('string' == typeof eventName){
                                var e = this.events[eventName];
                                if(!e){
                                    e = this.events[eventName] = [];
                                }
                                if('function' == typeof fireBack){
                                    e.push(fireBack);
                                }
                            }
                            return this;
                        }
                        ,unBind:function(eventName, fireBack){
                            var me = this;
                            if(!eventName){
                                for(var ename in this.events){
                                    this.events[ename] = null;
                                }
                            }else{
                                if('function' != fireBack){
                                    this.events[eventName] = null;
                                }else{
                                    var e = this.events[eventName];
                                    if(e){
                                        for(var i = 0;i<e.length;i++){
                                            if(fireBack == e[i]){
                                                e.splice(i,1);
                                            }
                                        }
                                    }
                                }
                            }
                            return this;
                        }
                        ,fire:function(eventName){
                            var e = this.events[eventName];
                            var returnValue = false;
                            if(e){
                                var arg = null;
                                if(arguments.length>1){
                                    arg = [];
                                    for(var i=1;i<arguments.length;i++){
                                        arg.push(arguments[i]);
                                    }
                                }
                                for(var i=0;i<e.length;i++){
                                    var cb = e[i];
                                    if(arg?cb.apply(this,arg):cb.apply(this)){
                                        returnValue = true;
                                    }
                                }
                            }
                            return returnValue;
                        }

                    });

                var pushManager =  EventClass.extend({
                    events:{}
                   ,bind:function(eventName,fireBack){
                       if('string' == typeof eventName){
                           var e = this.events[eventName];
                           if(!e){
                               e = this.events[eventName] = [];
                           }
                           if('function' == typeof fireBack){
                               e.push(fireBack);
                           }
                       }
                       return this;
                   }
                   ,unBind:function(eventName, fireBack){
                       var me = this;
                       if(!eventName){
                           for(var ename in this.events){
                               this.events[ename] = null;
                           }
                       }else{
                           if('function' != fireBack){
                               this.events[eventName] = null;
                           }else{
                               var e = this.events[eventName];
                               if(e){
                                   for(var i = 0;i<e.length;i++){
                                       if(fireBack == e[i]){
                                           e.splice(i,1);
                                       }
                                   }
                               }
                           }
                       }
                       return this;
                   }
                   ,fire:function(eventName){
                       var e = this.events[eventName];
                       var returnValue = false;
                       if(e){
                           var arg = null;
                           if(arguments.length>1){
                               arg = [];
                               for(var i=1;i<arguments.length;i++){
                                   arg.push(arguments[i]);
                               }
                           }
                           for(var i=0;i<e.length;i++){
                               var cb = e[i];
                               if(arg?cb.apply(this,arg):cb.apply(this)){
                                   returnValue = true;
                               }
                           }
                       }
                       return returnValue;
                   }
                    ,pushid:null
                    ,pushmsg:[]
                    ,PUSH_ID:function(pushid){
                        this.pushid = pushid;
//                        alert('pushid\n' + pushid);
                                                     this.fire('pushid');
                    }
                    ,PUSH_MSG:function(msg){
                        this.pushmsg.push(msg);
//                        alert('pushmsg\n' + msg);
                        this.fire('pushmsg');
                    }
                    ,getPushid:function(){
                        return this.pushid;
                    }
                    ,getPushmsg:function(){
                        return this.pushmsg.shift();
                    }
                    ,setMsg:function(info){
                        window.top.postMessage(info, "*");
                    }
                });


                window.PushManager = new pushManager({

                });

            })();

            window.addEventListener("message",function(ev){
                var personInfoJSON = JSON.parse(ev.data);

                if(personInfoJSON.pushid){      //当前是一个pushid推送
                    window.PushManager.PUSH_ID(personInfoJSON.pushid);
                }else if(personInfoJSON.t){         //当前是一个消息推送
                    window.PushManager.PUSH_MSG(ev.data);
                }else if(personInfoJSON.quit){
                    window.MyAppQuit && window.MyAppQuit();
                }
            });
        })();