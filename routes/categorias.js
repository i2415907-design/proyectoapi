const express = require('express');
const router = express.Router();
const { verifyToken } = require('./usuario');
const db = require('../db'); // ¡Ahora usa el pool de PostgreSQL!

// RUTAS PÚBLICAS
router.get('/', async (req, res) => {
    try {
        console.log('Acceso público a /categorias');
        // PostgreSQL devuelve los resultados en la propiedad 'rows'
        const result = await db.query('SELECT * FROM categorias');
        res.json(result.rows); 
    } catch (err) {
        // En un entorno de producción, es mejor no exponer err.message directamente
        res.status(500).json({ error: 'Error al obtener categorías.' });
    }
});

// RUTAS PRIVADAS

// POST - Usando $1 y RETURNING id
router.post('/', verifyToken, async (req, res) => {
    const { nombre } = req.body;
    try {
        const queryText = 'INSERT INTO categorias (nombre) VALUES ($1) RETURNING id';
        const result = await db.query(queryText, [nombre]);
        
        // El nuevo ID está en result.rows[0].id
        const newId = result.rows[0].id;
        res.json({ id: newId, nombre });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear la categoría.' });
    }
});

// PUT - Usando $1 y $2
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const queryText = 'UPDATE categorias SET nombre = $1 WHERE id = $2';
        const result = await db.query(queryText, [nombre, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }
        res.json({ id, nombre });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la categoría.' });
    }
});

// DELETE - Usando $1
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = 'DELETE FROM categorias WHERE id = $1';
        const result = await db.query(queryText, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }
        res.json({ mensaje: 'Categoría eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar la categoría.' });
    }
});

module.exports = router;
