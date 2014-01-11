/* 
  node modules
*/

var express = require('express')
  , partials = require('express-partials')
;


/*
  configuration
  TODO: replace with json files
*/

var service_cfg = {
  web: {
    host: 'localhost',
    port: (process.env.CLOCK_WEB_PORT ? process.env.CLOCK_WEB_PORT : 8080),
  },
  websocket: {
    host: 'localhost',
    port: (process.env.CLOCK_WS_PORT ? process.env.CLOCK_WS_PORT : 8081),
  },
  clock: {
    ticks_per_second: 1
  }
};


/*
  define the service
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



