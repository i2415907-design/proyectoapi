// index.js - Versión final y corregida
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Carga las variables de entorno de .env (en local) o usa el valor de Render (en producción)
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // <-- ¡USAR EL PUERTO DE RENDER!

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
app.use('/usuario', usuarioRoutes.router);

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
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
