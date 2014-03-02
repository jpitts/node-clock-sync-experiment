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

      CSE.PTPData.init();

      console.log('websocket on ' + CSE);

      // handle time SYNC from server
      socket.on('SYNC', function (sync_data) {
        console.log('websocket on SYNC serial_number:' + sync_data.serial_no);

        // record serial number and sync event receive
        CSE.PTPData.recordSync(sync_data.serial_no, (new Date).getTime());
      });

      // follow up event
      socket.on('FOLLOW_UP', function (follow_up_data) {
        console.log('websocket on FOLLOW_UP serial_number:'
          + follow_up_data.serial_no + ', sync_time:' + follow_up_data.sync_time);

        if( follow_up_data.serial_no == CSE.PTPData.sync_serial_no) {
          //sync_send_time = follow_up_data.sync_time;
          CSE.PTPData.recordFollowUp(follow_up_data.sync_time);

          // send DELAY_REQUEST after receiving SYNC and FOLLOW_UP
          var delay_request_data = {
            serial_no: CSE.PTPData.sync_serial_no,
          };

          CSE.PTPData.recordDelayRequest((new Date).getTime());
          socket.emit('DELAY_REQUEST', delay_request_data);
        }
      });

      socket.on('DELAY_RESPONSE', function (delay_response_data) {
        console.log('websocket on DELAY_RESPONSE serial_number:'
            + delay_response_data.serial_no + ', request_recv_time:'
            + delay_response_data.receiving_time);

        if(delay_response_data.serial_no == CSE.PTPData.sync_serial_no) {
          CSE.PTPData.recordDelayResponse((new Date).getTime(), delay_response_data.receiving_time,
              delay_response_data.sending_time);
          //CSE.PTPData.printData();

          // calculate offset and time latency
          var roundtrip_delay = CSE.PTPData.calculateRoundTripDelay();
          var clock_offset = CSE.PTPData.calculateClockOffset();

          console.log('roundtrip_delay: ' + roundtrip_delay);

          // store round-trip-delay and clock-offset
          if(CSE.PTPData.round_trip_times.length < 3) {
            CSE.PTPData.addRoundTripDalay(roundtrip_delay);
            CSE.PTPData.addClockOffset(clock_offset);
          } else {
            // calculate standard deviation of the round-trip-delay array
            var roundtrip_std_dev = CSE.PTPData.round_trip_times.stdDev();
            // calculate arithmetic mean of the round-trip-delay array
            var roundtrip_mean = CSE.PTPData.round_trip_times.mean();

            console.log('roundtrip_std_dev: ' + roundtrip_std_dev);
            console.log('roundtrip_mean: ' + roundtrip_mean);

            if(Math.abs(roundtrip_delay - roundtrip_mean) <= (2 * roundtrip_std_dev)) {
              console.log('Current roundtrip dalay is within double stanard deviation in the normal distribution.');
              // store roundtrip daley and clock offset
              CSE.PTPData.addRoundTripDalay(roundtrip_delay);
              CSE.PTPData.addClockOffset(clock_offset);

              // store the tick
              CSE.Clock.add_tick({
                time: CSE.PTPData.sync_recv_time,
                time_calibration: (CSE.PTPData.sync_recv_time + clock_offset)
              })
              
              jQuery('#clock-display-pretty').html(new Date((CSE.PTPData.sync_recv_time + clock_offset)));
              jQuery('#clock-display').html(CSE.PTPData.sync_recv_time);


            } else {
              console.log('Current roundtrip dalay is not within double stanard deviation in the normal distribution.');

              jQuery('#clock-display-pretty').html('Roundtrip delay not within expected range.');
              jQuery('#clock-display').html(CSE.PTPData.sync_recv_time);


            }
          }
        }
      });

/*
        // latency("latency form server to client" + "offset")
        // render the clock
        jQuery('#clock-display-pretty').html(new Date(data.time));
        jQuery('#clock-display').html(data.time);

        // store the tick
        CSE.Clock.add_tick({
          time: data.time,
          time_received: current_time
        });

        // render the recent ticks
        if (CSE.Clock.show_recent_ticks) {
          var ticks_html = '';
          for (var i=1; i<CSE.Clock.ticks.length; i++) { ticks_html = ticks_html + '<div class="clock-tick">' + CSE.Clock.ticks[i].time + '</div>' }
          jQuery('#clock-ticks').html(ticks_html);
        }

        // ack the tick receive and time latency("offset" + "latency form server to client")
        socket.emit('clock.tick_ack', {
          time_received: current_time,
          latency : latency,
        });
*/
    });


   
    cb(); 

  }

}) (( window.CSE=window.CSE || {}));
// only you can prevent global namespace collisions
