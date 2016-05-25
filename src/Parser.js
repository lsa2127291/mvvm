/**
 * Created by Administrator on 2016/5/24.
 */
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
