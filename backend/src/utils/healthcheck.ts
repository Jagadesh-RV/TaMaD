import http from 'http';

export const healthcheck = () => {
  const options = {
    host: '127.0.0.1',
    port: Number(process.env.PORT || 5000),
    path: '/api/health',
    timeout: 2000,
  };

  const req = http.request(options, (res) => {
    if (res.statusCode && res.statusCode < 500) {
      process.exit(0);
      return;
    }
    process.exit(1);
  });

  req.on('error', () => process.exit(1));
  req.end();
};
