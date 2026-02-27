module.exports = (req, res, next) => {
  const author = req.header('x-author');
  if (!author) return res.status(401).json({ msg: 'Autor no proporcionado' });
  req.author = author;
  next();


};

const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ msg: 'Usuario y contraseña requeridos' });

  try {
    const response = await axios.post('http://localhost:5001/api/v1/auth/login', { username, password });

    res.json({ token: response.data.token });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    res.status(500).json({ msg: 'Error al autenticar con Authentication Service' });
  }
});

module.exports = router;

