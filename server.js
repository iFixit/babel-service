var connect = require('connect')
   ,bodyParser = require('body-parser')
   ,http = require('http')
   ,babel = require('babel-core')
   ,log = require('./log.js');

module.exports = function() {
   var app = connect()
   .use(bodyParser.text())
   .use(denyNonPosts)
   .use(compileJs)

   return http.createServer(app)
}

function denyNonPosts(req, res, next) {
   if (req.method !== 'POST') {
      res.statusCode = 404;
      return res.end();
   }
   next();
}

function compileJs(req, res, next) {
   if (typeof req.body != 'string') {
      res.statusCode = 400;
      res.end('Request body was not a string. ' +
              'Did you set Content-Type: text/plain?');
   }

   try {
      var compiled = babel.transform(req.body, {
         'presets': ['es2015'],
         'plugins': ['transform-react-jsx']
      });
   } catch (ex) {
      res.statusCode = 500;
      return res.end(ex.message);
   }

   res.statusCode = 200;
   return res.end(compiled.code);
}
