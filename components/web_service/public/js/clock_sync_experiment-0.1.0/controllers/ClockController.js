/*
  
  Clock Controller
  
  CSE.ClockController attributes: 
    
 
*/

(function (clock_sync_experiment) {
  var clock_ctrl = (clock_sync_experiment.ClockController = {});

  // toggle recent ticks
  
  clock_ctrl.toggle_recent_ticks = function (attr, cb) { 
    
    if (CSE.Clock.show_recent_ticks) {
      CSE.Clock.show_recent_ticks = false;
      jQuery('#clock-ticks').html('');
      
    } else {
      CSE.Clock.show_recent_ticks = true;
    } 
    
  }


}) (( window.CSE=window.CSE || {}));
// only you can prevent global namespace collisions

