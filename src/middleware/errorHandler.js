// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Serverda Xatolik';

  res.status(status).json({
    success: false,
    message,
  });
}
