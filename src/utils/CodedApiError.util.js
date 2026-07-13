class CodedApiError extends Error {
  constructor(code = 'INTERNAL_SERVER_ERROR', message = 'Internal server error', statusCode = 500) {
    super(message);
    this.name = 'CodedApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      status: this.statusCode,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
    };
  }

  send(res) {
    return res.status(this.statusCode).json(this.toJSON());
  }
}

module.exports = { CodedApiError };
