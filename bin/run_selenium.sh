#!/usr/bin/env bash

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $BINDIR

echo $BINDIR


cd ../components/test_nightwatch
java -jar ../../node_modules/nightwatch/bin/selenium-server-standalone-2.39.0.jar

