/*
 * implementation of generating, parsing, controlling auth tokens
 * Used by users and query processing
 */
var crypto = require('crypto');

function save(token){
    return token;
}

function load(token){
    return token;
}

exports.generate = function(user){
    var buf = new Buffer(JSON.stringify(user));
// Crypto.randomBytes('256', function(err, buf) {
  //      if (err) throw err;
    //    return buf;
   // });    //save token to storage for verification later
    //try start expired token collector if don't
    return save(buf.toString('base64'));
};

exports.parse = function(token){
    //verify token for existing actual matched on in storage
    var str = new Buffer(token, 'base64').toString('ascii');
    return JSON.parse(str);
};