#!/bin/bash

rm *.db

i=0

export FLASK_APP=proxy.py 
cd $GOPATH/src/github.com/byu-oit/av-scheduling-exchange-microservice/ 
flask run --host=0.0.0.0 &

while [ $i -lt 4 ]
do
    curl -s 'http://0.0.0.0:5000/v1.0/exchange/calendar/events' > /dev/null
    i=$[$i+1]
    sleep 2
done
