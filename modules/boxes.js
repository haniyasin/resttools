/*
 * boxes api
 * Box is a container for different resources like groups, users, databases, domain names etc 
 */

var resource = require('./resource'),
    groups = require('./groups'),
    users = require('./users'),
    status = require('./status');

function box(name, parent){
    this.fast_init(name, parent);
}

box.prototype = new resource.type();

//validating box name
box.prototype._validate = function(name, data, cb){
    return true;
};

box.prototype._full_init = function(){
    this.folder_add('boxes', folder);
    this.folder_add('groups', groups.folder);
    this.folder_add('users', users.folder);    
};

function folder(name, parent){
    this.type = box;
    this.folder_init(name, parent);
}

folder.prototype = new resource.folder();

folder.prototype._validate = function(name, data){
    return true;  
};

exports.type = box;
exports.folder = folder;
