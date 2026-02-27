const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./configs/db');
const postsRoutes = require('./src/routes/post');
const commentsRoutes = require('./src/routes/comment');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);

app.get('/', (req, res) => {
  res.json({
    msg: 'API de Publicaciones y Comentarios funcionando ✅',
    version: '1.0.0',
    endpoints: {
      posts: '/api/posts',
      comments: '/api/comments'
    }
  });
});

app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      msg: 'Error de validación',
      errors: messages
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      msg: 'ID inválido',
      error: err.message
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      msg: 'El recurso ya existe',
      error: err.message
    });
  }

  console.error('[ERROR]', new Date().toISOString(), err);

  res.status(status).json({
    msg: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});