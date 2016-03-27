docker run -d --name jsperfcom_db_1 \
-v /data-jsperf-mysql \
--env MYSQL_PASSWORD \
--env MYSQL_RANDOM_ROOT_PASSWORD='true' \
--env MYSQL_DATABASE='jsperf' \
--env MYSQL_USER='jsperf' \
mysql
