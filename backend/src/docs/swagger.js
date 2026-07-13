const swaggerUi = require('swagger-ui-express');

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'TaMaD API',
    version: '1.0.0',
    description: 'Production task management API'
  },
  paths: {}
};

function setupSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = { setupSwagger };