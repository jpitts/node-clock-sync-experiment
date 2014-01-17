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
    } catch (e) {
      console.error('cannot load config/environment.js.default');
      process.exit(e.code);
    }

    CSE.config = require('../config/environment.js.default').config;
   
  }

  // done!
  cb(null, CSE);

}


