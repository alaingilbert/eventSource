var zmq = require('zmq')
  , pub = zmq.socket('pub');

pub.connect('tcp://127.0.0.1:60000');
setInterval(function () {
   pub.send('/ ' + Math.floor(Math.random() * 100));
}, 1000);
