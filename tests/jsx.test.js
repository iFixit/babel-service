// disable logging during tests
require('../log.js').log = function(){};

var fs   = require('fs')
   ,BabelService = require('../server.js')
   ,assert = require('assert')
   ,http = require('http')
   ,port = 38476;

function request(data, headers, callback) {
   var req = http.request({
      host: 'localhost',
      port: port,
      path: '/',
      method: 'POST',
      headers: headers || {'Content-Type': 'text/plain'}
   }, function(res) {
      var responseBody = '';

      res.setEncoding('utf8');
      res.on('data', function(chunk) {
         responseBody += chunk;
      });

      res.on('end', function() {
         callback(null, res.statusCode, responseBody);
      });
   });

   req.write(data);
   req.end();
}

describe("jsx compile via http", function() {
   var server = new BabelService();

   before(function(done) {
      server.listen(port, 'localhost', null, done);
   });

   it("should respond with js to a POST of jsx", function(done) {
      var jsx = "(<div></div>)";
      var expectedJs = '"use strict";\n\nReact.createElement("div", null);';
      
      request(jsx, null, function(error, statusCode, responseBody) {
         assert.equal(200, statusCode);
         assert.equal(expectedJs, responseBody);
         done();
      });
   }).timeout(10000);

   it("should respond with a 500 syntax error", function(done) {
      var jsx = "(<div></a>)";
      
      request(jsx, null, function(error, statusCode, responseBody) {
         assert.equal(500, statusCode);
         done();
      });
   }).timeout(10000);

   it("should respond with a 400 for incorrect Content-Type", function(done) {
      var jsx = "(<div></div>)";
      
      request(jsx, {}, function(error, statusCode, responseBody) {
         assert.equal(400, statusCode);
         done();
      });
   }).timeout(10000);

   after(function(done) {
      server.close(done);
   });
});
