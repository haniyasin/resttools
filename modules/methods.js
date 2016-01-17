var resource = require('./resource'),
    status = require('./status');

function methods(){
  
}

methods.prototype = new resource();

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
methods.prototype.request_dispatcher = function(method, name, data, cb){
    if(method == 'write')
	this[name].call(this, data, cb);
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


module.exports = methods;