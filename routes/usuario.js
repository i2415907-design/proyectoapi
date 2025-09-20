<<<<<<< HEAD
// usuario.js (Adaptado a PostgreSQL)
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db"); // pool renombrado a 'db' para consistencia con otras rutas
=======
// usuario.js
const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");
>>>>>>> ddff8a15223f5c051e0a74c04fc6af3bf4f8f155
const router = express.Router();

const SECRET_KEY = "mi_secreto_ultra_seguro";

<<<<<<< HEAD
// NOTA: PostgreSQL no tiene una función MD5 nativa para usar en SQL.
// En un entorno de producción, DEBERÍAS usar una librería de Node.js como bcrypt.
// Para mantener el comportamiento original (aunque inseguro) de MD5 en el código,
// usaremos el módulo 'crypto' de Node.js para calcular el hash ANTES de la consulta.
const crypto = require('crypto');
function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

// 1. LOGIN (Generar token)
router.post("/login", async (req, res) => {
    const { usuario, password } = req.body;
    const hashedPassword = md5(password); // Calcular MD5 en Node.js

    try {
        // 1. Placeholder cambiado a $1 y $2
        // 2. Quitamos MD5() del SQL, ya que lo calculamos en Node.js
        const queryText = "SELECT * FROM usuario WHERE nombre = $1 AND password = $2";
        
        // El cliente 'pg' devuelve un objeto 'result', no un array desestructurado.
        const result = await db.query(queryText, [usuario, hashedPassword]);
        const rows = result.rows; 
        
        if (rows.length === 0) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        const user = rows[0];
        const token = jwt.sign({ 
            id: user.id_usuario,
            usuario: user.nombre
        }, SECRET_KEY, {
            expiresIn: "1h"
        });

        res.json({ message: "Login exitoso", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en el servidor" });
    }
});

// 2. Middleware para verificar token (No necesita cambios, es lógica de Express/JWT)
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "Token requerido" });
    }

    jwt.verify(token.replace("Bearer ", ""), SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido o expirado" });
        }

        req.user = decoded;
        next();
    });
=======
// 1. LOGIN (Generar token)
// usuario.js - Línea corregida
router.post("/login", async (req, res) => {
  const { usuario, password } = req.body;
  
  try {
    const [rows] = await pool.query(
      // CAMBIAR: "usuarios" → "usuario"
      "SELECT * FROM usuario WHERE nombre = ? AND password = MD5(?)",
      [usuario, password]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const user = rows[0];
    const token = jwt.sign({ 
      id: user.id_usuario,  // También cambiar: user.id → user.id_usuario
      usuario: user.nombre  // Y: user.usuario → user.nombre
    }, SECRET_KEY, {
      expiresIn: "1h"
    });
    
    res.json({ message: "Login exitoso", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// 2. Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  
  if (!token) {
    return res.status(403).json({ message: "Token requerido" });
  }
  
  jwt.verify(token.replace("Bearer ", ""), SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
    
    req.user = decoded;
    next();
  });
>>>>>>> ddff8a15223f5c051e0a74c04fc6af3bf4f8f155
};

// 3. Ruta protegida de ejemplo
router.get("/profile", verifyToken, async (req, res) => {
<<<<<<< HEAD
    try {
        // 1. Placeholder cambiado a $1
        const queryText = "SELECT id_usuario, nombre FROM usuario WHERE id_usuario = $1";
        
        // 2. Acceso al ID del token
        const result = await db.query(queryText, [req.user.id]);
        
        res.json({ message: "Acceso autorizado", user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Error al obtener datos" });
    }
});

// 4. REGISTRO
router.post("/registro", async (req, res) => {
    const { usuario, password } = req.body;
    const hashedPassword = md5(password); // Calcular MD5 en Node.js

    if (!usuario || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    try {
        // 1. Placeholder cambiado a $1
        const checkQuery = "SELECT * FROM usuario WHERE nombre = $1";
        const existingResult = await db.query(checkQuery, [usuario]);

        if (existingResult.rows.length > 0) {
            return res.status(409).json({ message: "El usuario ya existe" });
        }

        // 2. Placeholder cambiado a $1 y $2, y añadido RETURNING id_usuario
        const insertQuery = 
            "INSERT INTO usuario (nombre, password) VALUES ($1, $2) RETURNING id_usuario";
        
        // 3. Insertar el hash calculado en Node.js
        const result = await db.query(insertQuery, [usuario, hashedPassword]);

        // 4. Obtener el ID insertado
        res.status(201).json({ 
            message: "Usuario registrado exitosamente",
            id: result.rows[0].id_usuario 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error en el servidor al registrar usuario" });
    }
=======
  try {
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre FROM usuario WHERE id_usuario = ?",
      [req.user.id]
    );
    
    res.json({ message: "Acceso autorizado", user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener datos" });
  }
});

router.post("/registro", async (req, res) => {
  const { usuario, password } = req.body;

  // Validaciones básicas
  if (!usuario || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el usuario ya existe - SOLO POR NOMBRE
    const [existingUsers] = await pool.query(
      "SELECT * FROM usuario WHERE nombre = ?",
      [usuario]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }

    // Crear nuevo usuario
    const [result] = await pool.query(
      "INSERT INTO usuario (nombre, password) VALUES (?, MD5(?))",
      [usuario, password]
    );

    res.status(201).json({ 
      message: "Usuario registrado exitosamente",
      id: result.insertId 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en el servidor al registrar usuario" });
  }
>>>>>>> ddff8a15223f5c051e0a74c04fc6af3bf4f8f155
});

// Exportar tanto el router como el middleware verifyToken
module.exports = {
<<<<<<< HEAD
    router,
    verifyToken
=======
  router,
  verifyToken
>>>>>>> ddff8a15223f5c051e0a74c04fc6af3bf4f8f155
};