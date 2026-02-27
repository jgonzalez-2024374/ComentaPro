const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const auth = require('../../middlewares/auth');

const router = express.Router();

// Crear publicación
router.post(
  '/',
  auth,
  [
    body('title').notEmpty().withMessage('El título es obligatorio'),
    body('category').notEmpty().withMessage('La categoría es obligatoria'),
    body('text').notEmpty().withMessage('El texto es obligatorio')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const post = new Post({ ...req.body, author: req.author });
      await post.save();
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  }
);

// Listar publicaciones
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Obtener por ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Publicación no encontrada' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Editar publicación (solo autor)
router.put(
  '/:id',
  auth,
  [
    body('title').optional().notEmpty().withMessage('El título no puede estar vacío'),
    body('category').optional().notEmpty().withMessage('La categoría no puede estar vacía'),
    body('text').optional().notEmpty().withMessage('El texto no puede estar vacío')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ msg: 'Publicación no encontrada' });
      if (post.author !== req.author) return res.status(403).json({ msg: 'No eres el autor' });

      Object.assign(post, req.body);
      await post.save();
      res.json(post);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  }
);

// Eliminar publicación (solo autor)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Publicación no encontrada' });
    if (post.author !== req.author) return res.status(403).json({ msg: 'No eres el autor' });

    await post.remove();
    res.json({ msg: 'Publicación eliminada' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;