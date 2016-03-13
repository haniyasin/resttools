/*
 * boxes api
 * Box is a container for different resources like groups, users, databases, domain names etc 
 */

var resource = require('./resource'),
    folders = require('./folders'),
    methods = require('./methods'),
    groups = require('./groups'),
    users = require('./users'),
    status = require('./status');

function box(name, parent){
  this.fast_init(name, parent);
}

box.prototype = new resource();

//validating box name
box.prototype._validate = function(name, data, cb){
    return true;
};

box.prototype._full_init = function(){
  this.container_add('boxes', folder);
  this.container_add('groups', groups.folder);
  this.container_add('users', users.folder);    
};

box.prototype._write = function(cb){
  this.boxes.write();
  this.groups.write();
  this.users.write();
  cb();
};

function folder(name, parent){
  this.type = box;
  this.folder_init(name, parent);
}

folder.prototype = new folders.folder();

folder.prototype._validate = function(name, data){
    return true;  
};

exports.type = box;
exports.folder = folder;
