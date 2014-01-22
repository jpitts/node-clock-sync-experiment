
// node modules
var http = require('http')
  , express = require('express')
  , sioClient = require('socket.io-client')
;

// initialize the clock sync experiment module
require('../../lib/ClockSyncExperiment').init({}, function (err, CSE) {
  
  var app = express();

  var socket = sioClient.connect('ws://' + CSE.config.websocket.host + ':' + CSE.config.websocket.port);


  socket.on('connect', function () {
    console.log('websocket connected');
    
    // disconnect
    socket.on('disconnect', function (data) {
      console.log('websocket disconnected');
    });

    // clock tick
    socket.on('clock.tick', function (data) {
      console.log('websocket on clock.tick ' + data.time);
    });

  });
 
  app.listen(CSE.config.test.port);
    
});

