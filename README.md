
# Clock Sync Experiment

An exploration of how to structure a websockets app for clock synchronization.

## Overview

The CSE system includes a self-contained web and websockets application as well as client-side javascript.

## Installing CSE
    
    CSE requires node.js 0.10.x

    In order to install the node dependencies:
    npm install

    See the "dependencies" entry in package.json for a complete list.

### Running CSE

    In separate screens, run the following:
    ./bin/run_websocket_service.sh
    ./bin/run_web_service.sh

    Then open the following URL in a browser: 
    http://localhost:8080/


## Components

CSE is divided into components, each running on its own port.


### WebSocket Service

Enables realtime messaging between the client and CSE system.


### Web Service

Serves ejs templates and static javascript, images, and css.


## Client Assets

### CSE Client Library

Enables the client to interact with the websocket service.

Located in components/web_service/public/js/clock_sync_experiment-0.1.0

