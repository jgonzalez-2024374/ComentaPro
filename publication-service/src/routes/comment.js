const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/comment');
const Post = require('../models/post');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    body('text')
      .trim()
      .notEmpty().withMessage('El contenido del comentario es obligatorio')
      .isLength({ min: 3 }).withMessage('El comentario debe tener al menos 3 caracteres')
      .isLength({ max: 500 }).withMessage('El comentario no puede exceder 500 caracteres'),
    body('post')
      .notEmpty().withMessage('El ID de la publicación es obligatorio')
      .isMongoId().withMessage('El ID de la publicación no es válido')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = await Post.findById(req.body.post);
      if (!post) {
        return res.status(404).json({ msg: 'La publicación no existe' });
      }

      const comment = new Comment({
        text: req.body.text,
        author: req.author,
        post: req.body.post
      });

      await comment.save();
      await comment.populate('post');

      res.status(201).json({
        msg: 'Comentario creado exitosamente',
        data: comment
      });
    } catch (err) {
      next(err);
    }
  }
);


router.get('/post/:postId', async (req, res, next) => {
  try {
    if (!req.params.postId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de publicación inválido' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: 'La publicación no existe' });
    }

    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: -1 })
      .populate('post', 'title author');

    res.json({
      total: comments.length,
      data: comments
    });
  } catch (err) {
    next(err);
  }
});


router.get('/:id', async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de comentario inválido' });
    }

    const comment = await Comment.findById(req.params.id).populate('post');
    if (!comment) {
      return res.status(404).json({ msg: 'Comentario no encontrado' });
    }

    res.json(comment);
  } catch (err) {
    next(err);
  }
});


router.put(
  '/:id',
  auth,
  [
    body('text')
      .trim()
      .notEmpty().withMessage('El contenido del comentario es obligatorio')
      .isLength({ min: 3 }).withMessage('El comentario debe tener al menos 3 caracteres')
      .isLength({ max: 500 }).withMessage('El comentario no puede exceder 500 caracteres')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ msg: 'ID de comentario inválido' });
      }

      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.status(404).json({ msg: 'Comentario no encontrado' });
      }

      if (comment.author !== req.author) {
        return res.status(403).json({ msg: 'No tienes permiso para editar este comentario' });
      }

      comment.text = req.body.text;
      await comment.save();
      await comment.populate('post');

      res.json({
        msg: 'Comentario actualizado exitosamente',
        data: comment
      });
    } catch (err) {
      next(err);
    }
  }
);


router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'ID de comentario inválido' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ msg: 'Comentario no encontrado' });
    }

    if (comment.author !== req.author) {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar este comentario' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Comentario eliminado correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
