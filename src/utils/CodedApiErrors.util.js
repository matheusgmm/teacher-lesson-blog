class CodedApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'CodedApiError';
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = { CodedApiError };
