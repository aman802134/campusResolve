import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/api-error';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorDetails: any = [];

  // Handle Zod validation error
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
  }

  // Handle Mongoose validation error
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Database validation failed';
    errorDetails = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle CastError (e.g., invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle duplicate key
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
    errorDetails = Object.keys(err.keyPattern).map((key) => ({
      field: key,
      message: `${key} already exists`,
    }));
  }

  // Handle custom ApiError
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Respond
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errorDetails.length > 0 ? errorDetails : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
