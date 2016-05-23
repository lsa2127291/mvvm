/**
 * Created by Administrator on 2016/5/18.
 */
(function (global, factory) {
  // 同时支持commonjs和amd规范
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.Fast = factory());
} (window, function (){
  //var eventList = {};
  var dom=document;
  //
  ////类似于Function.prototype.bind方法，区别在于将obj前置，这样我觉得更易于理解bind
  //function bind(obj, fn) {
  //  return function () {
  //    return fn.apply(obj, arguments);
  //  };
  //}
  //
  //function on(name, fn) {
  //  var list = eventList[name] || [];
  //  list.push(fn);
  //}
  //
  //function emit(name, params) {
  //  var list = eventList[name];
  //  var i;
  //  var len = list.length;
  //  for (i = 0; i < len; i++) {
  //    list[i](params);
  //  }
  //}
  function createFragment() {
    return dom.createDocumentFragment();
  }

  function Watcher(data) {
    var watcher = this.$watcher = {};
    for(var prop in data) {
      if(data.hasOwnProperty(prop)){
        Object.defineProperty(watcher,prop,{
          set(value){
            console.log('update view to ' + value);
          },
          get(){
          }
        });
        watcher[prop]=data[prop];
        console.log(prop);
      }
    }
  }
  function Updater(){

  }

  function parse(){

  }
  function nodeToFragment(element) {
    var child;
    var fragment = createFragment();
    var cloneNode = element.cloneNode(true);

    while (child = cloneNode.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  }

  function parserElement(element){
    nodeToFragment(element);
  }
  function watcher(data){

  }

  function Fast(config) {
    if(!config.el) {
      throw new Error('not bind element');
    }
    var element = dom.querySelector(config.el);
    parserElement(element);
  }

  Fast.prototype.isElementNode = function() {
    return element.nodeType === 1;
  }
}));

