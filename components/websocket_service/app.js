
// node modules
var http = require('http')
  , engine = require('engine.io')
;

// configuration (TODO: replace with json files)
var service_cfg = {
  web: {
    port: (process.env.CLOCK_WEB_PORT ? process.env.CLOCK_WEB_PORT : 8080),
  },
  websocket: {
    port: (process.env.CLOCK_WS_PORT ? process.env.CLOCK_WS_PORT : 8081),
  }
};

// service
var websocket_server = engine.listen( service_cfg.websocket.port );

console.log('WS listening on port[' + service_cfg.websocket.port + '].');


// set up the web routes



// define the websocket listeners

websocket_server.on('connection', function (socket) {
  console.log('websocket connection established');  
  
  // on message
  socket.on('message', function () { 
    console.log('on message');  
    
  });
  
  // on close
  socket.on('close', function () { 
    console.log('on close');  
    
  });

});
