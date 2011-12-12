var http       = require('http')
  , fs         = require('fs')
  , app        = require('express').createServer()
  , zmq        = require('zmq')
  , PORT       = process.argv[2] || 8080
  , HOST       = process.argv[3] || '127.0.0.1'
  , ZMQ_STRING = 'tcp://127.0.0.1:60000'
  , sock       = zmq.socket('sub');


sock.connect(ZMQ_STRING);
sock.subscribe('room');


app.get('/events', function (req, res) {
   res.writeHead(200, { 'Content-Type'  : 'text/event-stream'
                      , 'Cache-Control' : 'no-cache'
                      , 'Connection'    : 'keep-alive'
                      });
   console.log('Client connect');

   var callback = function (data) {
      console.log('Send data');
      res.write('data: '+data.toString()+'\n\n');
   };

   sock.on('message', callback);

   res.socket.on('close', function () {
      sock.removeListener('message', callback);
      console.log('Client leave');
   });
});


app.get('/', function (req, res) {
   fs.readFile(__dirname+'/templates/index.html', function (err, file) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(file, 'binary');
      res.end()
   });
});


app.listen(PORT, HOST);

console.log('Server listening on '+HOST+':'+PORT);
console.log(new Date().toTimeString());
console.log('----------------------------------');
