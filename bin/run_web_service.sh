#!/usr/bin/env bash

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $BINDIR

cd ../components/web_service && node app.js

