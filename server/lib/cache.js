const Catbox = require('catbox');
const CatboxRedis = require('catbox-redis');

exports.register = function (server, options, next) {
  if (options.host && options.host.length > 0) {
    server.log('info', 'connecting to redis cache');
    const client = new Catbox.Client(CatboxRedis, {
      partition: options.partition,
      host: options.host,
      port: options.port,
      password: options.password
    });

    server.expose('get', client.get.bind(client));
    server.expose('set', client.set.bind(client));
    server.expose('drop', client.drop.bind(client));

    client.start().then(next).catch(next);
  } else {
    server.log('info', 'no redis config provided. caching disabled');
    server.expose('get', (key, callback) => { callback(null, null); });
    server.expose('set', (key, value, ttl, callback) => { callback(null); });
    server.expose('drop', () => {});
    next();
  }
};

exports.register.attributes = {
  name: 'cache'
};
