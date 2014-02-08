/* 
  node modules
*/



/*
  Clock Sync Experiment node module
*/

var CSE = module.exports = exports;

/*
  public attributes
*/

CSE.config = {};

/*
// define ptp emit event
CSE.EVENT = {
  // sync data contain "serial number" for this sync
  SYNC: 'cse.emit.sync',
  // sync follow up data contain "serial number" and "sync time" for previous message
  SYNC_FOLLOW_UP: 'cse.emit.syncFollowUp',
  // delay rquest contain "serial number"
  DELAY_REQUEST: 'cse.emit.delayRequest',
  // delay response contain "serial number", "receiving time for request" and "sending time for response"
  DELAY_RESPONE: 'cse.emit.delayRespone',
};
*/

/* 
  public functions 
*/

CSE.init = function (attr, cb) {
 
  // set up the environment-based config
  try {
    require.resolve('../config/' + global.process.env.NODE_ENV);
    CSE.config = require('../config/' + global.process.env.NODE_ENV).config;

  } catch (e) {
    console.log('Service will use the default config: config/environment.js.default');

    // fall back to the default config
    try {
      require.resolve('../config/environment.js.default');
      CSE.config = require('../config/environment.js.default').config;
 
    } catch (e) {
      console.error('cannot load config/environment.js.default');
      process.exit(e.code);
    }
  
  }

  // done!
  cb(null, CSE);

}


