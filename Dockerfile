FROM node:5.11.1

WORKDIR /code

COPY ./package.json /code/package.json

RUN npm install

COPY . /code

EXPOSE 3000

CMD ["node", "server"]
