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
    var socket = CSE.WebSocket.socket = new eio.Socket('ws://' + domain_name + ':' + port + '/');
    
    // define the on listeners
    socket.on('open', function () {
      console.log('eio open');
      //console.log(CSE.WebSocket.socket);
      
      // messge 
      socket.on('message', function (data) { 
        console.log('websocket message ', data);
      });
      
      // close
      socket.on('close', function () { 
        console.log('websocket close');
      });
    
    });
    
    cb(); 

  }

}) (( window.CSE=window.CSE || {}));
// only you can prevent global namespace collisions
