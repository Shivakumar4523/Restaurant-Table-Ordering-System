export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
    details: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
}
