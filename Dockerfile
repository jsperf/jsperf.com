FROM node

ADD ./package.json /code/package.json
WORKDIR /code
RUN npm install

ADD . /code

EXPOSE 3000

CMD ["node", "server"]
