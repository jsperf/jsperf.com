var composer = require('./index');

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
