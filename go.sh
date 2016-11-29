#!/bin/sh

EXPOSED_PORT=3000
CONTAINER_PORT=3000

docker run  \
 -p $EXPOSED_PORT:$CONTAINER_PORT \
 --net=iot-net \
 --name iot-api \
 -d iot/api
