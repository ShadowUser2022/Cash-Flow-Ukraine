import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorMiddleware = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json({
    error: {
      message,
      code: error.code,
      timestamp: new Date().toISOString()
    }
  });
};
