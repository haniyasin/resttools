/*
 * users api
 * user is just a profile with access by password and nothing else.
 * Also this module implements a diffrent authentification types(login with password, login through OAuth 
 * providers)
 */

var tokens = require('./tokens'),
    resource = require('./resource'),
    folders = require('./folders'),
    methods = require('./methods'),
    status = require('./status');

function user(name, parent){
  this.fast_init(name, parent);
}

user.prototype = new resource();

user.prototype._dump = function(){
  return { profile : this.profile };  
};

user.prototype._validate = function(name, profile){
  return true;
};

user.prototype._full_init = function(){  
//  this.container_add('methods', methods);
};

user.prototype.methods = {
  login : function(data, cb){
    //    console.log('token is:', str);
    //    console.log('object is:', tokens.parse(str));
    this.read(null, function(res){
		var odata = res.object.data, groups = res.object.parent.parent.groups;
		if(odata.password == data.password){
		  //FIXME find all user grops belongs to
		  //if(res.object.container.groups cheking
		  groups.get_by_user(this.name, function(groups){
				     });
		  cb({
		       status : status.codes.ok
//		       token : tokens.generate(user)	    
		     });
		} else
		  cb({
		       status : status.codes.forbidden,
		       message : "password or username is incorrect"
		     });
	      });
  }
};

function folder(name, parent){
  this.type = user;
  this.folder_init(name, parent);
}

folder.prototype = new folders.folder();

folder.prototype._validate = function(name, data){
  return true;    
};

exports.type = user;
exports.folder = folder;