const express = require('express');
const router = express.Router();
const { verifyToken } = require('./usuario');
const db = require('../db'); // ¡Ahora usa el pool de PostgreSQL!

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
            // 1. Cambio de '?' a $1 para el placeholder
            sql += ' WHERE p.categoria_id = $1';
            params.push(categoria_id);
        }
        
        // Ejecución de la consulta con la sintaxis de PostgreSQL
        const result = await db.query(sql, params);
        
        // 2. Acceso a los resultados con 'result.rows'
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
        
        // 1. Cambio de '?' a $1
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
        
        // 2. Comprobación de filas en 'result.rows'
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
        // 1. Cambio de '?' a $1, $2, $3
        // 2. Adición de RETURNING * (o RETURNING id) para obtener el registro completo insertado
        const queryText = `
            INSERT INTO productos (nombre, precio, categoria_id) 
            VALUES ($1, $2, $3) 
            RETURNING id, nombre, precio, categoria_id
        `;
        
        const result = await db.query(queryText, [nombre, precio, categoria_id]);
        
        // 3. Obtención del objeto insertado completo de result.rows[0]
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
        // 1. Cambio de '?' a $1, $2, $3, $4
        const queryText = `
            UPDATE productos 
            SET nombre = $1, precio = $2, categoria_id = $3 
            WHERE id = $4
        `;
        
        // 2. Orden de parámetros: [nombre, precio, categoria_id, id]
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
        // 1. Cambio de '?' a $1
        const queryText = 'DELETE FROM productos WHERE id = $1';
        await db.query(queryText, [id]);
        
        res.json({ mensaje: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar producto: ' + err.message });
    }
});

module.exports = router;