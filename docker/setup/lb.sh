docker run -d \
--name=consul \
--net=host \
-p 8500:8500 \
-p 53:8600/udp \
-p 8400:8400 \
gliderlabs/consul-server:0.6 \
-bootstrap \
-advertise $DOCKER_IP \
-client 0.0.0.0

docker run -d \
--name=registrator \
--net=host \
--volume="/var/run/docker.sock:/tmp/docker.sock" \
gliderlabs/registrator:v6 \
-internal consul://localhost:8500

docker run -d \
--name=loadbalancer \
-p 80:80 \
--net=host \
jsperf/jsperf-load-balancer
