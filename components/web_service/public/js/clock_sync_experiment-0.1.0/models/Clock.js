/*
  
  Clock Model
  
  CSE.Clock attributes: 
    
    recent_ticks - array containing recent ticks to the client
    recent_tick_acks - array contain recent tick acks from the client
 
*/

(function (clock_sync_experiment) {
  var clock = (clock_sync_experiment.Clock = {});
  
  // clock attributes
  clock.ticks = [];
  clock.ticks_maxlength = 100;
  clock.show_recent_ticks = false;

  // init the clock

  clock.init = function (attr, cb) {
    console.log('CSE.Clock.init()');
    
    cb();

  } 
  
  
  // add tick
  
  clock.add_tick = function (attr, cb) {
    console.log('CSE.Clock.add_tick()');
    //console.log(clock.ticks.length);

    clock.ticks.unshift(attr);

    // trim the tick array
    if (clock.ticks.length >= clock.ticks_maxlength) {
      clock.ticks.pop();
    }
    
  }
  
}) (( window.CSE=window.CSE || {}));
// only you can prevent global namespace collisions
