const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'El título es obligatorio'],
    trim: true,
    minlength: [3, 'El título debe tener al menos 3 caracteres']
  },
  category: { 
    type: String, 
    required: [true, 'La categoría es obligatoria'],
    trim: true 
  },
  text: { 
    type: String, 
    required: [true, 'El contenido es obligatorio'],
    minlength: [5, 'El contenido debe tener al menos 5 caracteres']
  },
  author: { 
    type: String, 
    required: [true, 'El usuario/autor es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre de usuario debe tener al menos 2 caracteres']
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  }
});

module.exports = mongoose.model('Post', postSchema);