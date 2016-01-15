/*
 * users api
 * user is just a profile with access by password and nothing else.
 * Also this module implements a diffrent authentification types(login with password, login through OAuth 
 * providers)
 */

var tokens = require('./tokens'),
    resource = require('./resource'),
    status = require('./status');

function user(name, parent){
    this.fast_init(name, parent);
}

user.prototype = new resource.type();

user.prototype._dump = function(){
    return { profile : this.profile };  
};

user.prototype._validate = function(name, profile){
    return true;
};

user.prototype._full_init = function(){
    this.method_add('login', login);    
};

function login(params, cb){
//    console.log('token is:', str);
//    console.log('object is:', tokens.parse(str));
    
    if(this.profile.password == params.password){
	//FIXME find all user grops belongs to
	var user = {
	    name : this.name,
	    groups : ['name1', 'name2']
	};
	console.log(this.parent.groups.list());
	cb({
	       status : status.codes.ok,
	       token : tokens.generate(user)	    
	   });
	return;	
    }
     
     cb({
	    status : 1,
	    message : 'password or username is incorrect'
     });
};

function folder(name, parent){
    this.type = user;
    this.folder_init(name, parent);
}

folder.prototype = new resource.folder();

folder.prototype._validate = function(name, data){
    return true;    
};

exports.type = user;
exports.folder = folder;