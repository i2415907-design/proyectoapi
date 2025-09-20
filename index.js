// index.js - Versión corregida
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Importar rutas
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const usuarioRoutes = require('./routes/usuario');

// Registrar rutas
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/usuario', usuarioRoutes.router); // Acceder al router exportado

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente', timestamp: new Date() });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de la tienda' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en https://proyectoapi-y5uq.onrender.com:${PORT}`);
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});