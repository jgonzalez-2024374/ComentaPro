const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./configs/db');
const postsRoutes = require('./src/routes/post');


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/posts', postsRoutes);


app.get('/', (req, res) => {
  res.send('API de Publicaciones funcionando ✅');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});