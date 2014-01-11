/*
  
  WebSocket Listeners
  
  CSE.WebSocket attributes: 
    
    socket - engine.io websocket connection
     
*/


(function (clock_sync_experiment) {
  var listener = (clock_sync_experiment.WebSocket = {});
  

  // init the listeners

  listener.init = function (attr, cb) {
    console.log('CSE.WebSocket.init()');
    
    var domain_name = window.location.hostname;
    var port = CSE.config.websocket.port;
    
    // establish an engine.io websocket connection
    //var socket = CSE.WebSocket.socket = new eio.Socket('ws://' + domain_name + ':' + port + '/');
    var socket = CSE.WebSocket.socket = new io.connect('ws://' + domain_name + ':' + port + '/');
    
    // on connection    
    socket.on('connect', function () {
      console.log('websocket open');
      //console.log(CSE.WebSocket.socket);

      // ack the connect 
      socket.emit('system.connect_ack', { time_connected: (new Date).getTime() });
 
      // close
      socket.on('close', function () { 
        console.log('websocket close');
      });     
     

      // define the websocket on listeners

      // clock tick
      socket.on('clock.tick', function (data) { 
        console.log('websocket on clock.tick ' + data.time);
        
        var current_time = (new Date).getTime();
        jQuery('#clock-display-pretty').html(new Date(data.time));
        jQuery('#clock-display').html(data.time);
        
        // store the tick
        CSE.Clock.add_tick({
          time: data.time,
          time_received: current_time
        });
        
        // ack the tick receive
        socket.emit('clock.tick_ack', {
          time_received: current_time 
        }); 

      });
 
 
    });


   
    cb(); 

  }

}) (( window.CSE=window.CSE || {}));
// only you can prevent global namespace collisions
