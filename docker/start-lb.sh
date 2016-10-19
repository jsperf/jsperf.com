docker run -d --name jsperfcom_lb --publish 80:80 --link jsperfcom_registrator_1:registrator --link jsperfcom_consul_1:consul jsperf/jsperf-load-balancer:master
