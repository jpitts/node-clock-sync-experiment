
// node modules
var http = require('http')
  , eio = require('engine.io')
  , sio = require('socket.io')
;

/*
   attributes
*/

// socket_pool - tracking all connected clients by socket id
var socket_pool = {};


/* 
  configuration 
  TODO: replace with json files
*/

var service_cfg = {
  web: {
    host: 'localhost',
    port: (process.env.CLOCK_WEB_PORT ? process.env.CLOCK_WEB_PORT : 8080),
  },
  websocket: {
    host: 'localhost',
    port: (process.env.CLOCK_WS_PORT ? process.env.CLOCK_WS_PORT : 8081),
  }
};

// service
//var websocket_server = eio.listen( service_cfg.websocket.port );

var websocket_server = sio.listen(service_cfg.websocket.port, {   
  log: false 
});

console.log('WS listening on port[' + service_cfg.websocket.port + '].');


// define the websocket listeners

websocket_server.on('connection', function (socket) {
  console.log('websocket connection established from id[' + socket.id + '].');  
  
  // store the socket for later use
  socket_pool[socket.id] = socket; 
 
  // on message
  socket.on('message', function () { 
    console.log('on message');  
    
  });
  
  // on close
  socket.on('close', function () { 
    console.log('on close');  
    
    // delete from the pool
    delete socket_pool[socket.id];

  });
  

  // custom listeners

  socket.on('system.connect_ack', function (payload) {
    console.log('connect_ack() at ' + payload.time_connected);
  }); 

  socket.on('clock.tick_ack', function (payload) {
    console.log('on clock.tick_ack from client id[' + socket.id + '] at ' + payload.time_received);
  });

});


// start listening
sio.listen( service_cfg.websocket.port )


// start ticking

var start_ticking = function (attr) {
  /* attrs:
      socket
  */
  
  console.log('start_ticking()');  

  var intervalId = setInterval(function(){
    
    var current_time = (new Date).getTime();
    var tick_data = {
      time: current_time,
    };
       
    console.log('service tick ' + current_time);
    
    // check for connected clients
    if (socket_pool && Object.keys(socket_pool).length) {
      var socket_ids = Object.keys(socket_pool);
      
      // broadcast tick to all clients
      //console.log('broadcast to websockets clients: ', socket_ids);  
       
      for (var i=0; i<socket_ids.length; i++) {
        
        var client = socket_pool[ socket_ids[i] ];
        console.log('emit clock.tick to client id[' + client.id + '].');
        
        // emit the tick to this client
        client.emit('clock.tick', tick_data);  
      }
       
    } 
 
  }, 1000);
}


// start it
start_ticking();


