// imagenes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('./usuario'); // Importar verifyToken
// categorias.js - Agregar al inicio
const db = require('../db');


// Aplicar el middleware verifyToken a todas las rutas

// Obtener imágenes de un producto
router.get('/:producto_id', async (req, res) => {
  const { producto_id } = req.params;
  try {
    console.log('Acceso público a /imagenes/' + producto_id);
    const [rows] = await db.query(
      'SELECT * FROM imagenes_productos WHERE producto_id = ?',
      [producto_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Agregar imagen a un producto
router.post('/', verifyToken, async (req, res) => {
const { url, producto_id } = req.body;
try {
const [result] = await db.query(
'INSERT INTO imagenes_productos (url, producto_id) VALUES (?, ?)',
[url, producto_id]
);
res.json({ id: result.insertId, url, producto_id });
} catch (err) {
res.status(500).json({ error: err.message });
}
});

router.put('/:producto_id',verifyToken, async (req, res) => {
    const { id } = req.params;
    const { url, producto_id } = req.body;
    try {
    await db.query(
    'UPDATE imagenes_productos SET url = ?, producto_id = ? WHERE producto_id = ?',
    [url, producto_id, id]
    );
    res.json({ id, url, producto_id });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
    });
// Eliminar imagen
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
    await db.query('DELETE FROM imagenes_productos WHERE id = ?', [id]);
    res.json({ mensaje: 'Imagen eliminada' });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
    });
    module.exports = router;