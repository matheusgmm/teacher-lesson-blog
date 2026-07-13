const { CodedApiError } = require('../utils/CodedApiError.util');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    console.error(err);
  } else {
    console.warn(`[${statusCode}] ${err.message} - ${req.originalUrl}`);
  }

  const body = err instanceof CodedApiError
    ? err.toJSON()
    : {
        status: statusCode,
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'Internal server error',
        timestamp: new Date().toISOString(),
      };

  res.status(statusCode).json(body);
}

module.exports = { errorHandler };
