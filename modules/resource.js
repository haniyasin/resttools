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
    
    this.container_add('rights', this.builtin_folder);
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
    var self = this;
    fs.mkdir(this.path(), function(e){
	       if(!this._t)//FIXME this must be configurable
		 self.full_init();

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
    
    var filepath = this.path();
    fs.unlink(filepath, function(){
		fs.writeFile(path.join(filepath, 'config.json'), self.dump(), function(){
			       //may be need error handling
			       if(cb)
				 cb({status : status.codes.ok,
				     object : self});
			     });
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

		self.load(object);
		if(cb)
		  cb({
		       status : status.codes.ok,
		       object : self,
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

resource.prototype.load = function(object){
  this.name = object.name;
  this.container = object.container;
  this.data = object.data;
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


/////////////////////////////////
///Container api, things like folders, methods
resource.prototype.container_add = function(name, container){
  this[name] = new container(name, this);
};

module.exports = resource;
