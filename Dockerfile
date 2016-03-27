FROM node

ADD ./package.json /code/package.json
WORKDIR /code
RUN npm install
RUN npm install -g pm2@latest

ADD . /code

EXPOSE 3000

CMD ["pm2", "start", "pm2.json", "--no-daemon", "--kill-timeout", "3000"]
