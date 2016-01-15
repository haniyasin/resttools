/*
 * groups api
 * group is simple container for users. Group is used by access control lists implementation in resource for
 * delegating rights
 */

var resource = require('./resource');

function group(name, parent){
    this.fast_init(name, parent);
}

group.prototype = new resource.type();

group.prototype._validate = function(name, data){
    return true;
};

group.prototype._full_init = function(){
      this.folder_add('users', resource.builtin_folder);  
};

function folder(name, parent){
    this.type = group;
    this.folder_init(name, parent);
}

folder.prototype = new resource.folder();

folder.prototype._validate = function(name, data){
    return true;  
};

exports.type = group;
exports.folder = folder;