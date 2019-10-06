const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(("'))(\\?.)*?\1/);
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired. Please, log in back again.', 401);

const sendErrorDev = (error, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack
    });
  }

  //RENDERED Website
  console.log(error);
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    message: error.message
  });
};

const sendErrorProd = (error, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message
      });
      // Programming or other unknown error: don't leak the error details
    }

    // 1) Log error
    console.log(error);

    // 2) Send generic error message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  // RENDERED WEBSITE
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      title: 'Something went wrong!',
      error: error,
      message: error.message
    });
    // Programming or other unknown error: don't leak the error details
  }
  // 1) Log error
  console.log(error);

  // 2) Send generic error message
  return res.status(error.statusCode).render('error', {
    title: 'Something went very wrong',
    message: 'Please, try again later!'
  });
};

module.exports = (err, req, res, next) => {
  //console.log(error.stack);
  err.statusCode = err.statusCode || 500; // internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
