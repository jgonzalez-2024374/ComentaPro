module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      msg: "Error de validación",
      errors: messages,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      msg: "ID inválido",
      error: err.message,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      msg: "El recurso ya existe",
      error: err.message,
    });
  }

  console.error("[ERROR]", new Date().toISOString(), err);

  res.status(status).json({
    msg: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
