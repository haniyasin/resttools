/*
 * Status codes and useful funcs for converting them to or from http status codes
 */

module.exports = {
    codes : {
	ok : 0,
	invalid_request : 1,
	resource_unexist : 2,
	resource_exist : 3,
	forbidden : 4,
	validation_error : 5,
        internal_error : 6
    },
    to_http_code : function(code){
	switch(code){
	    case 0 :
	    return 200;
	    case 1 :
	    case 2 :
	    case 3 :
	    return 401;
	}
    }
};
