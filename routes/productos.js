// productos.js (CORREGIDO Y ADAPTADO A POSTGRESQL)
const express = require('express');
const router = express.Router();
const { verifyToken } = require('./usuario');
const db = require('../db'); // Conexión a PostgreSQL (el pool)

// ------------------------------------------------------------------
// RUTAS PÚBLICAS (sin middleware de autenticación)
// ------------------------------------------------------------------

// Obtener todos los productos (PÚBLICO)
router.get('/', async (req, res) => {
    try {
        console.log('Acceso público a /productos');
        const { categoria_id } = req.query;
        
        let sql = `
            SELECT 
                p.id,
                p.nombre,
                p.precio,
                p.categoria_id,
                c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
        `;
        
        const params = [];
        
        if (categoria_id) {
            // Placeholder $1
            sql += ' WHERE p.categoria_id = $1';
            params.push(categoria_id);
        }
        
        // Ejecución de la consulta con la sintaxis de PostgreSQL (db.query y params)
        const result = await db.query(sql, params);
        
        // Acceso a los resultados con 'result.rows'
        res.json(result.rows);
    } catch (err) {
        console.error('Error en GET /productos:', err);
        res.status(500).json({ error: 'Error al obtener productos: ' + err.message });
    }
});

// Obtener producto por ID (PÚBLICO)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Placeholder $1
        const queryText = `
            SELECT 
                p.id,
                p.nombre,
                p.precio,
                p.categoria_id,
                c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = $1
        `;
        
        const result = await db.query(queryText, [id]);
        
        // Comprobación de filas en 'result.rows'
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener detalle del producto: ' + err.message });
    }
});

// ------------------------------------------------------------------
// RUTAS PRIVADAS (requieren autenticación)
// ------------------------------------------------------------------

// Crear producto (PRIVADO)
router.post('/', verifyToken, async (req, res) => {
    const { nombre, precio, categoria_id } = req.body;
    try {
        // Placeholders $1, $2, $3 y RETURNING para obtener el objeto insertado
        const queryText = `
            INSERT INTO productos (nombre, precio, categoria_id) 
            VALUES ($1, $2, $3) 
            RETURNING id, nombre, precio, categoria_id
        `;
        
        const result = await db.query(queryText, [nombre, precio, categoria_id]);
        
        // Obtención del objeto insertado completo de result.rows[0]
        res.json(result.rows[0]); 
    } catch (err) {
        res.status(500).json({ error: 'Error al crear producto: ' + err.message });
    }
});

// Actualizar producto (PRIVADO)
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, categoria_id } = req.body;
    try {
        // Placeholders $1, $2, $3 para campos y $4 para el WHERE id
        const queryText = `
            UPDATE productos 
            SET nombre = $1, precio = $2, categoria_id = $3 
            WHERE id = $4
        `;
        
        // Orden de parámetros: [nombre, precio, categoria_id, id]
        await db.query(queryText, [nombre, precio, categoria_id, id]);
        
        res.json({ id, nombre, precio, categoria_id });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar producto: ' + err.message });
    }
});

// Eliminar producto (PRIVADO)
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Placeholder $1
        const queryText = 'DELETE FROM productos WHERE id = $1';
        await db.query(queryText, [id]);
        
        res.json({ mensaje: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar producto: ' + err.message });
    }
});

module.exports = router;