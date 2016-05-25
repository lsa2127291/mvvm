/**
 * Created by Administrator on 2016/5/24.
 */
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
