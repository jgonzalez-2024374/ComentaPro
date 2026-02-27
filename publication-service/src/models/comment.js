const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'El contenido del comentario es obligatorio'],
    trim: true,
    minlength: [3, 'El comentario debe tener al menos 3 caracteres'],
    maxlength: [500, 'El comentario no puede exceder 500 caracteres']
  },
  author: {
    type: String,
    required: [true, 'El usuario/autor es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre de usuario debe tener al menos 2 caracteres']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'El ID de la publicación es obligatorio']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

commentSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Comment', commentSchema);
