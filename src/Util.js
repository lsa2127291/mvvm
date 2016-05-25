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
function trim (str) {
  var reg = /(?:^\s+) | (?:\s+$) | (?:[\n\r]+)/g;
  str.replace(reg, '');
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
