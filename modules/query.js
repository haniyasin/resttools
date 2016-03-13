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
