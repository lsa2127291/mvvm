/**
 * Created by Administrator on 2016/5/24.
 */
function Compiler(vm) {
  this.$fragment = this.nodeToFragment(vm.$element);
  this.$unCompileElements = [];
  this.$directives = vm.$directives;
  this.$parser = new Parser(vm.$model);
  this.compileElement(this.$fragment);
}

Compiler.prototype.isDirective = function(directive) {
  return inArray(directive,this.$directives);
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
