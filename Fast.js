/**
 * Created by Administrator on 2016/5/18.
 */
(function (global, factory) {

  // 同时支持commonjs和amd规范
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.Fast = factory());
} (window, function (){
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

  function Compiler(vm) {
    this.$fragment = this.nodeToFragment(vm.$element);
    this.$unCompileElements = [];
    this.$directives = vm.$directives;
    this.$parser = new Parser(vm);
    this.compileElement(this.$fragment);
  }

  Compiler.prototype.isDirective = function(directive) {
    return indexOf(directive,this.$directives) !== -1;
  };

  Compiler.prototype.nodeToFragment = function(element) {
    var child;
    var fragment = document.createDocumentFragment();
    var cloneNode = element.cloneNode(true);
    while (child = cloneNode.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  };

  Compiler.prototype.isElementNode = function(element) {
    return element.nodeType === 1;
  };

  Compiler.prototype.isTextNode = function(element) {
    return element.nodeType === 3;
  };

  Compiler.prototype.hasDirective = function(node) {
    var nodeAttrs;
    var text = node.textContent;
    var reg = /\{\{.*\}\}/;
    var attrLen,i;
    if (this.isElementNode(node)) {
      nodeAttrs = node.attributes;
      attrLen = node.attributes.length;
      for (i=0; i<attrLen; i++) {
        if (this.isDirective(nodeAttrs[i].name)){
          return true;
        }
      }
    }
    else {
      if (this.isTextNode(node) && reg.test(text)) {
        return true;
      }
    }
    return false;
  };
  Compiler.prototype.compileElement = function(fragment, root) {
    var node, childNodes = fragment.childNodes;
    var len = childNodes.length;
    for (var i=0; i<len; i++) {
      node = childNodes[i];
      if (this.hasDirective(node)){
        this.$unCompileElements.push(node);
      }
      if (node.childNodes.length){
        this.compileElement(node,false);
      }
    }
    if (root) {
      this.compileNodes();
    }
  };

  Compiler.prototype.compileDirective = function (node, attr) {
    var direct = attr.name;
    var express = attr.value;
    switch (direct) {
      case 'v-text': this.$parser.parseVText(node, express); break;
    }
  };

  Compiler.prototype.compileText = function (node) {
    var text = trim(node.textContent);
    var regText = /\{\{(.+?)\}\}/g;
    var pieces, matches, content = [], i, pLen;
    pieces = text.split(regText);
    pLen = pieces.length;
    matches = text.match(regText);
    for (i = 0; i<pLen; i++){
      if (inArray('{{' + pieces[i] + '}}',matches)) {
        content.push('(' + pieces[i] + ')');
      }else {
        content.push('"' + pieces[i] + '"');
      }
    }
    this.$parser.parseVText(node, content);
  };

  Compiler.prototype.compile = function (node) {
    var nodeAttrs, attrsLen, directAttrs = [], attr, i, dAttarsLen;
    if (this.isElementNode(node)) {
      nodeAttrs = node.attributes;
      attrsLen = nodeAttrs.length;
      for (i = 0; i < attrsLen; i++) {
        attr = nodeAttrs[i];
        if (this.isDirective(attr)) {
          directAttrs.push(attr);
        }
      }
      dAttarsLen = directAttrs.length;
      for (i =0; i < dAttarsLen; i++) {
        this.compileDirective(node,directAttrs[i])
      }
    }
    else if(this.isTextNode(node)){
      this.compileText(node)
    }
  };
  Compiler.prototype.compileNodes = function() {
    var unCompileElements = this.$unCompileElements;
    var i,len = unCompileElements.length;
    var node;
    for (i = 0; i < len; i++) {
      node = unCompileElements[i];
      this.compile(node);
    }
  };

  function Parser(vm) {
    this.$model = vm.$model;
    this.$watcher = new Watcher(vm);
    this.$updater = new Updater();
  }
  Parser.prototype.hasPaths = function(paths) {
    var model = this.$model;
    var len = paths.length;
    for (var i=0; i<len; i++) {
      if(isObj(model) && model.hasOwnProperty(paths[i])){
        model = model[paths[i]];
      } else {
        return false;
      }
    }
    return true;
  };
  Parser.prototype.parseVText = function (node, express) {
    var paths, eLen, i, exp, text = '', field;
    if (isArr(express)) {
      eLen = express.length;
      for (i = 0; i < eLen; i++) {
        exp = express[i];
        if(exp[0] === '""'){
          text += exp.substr(1,exp.length-1);
        }else {
          field = trim(exp.substr(1,exp.length-1));
          text += express[field];
        }
      }
      this.$updater.updateTextContext(node, text);
    } else {
      paths = express.split('.');
      if (this.hasPaths(paths)) {
        field = Array.prototype.join.call(paths, '.');
        this.$updater.updateTextContext(node, this.$model[field]);
        this.$watcher.watch(field,this.$updater.updateTextContext(node, this.$model[field]));
      }
    }
  };

  function Watcher(vm) {
    this.$watcher.callbacks = vm.$callbacks;
    this.$model = vm.$model;
  }

  Watcher.prototype.hasPaths = function(paths) {
    var model = this.$model;
    var len = paths.length;
    for (var i=0; i<len; i++) {
      if(isObj(model) && model.hasOwnProperty(paths[i])){
        model = model[paths[i]];
      }
      else {
        return false;
      }
    }
    return true;
  };

  Watcher.prototype.watch = function(field, callback, context) {
    var callbacks = this.$watcher.callbacks;
    if (!callbacks[field]) {
      callbacks[field] = [];
    }
    callbacks[field].push([callback,context]);
  };

  function Observer (vm) {
    this.$observers = [];
    this.$valuesMap = [];
    this.$callbacks = vm.$callbacks;
    this.depBind(vm.$model);
  }
  Observer.prototype.triggerChange = function (object,prop,value) {
    console.log(object);
    console.log(prop);
    console.log(value);
  };

  Observer.prototype.depBind = function (data) {
    for(var prop in data) {
      if(data.hasOwnProperty(prop)) {
        this.setCache(data, data[prop], prop);
        if (data[prop] instanceof Object) {
          this.bindChange(data, prop);
          this.depBind(data[prop]);
        }
        else {
          this.bindChange(data, prop);
        }
      }
    }
  };
  Observer.prototype.setCache = function (object,prop,value) {
    var observers = this.$observers;
    var valuesMap = this.$valuesMap;
    var len = observers.length;
    var index = this.$observers.indexOf(object);
    if (index === -1) {
      observers.push(object);
      valuesMap[len] = extendDep({},object);
      //console.log(object);
    } else {
      valuesMap[index][prop] = value;
    }
  };
  Observer.prototype.getCache = function (object, prop) {
    var index = this.$observers.indexOf(object);
    var value = (index === -1) ? null : this.$valuesMap[index];
    return value ? value[prop] : value;
  };
  Observer.prototype.bindChange = function (object, prop) {
    Object.defineProperty(object, prop, {
      set: (function(value) {
        var oldVal = this.getCache(object, prop);
        if (oldVal !== value) {
          this.setCache(object, prop, value);
          this.triggerChange(object, prop, value);
        }
      }).bind(this),
      get: (function() {
        return this.getCache(object, prop);
      }).bind(this)
    });
  };

  function Updater () {
  }
  Updater.prototype.updateTextContext = function (node, text) {
    node.textContent = text;
  };

  function Fast(config) {
    if(!config.el) {
      throw new Error('not bind element');
    }
    this.$element = config.el;
    this.$model = config.data;
    this.$directives = ['v-text'];
    this.$callbacks = [];
    new Compiler(this);
    new Observer(this);

  }
}));

