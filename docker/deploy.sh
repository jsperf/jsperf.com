docker pull jsperf/jsperf.com:master
dbservice=$(docker ps --filter name=db  --format "{{.Names}}")
timestamp=$(date +'%Y%m%d-%H-%M-%S')
services=$(docker ps --filter name=web  --format "{{.Names}}")
enum=1
for service in $services; do
  docker stop $service
  docker rm $service
  docker run -d --name 'jsperfcom_web_'$timestamp'_'$enum --link $dbservice:db --env-file /etc/environment --env SERVICE_3000_CHECK_HTTP=/health --env SERVICE_3000_CHECK_INTERVAL=1s jsperfcom_web
  enum=$((enum+1))
done
