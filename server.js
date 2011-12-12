var http       = require('http')
  , fs         = require('fs')
  , express    = require('express')
  , app        = express.createServer()
  , zmq        = require('zmq')
  , stylus     = require('stylus')
  , PORT       = process.argv[2] || 8080
  , HOST       = process.argv[3] || '127.0.0.1'
  , ZMQ_STRING = 'tcp://127.0.0.1:60000'
  , sock       = zmq.socket('sub');


app.configure(function(){
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.set('view options', { layout: false, pretty: true });
   app.use(stylus.middleware({ src: __dirname + "/public", compress: true }));
   app.use(express.static(__dirname + '/public'));
   app.use(app.router);
});


sock.subscribe('/');
sock.bind(ZMQ_STRING);


app.get('/events', function (req, res) {
   res.writeHead(200, { 'Content-Type'  : 'text/event-stream'
                      , 'Cache-Control' : 'no-cache'
                      , 'Connection'    : 'keep-alive'
                      });

   var callback = function (data) {
      res.write('data: ' + data.toString() + '\n\n');
   };

   sock.on('message', callback);

   res.socket.on('close', function () {
      sock.removeListener('message', callback);
   });
});


app.get('/', function (req, res) {
   res.render('index');
});


app.listen(PORT, HOST);

console.log('Server listening on ' + HOST + ':' + PORT);
console.log(new Date().toTimeString());
console.log('----------------------------------');
