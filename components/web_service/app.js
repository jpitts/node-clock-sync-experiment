/* 
  node modules
*/

var express = require('express')
  , partials = require('express-partials')
;



// initialize the clock sync experiment module
require('../../lib/ClockSyncExperiment').init({}, function (err, CSE) {

  /*
    configuration
    NOTE: to load environment-based config, set NODE_ENV=dev in the shell script call
  */
  
  var service_cfg = CSE.config;


  /*
    service definition
  */

  var app = express();

  app.use( partials() ); /* 
  For rendering ejs views. 
  SEE: 
    https://github.com/publicclass/express-partials
    http://embeddedjs.com/
  */

  app.use(express.static(__dirname + '/public')); /*
  For static files in the public directory
  */


  /*
    define the web routes
  */

  app.get('/', function(req, res){
    res.render('index.ejs', { 
      layout:false, 
      service_cfg: service_cfg 
    }); 
  });


  // finally, start listening
  app.listen(service_cfg.web.port);
  console.log('Web listening on port[' + service_cfg.web.port + '].');


});

