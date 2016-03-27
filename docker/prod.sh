docker pull jsperf/jsperf.com:master
docker run -d --name jsperfcom_web_man \
--link jsperfcom_db_1:db \
--env DOMAIN \
--env SCHEME \
--env PORT=80 \
--env ADMIN_EMAIL \
--env BROWSERSCOPE \
--env BELL_COOKIE_PASS \
--env COOKIE_PASS \
--env GITHUB_CLIENT_ID \
--env GITHUB_CLIENT_SECRET \
--env MYSQL_PASSWORD \
--env SERVICE_3000_CHECK_HTTP=/health \
--env SERVICE_3000_CHECK_INTERVAL=1s \
-p 3000:80 \
jsperf/jsperf.com
