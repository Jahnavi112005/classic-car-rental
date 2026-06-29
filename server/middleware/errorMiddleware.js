export function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(error, req, res, _next) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (error.name === 'ValidationError') statusCode = 400;
  if (error.name === 'CastError') statusCode = 400;
  if (error.code === 'LIMIT_FILE_SIZE') statusCode = 400;
  res.status(statusCode).json({
    message: error.message || 'Server error',
  });
}
