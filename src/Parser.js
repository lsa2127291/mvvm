/**
 * Created by Administrator on 2016/5/24.
 */
function Parser(vm) {
  this.$model = vm.$model;
  this.$watcher = new Watcher(vm);
  this.$updater = new Updater();
}
//Parser.prototype.getDepValue = function(paths) {
//  var model = this.$model;
//  var len = paths.length;
//  for (var i=0; i<len; i++) {
//    if(isObj(model) && model.hasOwnProperty(paths[i])){
//      model = model[paths[i]];
//    } else {
//      return false;
//    }
//  }
//  return true;
//};

//Parser.prototype.parseVText = function (node, express) {
//  var paths, eLen, i, exp, text = '', field;
//  var updater = this.$updater, wathcer = this.$watcher;
//  if (isArr(express)) {
//    eLen = express.length;
//    for (i = 0; i < eLen; i++) {
//      exp = express[i];
//      if(exp[0] === '""'){
//        text += exp.substr(1,exp.length-1);
//      }else {
//        field = generateField(trim(exp.substr(1,exp.length-1)));
//        text += this.$model[field];
//      }
//    }
//    updater.updateTextContext(node, text);
//    wathcer.watch(field, function(value) {
//      updater.updateTextContext(node);
//    });
//  } else {
//    paths = express.split('.');
//    if (this.getDepValue(paths)) {
//      field = Array.prototype.join.call(paths, '.');
//      updater.updateTextContext(node, this.$model[field]);
//      wathcer.watch(field, function (value) {
//        updater.updateTextContext(node, value);
//      });
//    }
//  }
//};
Parser.prototype.getText = function (str) {
  return eval(str);
};
Parser.prototype.parseVText = function (node, express, fields) {
  var fLen, i, text = '', field;
  var updater = this.$updater, watcher = this.$watcher;
  text = this.getText(express);
  updater.updateTextContext(node, text);
  if (fields) {
    fLen = fields.length;
    for (i = 0; i < fLen; i++) {
      watcher.watch(fields[i], (function () {
        text = this.getText(express);
        updater.updateTextContext(node, text);
      }).bind(this));
    }
  } else {
    field = generateField(trim(express));
    watcher.watch(field, (function () {
      text = this.getText(express);
    }).bind(this));
  }
};
