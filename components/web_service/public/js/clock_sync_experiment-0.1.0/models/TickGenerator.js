/*

  Tick Generator Model

  Set a timer to generte a tick
*/

(function (clock_sync_experiment) {
  var tick_generator = (clock_sync_experiment.PTPData = {});

  // Tick unit, Set tick unit = 100ms as default
  tick_generator.default_tick_unit = 100;
  tick_generator.current_tick_unit = 100;
  // Timer object, Set timer object = null as default
  tick_generator.period_timer = null;
  tick_generator.one_time_timer = null;
  // The time tick, increase every 1 tick_unit
  tick_generator.current_tick = 0;
  // Using local tick or server tick
  tick_generator.using_local_tick = true;

  // others can using follow parameter to adjust the timer
  tick_generator.target_unit = 100;
  tick_generator.target_offset = 0;

  // others can using this function to adjust timer
  tick_generator.adjustTimer = function (attr, cb) {
    tick_generator.target_unit = attr.target_unit;
    tick_generator.target_offset = attr.target_offset;
    tick_generator.using_local_tick = attr.unsin_local_tick;
  }

  // Setup timer, using tick-unit and tick-offset to (re)start the timer
  tick_generator.setupTimer = function (attr, cb) {

    // Clear previous one time timer
    if(tick_generator.one_time_timer != null) {
      clearTimeout(tick_generator.one_time_timer);
      tick_generator.one_time_timer = null;
    }

    // calculate the offset and shift for current tick
    var offset = (new Date).getTime() - attr.tick_end_time + attr.tick_offset;
    var shift = 0;
    // Need to set the offset as positive number because setTimeout function just support positive number.
    // TODO:
    // Need to decrease the calculation here, or the tick-offset and tick-shift whould become imprecise
    if(offset < 0) {
      shift = (-1) * (Math.ceil((-1) * offset / attr.tick_unit) + 1);
    } else {
      shift = Math.ceil(offset / attr.tick_unit);
    }
    offset -= (shift * atr.tick_unit);

    // shift and offset the tick
    tick_generator.current_tick = tick_generator.current_tick + shift;

    var tick_info = {
      tick_unit: attr.tick_unit;
    };
    tick_generator.one_time_timer = setTimeout(function(){tick_generator.startTimer(attr)}, offset);
  }

  // start a period timer
  tick_generator.startTimer = function (attr, cb) {
    // set up current tick unit
    tick_generator.current_tick_unit = attr.tick_unit;

    tick_generator.one_time_timer = null;
    if(tick_generator.period_timer != null) {
      clearInterval(tick_generator.period_timer);
      tick_generator.period_timer = null;
    }

    tick_generator.period_timer = setInterval(function(){tick_generator.updateTick()}, attr.tick_unit);
  }

  // increase the tick and adjust the timer
  // may be offset tick or change the tick unit
  tick_generator.updateTick = function (cb) {
    var tick_end_time = (new Date).getTime();
    // increase tick
    tick_generator.current_tick ++;

    // using local tick or not
    if(tick_generator.using_local_tick) {
      // timer to local tick
      if(tick_generator.current_tick_unit != tick_generator.default_tick_unit) {
        //
        var tick_info = {
          tick_end_time: tick_end_time,
          tick_unit: tick_generator.default_tick_unit,
          tick_offset: 0,
        };
        tick_generator.setupTimer(tick_info, 0);
        tick_generator.current_tick_unit = tick_generator.default_tick_unit;
        tick_generator.target_tick_unit = tick_generator.default_tick_unit;
        tick_generator.target_tick_offset = 0;
      } 
    } else {
      if(tick_generator.current_tick_unit != tick_generator.target_tick_unit
          || tick_generator.target_tick_offset != 0) {
        // restart timer by tick_unit and tick_offset
        var tick_info = {
          tick_end_time: tick_end_time,
          tick_unit: tick_generator.target_tick_unit,
          tick_offset: tick_generator.target_tick_offset,
        };
        tick_generator.setupTimer(attr);
        tick_generator.current_tick_unit = tick_generator.target_tick_unit;
        tick_generator.tick_generator.target_tick_offset = 0;
    }
  }

}) (( window.CSE=window.CSE || {}));
