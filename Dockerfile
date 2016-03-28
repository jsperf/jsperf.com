FROM node

ADD ./package.json /code/package.json
RUN npm install -g pm2@latest
WORKDIR /code
RUN npm install

ADD . /code

EXPOSE 3000

CMD ["pm2", "start", "pm2.json", "--no-daemon", "--kill-timeout", "3000"]
