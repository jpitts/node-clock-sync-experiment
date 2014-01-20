
// node modules
var http = require('http')
  , eio = require('engine.io')
  , sio = require('socket.io')
;

// initialize the clock sync experiment module
require('../../lib/ClockSyncExperiment').init({}, function (err, CSE) {

  /*
     attributes
  */

  // socket_pool - tracking all connected clients by socket id
  var socket_pool = {};


  /* 
    configuration 
    NOTE: to load environment-based config, set NODE_ENV=dev in the shell script call
  */

  var service_cfg = CSE.config;
  

  /* 
    service definition
  */

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
    
    // on disconnect
    socket.on('disconnect', function () { 
      console.log('on disconnect');  
      
      // delete from the pool
      delete socket_pool[socket.id];

    });
    

    // custom listeners

    socket.on('system.connect_ack', function (payload) {
      console.log('connect_ack() at ' + payload.time_connected);
    }); 

    socket.on('clock.tick_ack', function (payload) {
      var current_time = (new Date).getTime();
      var ack_time = payload.time_received;
      // "latency form server to client" + "offset"
      var latency_s2c = payload.latency;
      // "latency form client to server" - "offset"
      var latency_c2s = current_time - ack_time;
      // get the average latency between client and server
      var average_altency = (latency_s2c + latency_c2s) / 2;

      console.log('on clock.tick_ack from client id[' + socket.id + '] at ' + payload.time_received);
      console.log('latency_s2c=' + latency_s2c + ', latency_c2s=' + latency_c2s + ", average_altency=" + average_altency);
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
   
    }, ( 1000 / (service_cfg.clock.ticks_per_second ? service_cfg.clock.ticks_per_second : 1) ) );
  }


  // start it
  start_ticking();

});

