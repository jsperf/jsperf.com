FROM mhart/alpine-node:6

WORKDIR /code

COPY ./package.json /code/package.json

RUN npm install

COPY . /code

EXPOSE 3000

CMD ["node", "server"]
