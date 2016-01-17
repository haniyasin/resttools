/*
 * Test and example for the local(direct) rest api without layers like sokets or http
 */

var path = require('path'),

    boxes = require('./modules/boxes'),
    status = require('./modules/status'),
   
    cli = require('./cli.js');

function query(root){
  this.root = root;
}

function detect_type(prev, part){
  if(prev._t == 'r' && typeof prev.methods[part] == 'function')
    return 'm';
  if(prev._t == 'f' && prev[part]._t == 'r')
    return 'r'; //resource
  if(prev.hasOwnProperty(part) && prev[part]._t == 'f')
    return 'f'; //folder

  return 0; //method or anything else:D
}

query.prototype.process = function(method, token, query, data, cb){
  var parts = query.split(path.sep), ind = 0,
  prev_elem = this.root;
  parts.shift();

  (function parse_part_rec(parts, ind, prev_elem, cur_method){
     var part = parts[ind], args;
     //	 console.log(part, prev_elem._t, prev_elem[part]['_t'], detect_type(prev_elem, part));
     switch(detect_type(prev_elem, part)){
     case 'r' : //resource
       console.log('resource: ', part);
       prev_elem.request(cur_method, token, part, data, function(obj){
			   prev_elem = obj;
			   parse_part_rec(parts, ++ind, prev_elem, cur_method);
			 });
       break;
       
     case 'f': //folder
       prev_elem = prev_elem[part];
       console.log('folder: ', part);
       parse_part_rec(parts, ++ind, prev_elem, cur_method);
       break;
       
     case 'm' : //method
       console.log('method: ', part);
       prev_elem.method_request(method, token, part, data, cb);
     case 0 : //error, it is cannot be here
     }
   })(parts, ind, prev_elem, 'read');
};

var token = 'admin'; //this is woked for locally linked resources only. Such token will cause an error with query processor

function create_root(res, onfinish){
  var bs = new boxes.folder('boxes');
  bs.request('create', token, 'root', undefined, function(res){
	       console.log('create root status:', res.status);
	       if(res.status != status.codes.ok)
		 return;

	       var root = res.object;
	       root.groups.request('create', token, 'first', undefined, function(res){
				     root.users.request('create', token, 'ix', 
							{ email : 'ix@2du.ru',
							  password : '321'});
				     root.groups.first.users.request('create', token, 'ix');
				     root.groups.first.rights.request('create', token, 'first', 'rwx');
				     root.rights.request('create', token, 'first', 'r');
				     root.rights.request('create', token, 'second', 'rw');
				   });
	       
	       root.boxes.request('create', token, 'uhaha', undefined, function(res){
	       			    root.boxes.uhaha.users.request('create', token, 'ix', 
								   { email : 'ix@2du.ru', 
	       							     password : '123'});
	       			    root.boxes.uhaha.users.request('create', token, 'ixeg', 
								   { email : 'ix@2du.ru', 
	       							     password : '123'});
	       			  });
	     });
}

function print_status(str, res){
  if(res.status == status.codes.ok)
    console.log(str +' exist [ok]');
  else
    console.log(str + ' exist [failed]');  
}

function check1_root(res, onfinish){    
  var bs = new boxes.folder('boxes');
  bs.request('read', token, 'root', undefined, function(res){
	       print_status('root', res);

	       var root = res.object;
	       root.groups.request('read', token, 'first', undefined, function(res){
				     print_status(' first', res);
				     root.users.request('read', token, 'ix', undefined, function(res){
							  print_status('   ix', res);
//							{ email : 'ix@2du.ru',
//							  password : '321'});			  
							});
				     root.groups.first.users.request('read', token, 'ix', undefined, 
								     function(res){
								       print_status('   ix', res);
								     });
				     root.groups.first.rights.request('read', token, 'first',  undefined, 
								      function(res){
									print_status('   first', res);
								//	'rwx'
								      });
				     root.rights.request('read', token, 'first', undefined, function(res){
							  print_status('   first', res);
							  // 'r'
							 });
				     root.rights.request('read', token, 'second', undefined, function(res){
							   print_status('   second', res);
							  // 'rw'
							 });
				   });

	       root.boxes.request('read', token, 'uhaha', undefined, function(res){
				    print_status(' uhaha', res);
	       			    root.boxes.uhaha.users.request('read', token, 'ix', undefined,
								   function(res){
								     print_status('   ix', res);
								     //								   { email : 'ix@2du.ru', 
//	       							     password : '123'}
								   });
	       			    root.boxes.uhaha.users.request('read', token, 'ixeg', undefined,
								   function(res){
								     print_status('   ixeg', res);
//								   { email : 'ix@2du.ru', 
//	       							     password : '123'}
								   });
				  });
/*
	       root.groups.request('read', token, 'first', undefined, function(res){
				     root.groups.first.users.request('create', token, 'ix');
				     root.groups.first.rights.request('create', token, 'first', 'rwx');
				     root.rights.request('create', token, 'first', 'r');
				     root.rights.request('create', token, 'second', 'rw');
				     root.boxes.rights.request('create', token, 'first', 'r', function(res){
							       });
				   });*/
	     });  
}


function walk_and_print(node, offset){
  console.log(offset + node.name);    
  var ind;
  for(ind in node.children){
    walk_and_print(node.children[ind], offset + ' ');
  }
}

create_root();

setTimeout(function(){
	     console.log('vahaha');
	     check1_root();
}, 1000);
walk_and_print(root, ' ');

/*
_boxes = new boxes.folder('boxes');
_boxes.request('create', token, 'root', undefined, modify_root);

_boxes = new boxes.folder('boxes');
_boxes.request('read', token, 'root', undefined, check2_root);
*/

//root.boxes.uhaha.users.ixeg.login({ uhaha : 'uhahatushki'});
//console.log(root.boxes.uhaha);
var q = new query(root);

//console.log(root.boxes.uhaha.users);

//q.process('read', token, '/boxes/uhaha/users/ix');
//q.process('exec', token, '/boxes/uhaha/users/ixeg/login', { password : '123' }, function(ret){
//	      console.log(ret);
//});
//q.process('write', token, '/boxes/uhaha/users/ix', 'data');
//q.process('write', token, '/groups/first');
//q.process('write', token, '/groups/first/users/ix');
//q.process('delete', token, '/groups/first/lalala');
//q.process('create', token, '/boxes/newbox', function(){
//	      q.process('write', token, '/boxes/newbox/rights/first', [ 'read' ]);
//	  });

//ulalal.delete();
//vahaha.delete();
//root.delete();