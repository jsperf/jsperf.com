var Glue = require('glue');
var Manifest = require('./manifest');

var composeOptions = {
  relativeTo: __dirname
};

const composer = Glue.compose.bind(Glue, Manifest.get('/'), composeOptions);

composer(function (err, server) {
  if (err) {
    throw err;
  }

  server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);

    process.on('SIGTERM', function () {
      server.log('info', 'Received SIGTERM. Attempting to stop server');
      server.stop({ timeout: 10000 }, function () {
        server.log('info', 'Server stopped. Exiting');
        process.exit(0);
      });
    });
  });
});
