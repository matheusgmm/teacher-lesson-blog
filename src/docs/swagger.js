const path = require('path');
const fs = require('fs');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');

const openapiPath = path.join(__dirname, 'openapi.yaml');
const openapiDocument = YAML.parse(fs.readFileSync(openapiPath, 'utf8'));

const swaggerUiOptions = {
  customSiteTitle: 'Teacher Lesson Blog API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
};

/**
 * Mounts interactive Swagger UI and the raw OpenAPI JSON.
 * UI:   GET /api/docs
 * Spec: GET /api/docs.json
 */
function setupSwagger(app) {
  app.get('/api/docs.json', (_req, res) => {
    res.json(openapiDocument);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, swaggerUiOptions),
  );
}

module.exports = { setupSwagger, openapiDocument };
