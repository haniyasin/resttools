/*
 * groups api
 * group is simple container for users. Group is used by access control lists implementation in resource for
 * delegating rights
 */

var resource = require('./resource'),
    folders = require('./folders'),
    methods = require('./methods');

function group(name, parent){
    this.fast_init(name, parent);
}

group.prototype = new resource();

group.prototype._validate = function(name, data){
    return true;
};

group.prototype._full_init = function(){
      this.container_add('users', folders.builtin_folder);  
};

function folder(name, parent){
    this.type = group;
    this.folder_init(name, parent);
}

folder.prototype = new folders.folder();

folder.prototype._validate = function(name, data){
    return true;  
};

//return groups which own user
folder.prototype.get_by_user = function(username, cb){
  console.log(this);
  this.read(null, function(res){
	      console.log(res);
	    });
};

exports.type = group;
exports.folder = folder;