docker pull jsperf/jsperf.com:master
docker run -d --name jsperfcom_web -P \
--link jsperfcom_db_1:db \
--env DOMAIN=$DOMAIN \
--env SCHEME=$SCHEME \
--env PORT=3000 \
--env ADMIN_EMAIL=$ADMIN_EMAIL \
--env BROWSERSCOPE=$BROWSERSCOPE \
--env BELL_COOKIE_PASS=$BELL_COOKIE_PASS \
--env COOKIE_PASS=$COOKIE_PASS \
--env GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
--env GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
--env MYSQL_PASSWORD=$MYSQL_PASSWORD \
--env SERVICE_3000_CHECK_HTTP=/health \
--env SERVICE_3000_CHECK_INTERVAL=1s \
jsperf/jsperf.com:master
