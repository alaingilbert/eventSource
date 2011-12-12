var http       = require('http')
  , fs         = require('fs')
  , zmq        = require('zmq')
  , PORT       = process.argv[2] || 8080
  , HOST       = process.argv[3] || '127.0.0.1'
  , ZMQ_STRING = 'tcp://127.0.0.1:60000'
  , sock       = zmq.socket('sub');


sock.connect(ZMQ_STRING);
sock.subscribe('room');


http.createServer(function (req, res) {
   console.log(new Date().toTimeString()+' -- '+req.method+' '+req.url);

   if (req.url == '/events') {
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

   } else if (req.url == '/') {
      fs.readFile(__dirname+'/templates/index.html', function (err, file) {
         res.writeHead(200, {'Content-Type': 'text/html'});
         res.write(file, 'binary');
         res.end()
      });
   }
}).listen(PORT, HOST);


console.log('Server listening on '+HOST+':'+PORT);
console.log(new Date().toTimeString());
console.log('----------------------------------');
