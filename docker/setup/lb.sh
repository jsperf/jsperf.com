docker run -d \
--name=consul \
--net=host \
gliderlabs/consul-server:0.6 \
-bootstrap \
-bind=127.0.0.1
docker run -d \
--name=registrator \
--net=host \
--volume="/var/run/docker.sock:/tmp/docker.sock" \
gliderlabs/registrator:v6 \
consul://127.0.0.1:8500
