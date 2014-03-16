
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

  // current time is updated on each tick
  var current_time = (new Date).getTime(); 


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
      //var current_time = (new Date).getTime() // current time now set in the tick
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
  
  /* 
   * Maintains a regular internal clock at a specified rate. 
   * Calls the on_each_tick according to service_cfg.ticks_per_second
  */
  
  var start_ticking = function (attr) {
    /* attrs:
        socket
    */
    
    console.log('start_ticking()');
    
    var internal_tick_rate = 50; // 100 is good enough, 10 is probably too fast
    var internal_tick_time = 0; // will increment by internal_tick_rate for each tick
    var start_time = current_time;
    
    // ticks per second (what is expected by the outside system)
    var ticks_per_sec = ( 1000 / (service_cfg.clock.ticks_per_second ? service_cfg.clock.ticks_per_second : 1) );    
    
    // internal tick maintains the ticks_per_sec, ticking on time
    function _internal_tick() {
      
      internal_tick_time += internal_tick_rate;
      //console.log('internal ' + internal_tick_time);
      
      // set the current time
      current_time = (new Date).getTime(); 
      //console.log('current time ' + (current_time / 1000));
      
      // helpful for debugging
      //var elapsed_time = Math.floor( internal_tick_time / internal_tick_rate ) / 10;
      //console.log('elapsed ' + elapsed_time);
      
      // difference (represents how much the internal tick is drifting)
      var diff = (current_time - start_time) - internal_tick_time;
      //console.log('diff ' + diff);
      
      // schedule the next tick
      setTimeout(function () {
        
        // fire up the next internal tick
        _internal_tick();

        // do some work each expected tick
        //console.log('(' + internal_tick_time + ' % ' + ticks_per_sec + ' == 0)');
        if (internal_tick_time % ticks_per_sec == 0) { // this is an expected tick
          
          console.log('time is drifting: ' + (current_time/1000));

          on_each_tick({}, function () {});
          //console.log('do some work at ' + new Date(current_time) + '!');
        }
               
      }, (internal_tick_rate - diff)); // correct for the drift

    }
    
    
    // initial "spin-up" 
    // wait for the earliest moment after the system clock has ticked
    
    spin_up(function () {
      
      console.log('start the internal clock ticking at ' + (internal_tick_rate / 1000) + ' sec.');
      
      console.log('time is drifting: ' + (current_time / 1000));
      
      // first tick
      on_each_tick({}, function () {});

      // internal tick will now perform on_each_tick
      _internal_tick();
  
    });

  }
 

  // spin up
  
  var spin_up = function (cb) {
    console.log('spin_up() wait for the system clock to reach the next second.');
    
    var spin_up_rate = 5; // 10 is reasonable
    var samples = 0;
    var time = (new Date).getTime();
    var current_sec = Math.floor((time / 1000));
    var previous_sec = current_sec;

    var interval = setInterval(function () {
      time = (new Date).getTime();
      
      //console.log('spin up time ' + (time / 1000) + ' ' + new Date(time) + ' at sample ' + samples);
      
      current_sec = Math.floor((time / 1000));
      //console.log(current_sec + ' ' + previous_sec);
      
      // time has advanced one second...
      if (current_sec != previous_sec) {
        console.log('spin up complete at time ' + (time/1000));
        clearInterval(interval);
        return cb(null, {attempts: samples});
      }
      
      previous_sec = current_sec;

      samples++;
      
      // give it up and just start
      if (samples >= ((1000 / spin_up_rate) + 10)) {
        console.error('spin up gave up and started after ' + samples + ' attempts.');
        clearInterval(interval);
        return cb("Failed after " + samples + " attempts.", { success: false, attempts: samples });
      }
  
    }, spin_up_rate);
    
  }

  
  // work to do on each tick

  var on_each_tick = function (attr, cb) {
    console.log('on_each_tick ' + new Date(current_time));

    // check for connected clients
    if (socket_pool && Object.keys(socket_pool).length) {
      var socket_ids = Object.keys(socket_pool);
      
      // broadcast tick to all clients
      //console.log('broadcast to websockets clients: ', socket_ids);  
       
      for (var i=0; i<socket_ids.length; i++) {
       
        var client = socket_pool[ socket_ids[i] ];
        console.log('emit SYNC and FOLLOW_UP to client id[' + client.id + '].');

        // generate serial number by MD5(current_time and socket_id)
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
    
  }
  
  // start it
  start_ticking();

});

