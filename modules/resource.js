/*
 * Resource is a unit of resource management. Each resource has own properties, but all resources are managed
 * by common way. The resource also implements access control lists.
 */

var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),

    status = require('./status'),

    basedir = path.dirname(__dirname);

function resource(){
}

/*
 *path resolve over parents
 * 
 * returns valid fs path string
 */

resource.prototype.path = function(){
    var _path = this.name, parent = this.parent;
    
    while(parent){
	_path = path.join(parent.name, _path);
	parent = parent.parent;
    }

    return path.join(basedir, _path);
};

resource.prototype.fast_init = function(name, parent){
    this.name = name;
    this.container = {};
    this.parent = parent;
    

    this.folder_add('rights', bfolder);
};

resource.prototype.full_init = function(){
    this._t = 'r';    
    this.children = [];
    this.methods = {};

    if(this.parent)
	this.parent.add_child(this);
    if(this._full_init)
	this._full_init();
};

resource.prototype.isexist = function(cb){
    fs.stat(this.path(), function(err){
		if(err)
		    cb(false);
		else
		    cb(true);
	    });    
};
 
resource.prototype.create = function(data, cb){
    if(!this._t)//FIXME this must be configurable
	this.full_init();

    var self = this;
    fs.mkdir(this.path(), function(e){
		 if(e == null)
		     self.write(data, cb);
		 else {
		     cb({ status : status.codes.internal_error, message : JSON.stringify(e)});
		 }
	     });
};

resource.prototype.delete = function(data, cb){
    if(this.parent && this._t)
	this.parent.remove_child(this);
    rimraf(this.path(), function(){
	       if(cb)
		   cb({ status : status.codes.ok });
	   });
};


resource.prototype.write = function(data, cb, recursive){
    var self = this;
//ind, children = this.children;
//    if(recursive){
//	for(ind in children){
//	    children[ind].write(recursive);
//	}	
//    }
    if(this._validate(this.name, data)){
        this.data = data;	
	fs.writeFile(path.join(this.path(), 'config.json'), this.dump(), function(){
			 //may be need error handling
			 if(cb)
			     cb({status : status.codes.ok,
				 object : self});
		     });
    } else
	cb({status : status.code.validation_error,
	    message: 'this name:' + this.name + ' and this data:' + JSON.stringify(data) + ' have not been validated'});
};

resource.prototype.read = function(data, cb){
    var self = this;
    if(!this._t)
	this.full_init();

    fs.readFile(path.join(this.path(), 'config.json'), { encoding : 'utf8' },
		function(err, data){
		    var object, key;
		    if(err){
			cb({ status : status.codes.resource_unexist });
			return;
		    }
			
		    try{
			object = JSON.parse(data);	
		    } catch (x) {
			console.log(x);
		    }	 

		        this.data = object;
		    if(cb)
			cb({
			       status : status.codes.ok,
			       object : self
			   });
		});
};

resource.prototype.dump = function(){
    var proto_dump = this._dump;
    var object = proto_dump ? proto_dump.apply(this) : {};
    
    object.name = this.name;
    object.container = this.container;
    object.data = this.data;

    return JSON.stringify(object);
};

resource.prototype.add_child = function(child){
    this.children.push(child);
};

resource.prototype.remove_child = function(child){
    var ind = this.children.length, children = this.children;
    while(ind--){
	if(this.children[ind] == child){
	    child.parent = undefined;
	    this.children.splice(ind,1);
	    return true;
	}
    }

    return false;
};

///////////////////////////////////
///Methods api, for calling methods like something.methodname?prop1=123&prop2=321
/*
 * Calling method with autorization.
 * 
 * @param method : acces method - exec or read 
 * @param token : auth token
 * @param name : string, method's name
 * @param data : object, consist of named arguments
 * @param cb : callback
 */

resource.prototype.method_request = function(method, token, name, data, cb){
    //FIXME token verification
    if(method == 'exec')
	this.methods[name].call(this, data, cb);
    else 
	if(method == 'read')
	    if(this.methods.hasOwnProperty(name))
		cb({
		       status : status.codes.ok,
		       signature : 'MUSTBEHERE' //FIXME
		   });
    else 
	cb({status : status.codes.invalid_request});
};

resource.prototype.method_add = function(name, func){
    this.methods[name] = func;
};

/////////////////////////////////
///Folders api, things like something.boxes, something.rights, where boxes and rights are folders
resource.prototype.folder_add = function(name, folder){
    this[name] = new folder(name, this);
};


////////////////////////////////////////////////////
//PROTO folder, prototype for all folder types like boxes, users, groups or built-in folders

function folder(){
    this._t = 'f';
}

folder.prototype = new resource();

function create_dir_if_none(path){
    try{
	fs.mkdirSync(path);
    } catch (x) {
//	console.log('dir %s is already exists', path);
    }    
}

folder.prototype.folder_init = function(name, parent){
    //FIXME need separate init like e resource
    this.fast_init(name, parent);
    create_dir_if_none(this.path());
    this.full_init();
};

folder.prototype.builtin_request_dispatcher = function(method, name, data, cb){
    var _res =  new this.type(name, this);
    _res.isexist(function(exist){
		    if(exist && method == 'create'){
			cb({ status : status.codes.resource_exist});
			return;
		    }
		     
		    _res[method](data, cb);
		});
};

folder.prototype.request = function(method, token, name, data, cb){
    //FIXME cheking token rights
    //validating name, data
    var folder = this;

    if(typeof this.request_dispatcher == 'function')
	this.request_dispatcher(method, name, data, cb);
    else
	this.builtin_request_dispatcher(method, name, data, function(res){
					    if(!res.status && method.match(/create|write|read/))
						folder[name] = res.object; 
					    if(cb)
						cb(res);
					});    	
};

////////////////////////////////////
///BUILT-IN folder, used as folder what is keep all itself data in parent object(for example: rights)
///Default implementation can be used for many use-cases or it is can be reimplemented overriding create by _create etc
function bfolder(name, parent){
    this.name = name;
    this.parent = parent;

    parent.container[name] = {};
}

bfolder.prototype = new folder();

bfolder.prototype._validate = function(name, data){
    return true;
};

bfolder.prototype.request_dispatcher = function(method, name, data, cb){
    var container = this.parent.container[this.name];
    if(container.hasOwnProperty(name)){
	switch(method){
	case 'write' : 
	    container[name] = data;
	    this.parent.write(cb);
	    break;

    	case 'delete' : 
	    delete container[name];
	    this.parent.write(cb);
	    break;
	   
	case 'read' :
	    cb({
		   status : status.codes.ok,
		   object : container[name]
	       });
	    break;
	}
    } else {
	if(method == 'create'){
//	    console.log(name, this.parent.write);
	    container[name] = data ? data : true;
	    this.parent.write(data, cb);	    
	} else
	    cb({
		   status : status.codes.resource_unexist
	       });    	    	
    }
};

bfolder.prototype.list = function(name, data, cb){
    var folder_data = this.parent.container[this.name], ind, ret_array = [];
    for(ind in folder_data)
	ret_array.unshift(ind);

    cb({
	   status : status.codes.ok,
	   object : 	ret_array
       });
};

exports.type = resource;

exports.folder = folder;
exports.builtin_folder = bfolder;
