/* 
  
  Clock Sync Experiment - client javascript library


  CSE attributes:
  
    config - hash containing configs defined in the init

*/


(function (clock_sync_experiment) {

  // attribute defaults
  clock_sync_experiment.config = {};
  

  // init - gets everything started
  
  clock_sync_experiment.init = function (attr, cb) {
    console.log('CSE.init()');
 
    /* attrs:
        attr.websocket - contains info about the websocket server - example: { port: 8080 }
    */

    // wait until the page is ready
    jQuery(document).ready(function() {
      
      // set up the client config
      CSE.config = attr;
        
      // initialize the client clock
      CSE.Clock.init({}, function () {
      
        // initialize the websocket listeners
        CSE.WebSocket.init({}, function () {

          cb();

        });

      });  
     

    });

  }



}) (( window.CSE=window.CSE || {}));
// only you can prevent global namespace collisions
