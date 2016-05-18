/**
 * Created by Administrator on 2016/5/18.
 */
(function (global, factory) {
  // 同时支持commonjs和amd规范
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Fast = factory());
} (window, function (){
  var eventList = {};
  //类似于Function.prototype.bind方法，区别在于将obj前置，这样我觉得更易于理解bind
  function bind(obj, fn) {
    return function () {
      return fn.apply(obj, arguments);
    };
  }

  function on(name, fn) {
    var list = eventList[name] || [];
    list.push(fn);
  }

  function emit(name, params) {
    var list = eventList[name];
    var i;
    var len = list.length;
    for (i = 0; i < len; i++) {
      list[i](params);
    }
  }
}));

