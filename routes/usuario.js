// usuario.js
const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const router = express.Router();

const SECRET_KEY = "mi_secreto_ultra_seguro";

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
};

// 3. Ruta protegida de ejemplo
router.get("/profile", verifyToken, async (req, res) => {
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
});

// Exportar tanto el router como el middleware verifyToken
module.exports = {
  router,
  verifyToken
};