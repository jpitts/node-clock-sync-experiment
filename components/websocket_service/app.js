
// node modules
var http = require('http')
  , eio = require('engine.io')
  , sio = require('socket.io')
  , crypto = require('crypto')
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


    // Send "delay_response" when receiving "delay_request" from client
    socket.on('DELAY_REQUEST', function (request_date) {
      var receiving_time = (new Date).getTime()
      var current_time = (new Date).getTime()
      console.log('Receive DELAY_REUQEST at ' + receiving_time);

      var response_data = {
        serial_no: request_date.serial_no,
        receiving_time: receiving_time,
        sending_time: current_time,
      };

      socket.emit('DELAY_RESPONSE', response_data);
      console.log('send DELAY_RESPONSE for client id[' + socket.id + ']');
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

         
      //console.log('service tick ' + current_time);
      
      // check for connected clients
      if (socket_pool && Object.keys(socket_pool).length) {
        var socket_ids = Object.keys(socket_pool);
        
        // broadcast tick to all clients
        //console.log('broadcast to websockets clients: ', socket_ids);  
         
        for (var i=0; i<socket_ids.length; i++) {
         
          var client = socket_pool[ socket_ids[i] ];
          console.log('emit SYNC and FOLLOW_UP to client id[' + client.id + '].');

          // generate serial number by MD5(current_time and socket_id)
          var current_time = (new Date).getTime();
          var serial_number = crypto.createHash('md5').update(current_time + socket_ids[i]).digest("hex");

          var sync_data = {
            serial_no: serial_number,
          };

          // get current time for follow up message
          var sync_time = (new Date).getTime();
          var follow_up_data = {
            serial_no: serial_number,
            sync_time: sync_time,
          };

          // emit sync and follow up message to this client
          client.emit('SYNC', sync_data);
          client.emit('FOLLOW_UP', follow_up_data);
        }
         
      } 
   
    }, ( 1000 / (service_cfg.clock.ticks_per_second ? service_cfg.clock.ticks_per_second : 1) ) );
  }


  // start it
  start_ticking();

});

