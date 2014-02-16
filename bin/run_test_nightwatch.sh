#!/usr/bin/env bash

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $BINDIR

echo $BINDIR


cd ../components/test_nightwatch
../../node_modules/nightwatch/bin/nightwatch --config config/dev.settings.json tests/init_clock.js

