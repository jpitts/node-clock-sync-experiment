/*

  Sync Data Model

  CSE.SyncData:

*/

(function (clock_sync_experiment) {
  var ptp_data = (clock_sync_experiment.PTPData = {});

  ptp_data.sync_serial_no = {};
  ptp_data.sync_send_time = {};
  ptp_data.sync_recv_time = {};
  ptp_data.delay_request_send_time = {};
  ptp_data.delay_request_recv_time = {};
  ptp_data.delay_response_send_time = {};
  ptp_data.delay_response_recv_time = {};

  ptp_data.round_trip_times = [];
  ptp_data.clock_offsets = [];
  ptp_data.max_data_length = 100;

  ptp_data.init = function (cb) {
    ptp_data.sync_serial_no = 0;
    ptp_data.sync_send_time = 0;
    ptp_data.sync_recv_time = 0;
    ptp_data.delay_request_send_time = 0;
    ptp_data.delay_request_recv_time = 0;
    ptp_data.delay_response_send_time = 0;
    ptp_data.delay_response_recv_time = 0;
  }

  ptp_data.recordSync = function (serial_no, time, cb) {
    ptp_data.sync_serial_no = serial_no;
    ptp_data.sync_recv_time = time;
    ptp_data.sync_send_time = 0;
    ptp_data.delay_request_send_time = 0;
    ptp_data.delay_request_recv_time = 0;
    ptp_data.delay_response_send_time = 0;
    ptp_data.delay_response_recv_time = 0;
  }

  ptp_data.recordFollowUp = function (time, cb) {
    ptp_data.sync_send_time = time;
  }

  ptp_data.recordDelayRequest = function (time, cb) {
    ptp_data.delay_request_send_time = time;
  }
  
  ptp_data.recordDelayResponse = function (request_recv_time, response_send_time, response_recv_time, cb) {
    ptp_data.delay_request_recv_time = request_recv_time;
    ptp_data.delay_response_send_time = response_send_time;
    ptp_data.delay_response_recv_time = response_recv_time;
  }

  ptp_data.calculateRoundTripDelay = function (cb) {
    var round_trip_dalay =
        (ptp_data.delay_request_recv_time - ptp_data.sync_send_time)
        - (ptp_data.delay_request_send_time - ptp_data.sync_recv_time);

    return round_trip_dalay;
  }

  ptp_data.calculateClockOffset = function (cb) {
    var clock_offset =
        (-1)
        * ((ptp_data.sync_recv_time - ptp_data.sync_send_time)
        + (ptp_data.delay_request_send_time - ptp_data.delay_request_recv_time)) / 2;

    return clock_offset;
  }


  ptp_data.addRoundTripDalay = function (delay, cb) {
    ptp_data.round_trip_times.unshift(delay);

    // trim the round-trip-times array
    if(ptp_data.round_trip_times.length >= ptp_data.max_data_length) {
      ptp_data.round_trip_times.pop();
    }
  }

  ptp_data.addClockOffset = function (offset, cb) {
    ptp_data.clock_offsets.unshift(offset);

    // trim the round-trip-times array
    if(ptp_data.clock_offsets.length >= ptp_data.max_data_length) {
      ptp_data.clock_offsets.pop();
    }
  }

  ptp_data.printData = function (cb) {
     console.log('========== PTP SYNC DATE START ==========');
     console.log('sync_serial_no: ' + ptp_data.sync_serial_no);
     console.log('sync_recv_time: ' + ptp_data.sync_recv_time);
     console.log('sync_send_time: ' + ptp_data.sync_send_time);
     console.log('delay_request_send_time: ' + ptp_data.delay_request_send_time);
     console.log('delay_request_recv_time: ' + ptp_data.delay_request_recv_time);
     console.log('delay_response_send_time: ' + ptp_data.delay_response_send_time);
     console.log('delay_response_recv_time: ' + ptp_data.delay_response_recv_time);
     console.log('========== PTP SYNC DATE END ==========');
  }

}) (( window.CSE=window.CSE || {}));
