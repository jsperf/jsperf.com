#!/bin/bash

docker build -f Dockerfile-lb . -t jsperf/jsperf-load-balancer -t jsperf/jsperf-load-balancer:master
docker push jsperf/jsperf-load-balancer
