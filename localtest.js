/*
 * Test and example for the local(direct) rest api without layers like sockets or http
 */

var path = require('path'),

    boxes = require('./modules/boxes'),
    status = require('./modules/status'),
   
    cli = require('./cli.js'),
    child_process = require('child_process');


var token = 'admin'; //this is worked for locally linked resources only. Such token will cause an error with query processor

function create_root(res, onfinish){
  var bs = new boxes.folder('boxes');
  bs.request('create', token, 'root', undefined, function(res){
	       if(res.status != status.codes.ok)
		 return;
	       var root = res.object;
	       console.log('eeee');
	       child_process.execSync('ls boxes/root > lsss');
	       root.groups.request('create', token, 'first', undefined, function(res){
				     console.log(res, 'dddd');
				     root.users.request('create', token, 'ix', 
							{ email : 'ix@2du.ru',
							  password : '321'});
				     root.groups.first.users.request('create', token, 'ix');
				     root.groups.first.rights.request('create', token, 'first', { access : 'rwx'});
				     root.rights.request('create', token, 'first', { access : 'r' });
				     root.rights.request('create', token, 'second', { access : 'rw' });
				   });
	       
	       root.boxes.request('create', token, 'uhaha', undefined, function(res){
	       			    root.boxes.uhaha.users.request('create', token, 'ix', 
								   { email : 'ix@2du.ruu', 
	       							     password : '3214'});
	       			    root.boxes.uhaha.users.request('create', token, 'ixeg', 
								   { email : 'ix@3du.ru', 
	       							     password : '1235'});
	       			  });
	     });
}

function print_status(str, res, check){
  console.log(str +', status is [' + status.stringify(res.status) + ']', check ? '[' + check + ']' : '');
}

function check1_root(res, onfinish){    
  console.log('cheking tree first time');
  var bs = new boxes.folder('boxes');
  bs.request('read', token, 'root', undefined, function(res){
	       print_status('root', res, true);

	       var root = res.object;
	       root.groups.request('read', token, 'first', undefined, function(res){
				     root.users.request('read', token, 'ix', undefined, function(res){
							  print_status('   ix', res,
								       res.object.data.email == 'ix@2du.ru' &&
								       res.object.data.password == '321');
							});
				     console.log(res);
				     root.groups.first.users.request('read', token, 'ix', undefined, 
								     function(res){
								       print_status('   ix', res, true);
								     });
				     root.groups.first.rights.request('read', token, 'first',  undefined, 
								      function(res){
									print_status('   first', res,
										     res.data.access == 'rwx');
								      });
				     root.rights.request('read', token, 'first', undefined, function(res){
							  print_status('   first', res, 
								       res.data.access == 'r');
							 });
				     root.rights.request('read', token, 'second', undefined, function(res){
							   print_status('   second', res,
								       res.data.access == 'rw');
							 });
				   });

	       root.boxes.request('read', token, 'uhaha', undefined, function(res){
				    print_status(' uhaha', res, true);
	       			    root.boxes.uhaha.users.request('read', token, 'ix', undefined,
								   function(res){
								     print_status('   ix', res,
										  res.object.data.email == 'ix@2du.ruu' &&
										  res.object.data.password == '3214');
								   });
	       			    root.boxes.uhaha.users.request('read', token, 'ixeg', undefined,
								   function(res){
								     print_status('   ixeg', res,
										  res.object.data.email == 'ix@3du.ru' &&
										  res.object.data.password == '1235');
								   });
				  });
	     });  
}

function modify_root(res, onfinish){    
  console.log('modifying tree');
  var bs = new boxes.folder('boxes');
  bs.request('read', token, 'root', undefined, function(res){
	       var root = res.object;
	       root.groups.request('read', token, 'first', undefined, function(res){
				     root.users.request('delete', token, 'ix');
				     root.groups.first.users.request('delete', token, 'ix', undefined);
				     root.groups.first.rights.request('write', token, 'first', 
								      { access : 'x'});
				     root.rights.request('write', token, 'first', { access : 'x'});
				     root.rights.request('delete', token, 'second', undefined);
				   });

	       root.boxes.request('read', token, 'uhaha', undefined, function(res){
	       			    root.boxes.uhaha.users.request('write', token, 'ix', 
								   { email : 'haha',
								     signal : 'trulala' });
	       			    root.boxes.uhaha.users.request('write', token, 'ixeg', 
								   { nick : 'petya',
								     login : 'vasya' });
				  });
	     });  
}

function check2_root(res){
  console.log('cheking modified root');  
  var bs = new boxes.folder('boxes');
  bs.request('read', token, 'root', undefined, function(res){
	       print_status('root', res, true);
	       var root = res.object;
	       root.groups.request('read', token, 'first', undefined, function(res){
				     print_status(' first', res, true);
				     root.users.request('read', token, 'ix', undefined, function(res){
							  print_status('  ix', res, 'deleted');
							});
				     root.groups.first.users.request('read', token, 'ix', undefined,
								     function(res){
								       print_status('  ix', res, 'deleted');
								     });
				     root.groups.first.rights.request('read', token, 'first', undefined,
								      function(res){
									print_status('  first', res,
										     res.data.access == 'x');
								      });
				     root.rights.request('read', token, 'first', undefined,
							 function(res){
							   print_status('  first', res,
									res.data.access == 'x');
							 });
				     root.rights.request('read', token, 'second', undefined,
							 function(res){
							   print_status('  first', res, 'deleted');
							 });
				   });

	       root.boxes.request('read', token, 'uhaha', undefined, function(res){
				    print_status(' uhaha', res, true);
	       			    root.boxes.uhaha.users.request('read', token, 'ix', undefined,
								   function(res){
								     print_status('  first', res,
										  res.object.data.email == 'haha'&&
										  res.object.data.signal == 'trulala');
								   }); 
	       			    root.boxes.uhaha.users.request('read', token, 'ixeg', undefined,
								   function(res){
								     print_status('  first', res,
										  res.object.data.nick == 'petya'&&
										  res.object.data.login == 'vasya');
								   }); 
				  });
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
	     check1_root();
}, 1000);

setTimeout(function(){
	     modify_root();
}, 2000);

setTimeout(function(){
	     check2_root();
}, 4000);
//walk_and_print(root, ' ');

/*
_boxes = new boxes.folder('boxes');
_boxes.request('create', token, 'root', undefined, modify_root);

_boxes = new boxes.folder('boxes');
_boxes.request('read', token, 'root', undefined, check2_root);
*/

//root.boxes.uhaha.users.ixeg.login({ uhaha : 'uhahatushki'});
//console.log(root.boxes.uhaha);
//var q = new query(root);

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