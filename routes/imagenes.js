// imagenes.js (CORREGIDO Y ADAPTADO A POSTGRESQL)
const express = require('express');
const router = express.Router();
const { verifyToken } = require('./usuario'); 
const db = require('../db'); // Conexión a PostgreSQL (el pool)


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
        // 2. Añadido RETURNING id
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
    // Se corrige el parámetro a ':id' para que apunte al ID de la imagen, no al producto
    const { id } = req.params; 
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