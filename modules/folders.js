var resource = require('./resource'),
    status = require('./status'),

    fs = require('fs');

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
//    console.log(x, path);
  }    
}

folder.prototype.folder_init = function(name, parent){
    //FIXME need separate init like e resource
    this.fast_init(name, parent);
    this.full_init();
    create_dir_if_none(this.path());
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
  
  function onres(res){
    if(!res.status && method.match(/create|write|read/))
      folder[name] = res.object; 
    if(cb)
      cb(res);
  }

  if(typeof this.request_dispatcher == 'function')
    this.request_dispatcher(method, name, data, onres);
  else
    this.builtin_request_dispatcher(method, name, data, onres);
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
	   data : container[name]
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

exports.folder = folder;
exports.builtin_folder = resource.prototype.builtin_folder = bfolder;
