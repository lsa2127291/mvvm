/**
 * Created by Administrator on 2016/5/24.
 */
function indexOf (value, arr) {
  var i, len;
  if(isArr(arr)){
    len = arr.length;
    for (i=0; i<len; i++) {
      if(arr[i] === value){
        return i;
      }
    }
  }
  return -1;
}
function isArr(it){
  return Object.prototype.toString.call(it)==='[object Array]';
}

function isObj(it){
  //console.log(it);
  //console.log( Object.prototype.toString.call(it));
  return Object.prototype.toString.call(it)==='[object Object]';
}

function extendDep(){
  var target = arguments[0] || {};
  var sources = Array.prototype.slice.call(arguments,1);
  var srcLen=sources.length;
  for(var i=0;i<srcLen;i++){
    var source=sources[0];
    for(var prop in source){
      var tgt=target[prop];
      var src=source[prop];
      //同时防止源对象为循环引用对象和源对象的属性引用目标对象导致无限循环
      if(src === source || src === target){
        continue;
      }
      if(isArr(src)){
        tgt = tgt && isArr(tgt)?tgt:[];
        target[prop]=extendDep(tgt,src);
      }
      else if(isObj(src)){
        tgt = tgt && isObj(tgt)?tgt:{};
        target[prop]=extendDep(tgt,src);
      }
      else if(src !== undefined){
        target[prop] = src;
      }
    }
  }
  return target;
}

function Observer (vm) {
  this.$observers = [];
  this.$valuesMap = [];
  this.$callbacks = vm.$callbacks;
  this.depBind(vm.$model, '');
}
Observer.prototype.triggerChange = function (paths,prop,value) {
  var field = paths + prop, callbacks = this.$callbacks[field], cLen = callbacks.length, i;
  for (i = 0; i　< cLen; i++) {
    callbacks[i][0].apply(callbacks[i][1],[value]);
  }
};

Observer.prototype.depBind = function (data,paths) {
  //console.log(paths);
  for(var prop in data) {
    if(data.hasOwnProperty(prop)) {
      this.setCache(data, data[prop]);
      this.bindChange(data, prop, paths);
    }
  }
};
Observer.prototype.setCache = function (object,prop,value) {
  var observers = this.$observers;
  var valuesMap = this.$valuesMap;
  var len = observers.length;
  var index = indexOf(object, this.$observers);
  if (index === -1) {
    observers.push(object);
    valuesMap[len] = extendDep({},object);
  } else {
    valuesMap[index][prop] = value;
  }
};
Observer.prototype.getCache = function (object,prop) {
  var index = indexOf(object, this.$observers);
  var value = (index === -1) ? null : this.$valuesMap[index];
  return value ? value[prop] : value;
};
Observer.prototype.bindChange = function (object, prop, paths) {
  var newPaths;
  Object.defineProperty(object,prop,{
    set: (function(value){
      var oldVal = this.getCache(object,prop);
      if(oldVal !== value){
        this.setCache(object,prop,value);
        this.triggerChange(paths, prop, value)
      }
    }).bind(this),
    get: (function(){
      return this.getCache(object, prop);
    }).bind(this)
  });
  if (isArr(object[prop]) || isObj(object[prop])) {
    newPaths = paths +  prop + '.';
    this.depBind(object[prop], newPaths);
  }
};
