const express = require('express');
const router = express.Router();
const { verifyToken } = require('./usuario');
const db = require('../db');

// RUTAS PÚBLICAS (sin middleware de autenticación)

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
      sql += ' WHERE p.categoria_id = ?';
      params.push(categoria_id);
    }
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /productos:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener producto por ID (PÚBLICO)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.categoria_id,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RUTAS PRIVADAS (requieren autenticación)

// Crear producto (PRIVADO)
router.post('/', verifyToken, async (req, res) => {
  const { nombre, precio, categoria_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO productos (nombre, precio, categoria_id) VALUES (?, ?, ?)',
      [nombre, precio, categoria_id]
    );
    res.json({ id: result.insertId, nombre, precio, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar producto (PRIVADO)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, categoria_id } = req.body;
  try {
    await db.query(
      'UPDATE productos SET nombre = ?, precio = ?, categoria_id = ? WHERE id = ?',
      [nombre, precio, categoria_id, id]
    );
    res.json({ id, nombre, precio, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar producto (PRIVADO)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;