const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    body('title')
      .trim()
      .notEmpty().withMessage('El título es obligatorio')
      .isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres'),
    body('category')
      .trim()
      .notEmpty().withMessage('La categoría es obligatoria'),
    body('text')
      .trim()
      .notEmpty().withMessage('El contenido es obligatorio')
      .isLength({ min: 5 }).withMessage('El contenido debe tener al menos 5 caracteres')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = new Post({
        title: req.body.title,
        category: req.body.category,
        text: req.body.text,
        author: req.author
      });

      await post.save();
      res.status(201).json({
        msg: 'Publicación creada exitosamente',
        data: post
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    const filter = category ? { category: new RegExp(category, 'i') } : {};

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      data: posts
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de publicación inválido' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Publicación no encontrada' });
    }

    const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: -1 });

    res.json({
      ...post.toObject(),
      comments: comments
    });
  } catch (err) {
    next(err);
  }
});

router.put(
  '/:id',
  auth,
  [
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('El título no puede estar vacío')
      .isLength({ min: 3 }).withMessage('El título debe tener al menos 3 caracteres'),
    body('category')
      .optional()
      .trim()
      .notEmpty().withMessage('La categoría no puede estar vacía'),
    body('text')
      .optional()
      .trim()
      .notEmpty().withMessage('El contenido no puede estar vacío')
      .isLength({ min: 5 }).withMessage('El contenido debe tener al menos 5 caracteres')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ msg: 'ID de publicación inválido' });
      }

      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ msg: 'Publicación no encontrada' });
      }

      if (post.author !== req.author) {
        return res.status(403).json({ msg: 'No tienes permiso para editar esta publicación' });
      }

      if (req.body.title) post.title = req.body.title;
      if (req.body.category) post.category = req.body.category;
      if (req.body.text) post.text = req.body.text;

      await post.save();
      res.json({
        msg: 'Publicación actualizada exitosamente',
        data: post
      });
    } catch (err) {
      next(err);
    }
  }
);


router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de publicación inválido' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Publicación no encontrada' });
    }

    if (post.author !== req.author) {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar esta publicación' });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });

    res.json({ msg: 'Publicación y sus comentarios eliminados correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
