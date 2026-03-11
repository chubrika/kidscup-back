import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  console.error('ERROR:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong.',
  });
};

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    if (err.name === 'CastError') err = new AppError('Invalid ID.', 400);
    if (err.code === 11000) err = new AppError('Duplicate field value.', 400);
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join('. ');
      err = new AppError(msg, 400);
    }
    sendErrorProd(err, res);
  }
};

export const notFound = (req, res, next) => {
  next(new AppError(`Not found: ${req.originalUrl}`, 404));
};
