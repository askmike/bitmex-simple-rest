class BitmexError extends Error {
  constructor(message, { statusCode, headers, data }) {
    super(message);
    this.statusCode = statusCode;
    this.headers = headers;
    Error.captureStackTrace(this, BitmexError);
  }
}


module.exports = BitmexError;