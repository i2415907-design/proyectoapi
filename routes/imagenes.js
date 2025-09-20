<<<<<<< HEAD
// imagenes.js (Adaptado a PostgreSQL)
const express = require('express');
const router = express.Router();
const { verifyToken } = require('./usuario'); 
const db = require('../db'); // ¡Ahora usa el pool de PostgreSQL!


// Obtener imágenes de un producto (Ruta pública)
router.get('/:producto_id', async (req, res) => {
    const { producto_id } = req.params;
    try {
        console.log('Acceso público a /imagenes/' + producto_id);
        
        // 1. Placeholder cambiado de '?' a $1
        const queryText = 'SELECT * FROM imagenes_productos WHERE producto_id = $1';
        const result = await db.query(queryText, [producto_id]);
        
        // 2. Acceso a los resultados en 'result.rows'
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener imágenes: ' + err.message });
    }
});

// Agregar imagen a un producto (Ruta privada)
router.post('/', verifyToken, async (req, res) => {
    const { url, producto_id } = req.body;
    try {
        // 1. Placeholders cambiados a $1, $2
        // 2. Añadido RETURNING id para obtener el ID de la nueva imagen
        const queryText = 
            'INSERT INTO imagenes_productos (url, producto_id) VALUES ($1, $2) RETURNING id';
            
        const result = await db.query(queryText, [url, producto_id]);
        
        // 3. El nuevo ID se obtiene de result.rows[0].id
        const newId = result.rows[0].id;
        res.json({ id: newId, url, producto_id });
    } catch (err) {
        res.status(500).json({ error: 'Error al agregar imagen: ' + err.message });
    }
});

// Actualizar imagen (Ruta privada)
router.put('/:id', verifyToken, async (req, res) => {
    // ⚠️ NOTA: Tu código original usaba :producto_id como parámetro, 
    // pero luego usaba 'id' en la lógica. Asumo que el parámetro de la URL es el 'id' de la imagen.
    const { id } = req.params; // Usando 'id' de la URL como el ID de la imagen
    const { url, producto_id } = req.body;
    try {
        // Placeholders cambiados a $1, $2, $3
        const queryText = 
            'UPDATE imagenes_productos SET url = $1, producto_id = $2 WHERE id = $3';
            
        // Los parámetros deben coincidir con $1, $2, $3
        await db.query(queryText, [url, producto_id, id]); 
        
        res.json({ id, url, producto_id });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar imagen: ' + err.message });
    }
});

// Eliminar imagen (Ruta privada)
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Placeholder cambiado a $1
        const queryText = 'DELETE FROM imagenes_productos WHERE id = $1';
        await db.query(queryText, [id]);
        
        res.json({ mensaje: 'Imagen eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar imagen: ' + err.message });
    }
});

module.exports = router;
=======
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
>>>>>>> ddff8a15223f5c051e0a74c04fc6af3bf4f8f155
