module.exports = (req, res, next) => {
  const author = req.header('x-author');
  
  if (!author || author.trim() === '') {
    return res.status(401).json({ msg: 'Usuario no proporcionado. Se requiere autenticación.' });
  }
  
  req.author = author;
  next();
};

