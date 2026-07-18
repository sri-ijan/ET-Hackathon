import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak details
    logger.error('💥 ERROR:', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export const errorHandler = (err, req, res, next) => {
  // Translate MulterErrors to user-friendly messages and appropriate status codes
  if (err.name === 'MulterError') {
    err.statusCode = 400;
    err.status = 'fail';
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      err.message = `Unexpected file field "${err.field}". Please upload files using only the 'specification' and 'submittal' fields.`;
    } else if (err.code === 'MISSING_FIELD_NAME') {
      err.message = 'A file was uploaded, but the form-data field name (key) is missing. Please ensure your form-data fields are named exactly "specification" and "submittal".';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      err.message = 'File is too large. The maximum size allowed is 10 MB per file.';
    }
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

