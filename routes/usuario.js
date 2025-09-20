// usuario.js (CORREGIDO Y ADAPTADO A POSTGRESQL)
const express = require("express");
const jwt = require("jsonwebtoken");
// Necesario para el hash MD5, ya que PostgreSQL no tiene MD5 nativo en el driver
const crypto = require('crypto'); 
const router = express.Router();
const db = require("../db"); // Conexión a PostgreSQL (el pool)

const SECRET_KEY = "mi_secreto_ultra_seguro";

// Función para generar MD5 (necesario fuera de la consulta)
function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

// ------------------------------------------------------------------
// 1. LOGIN (Generar token)
// ------------------------------------------------------------------
router.post("/login", async (req, res) => {
    const { usuario, password } = req.body;
    const hashedPassword = md5(password); // Calcular MD5 en Node.js

    try {
        // La consulta usa $1 y $2 y busca el hash ya calculado en Node.js.
        const queryText = "SELECT * FROM usuario WHERE nombre = $1 AND password = $2";
        
        const result = await db.query(queryText, [usuario, hashedPassword]);
        const rows = result.rows; 
        
        if (rows.length === 0) {
            return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
        }

        const user = rows[0];
        const token = jwt.sign({ 
            // Usamos 'id_usuario' que es el nombre correcto del campo
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

// ------------------------------------------------------------------
// 2. Middleware para verificar token
// ------------------------------------------------------------------
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ message: "Token requerido" });
    }

    // Asegura que se remueva "Bearer " si está presente
    jwt.verify(token.replace("Bearer ", ""), SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido o expirado" });
        }

        req.user = decoded;
        next();
    });
};

// ------------------------------------------------------------------
// 3. Ruta protegida de ejemplo (profile)
// ------------------------------------------------------------------
router.get("/profile", verifyToken, async (req, res) => {
    try {
        // La consulta busca por ID del usuario (desde el token)
        const queryText = "SELECT id_usuario, nombre FROM usuario WHERE id_usuario = $1";
        
        const result = await db.query(queryText, [req.user.id]);
        
        res.json({ message: "Acceso autorizado", user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Error al obtener datos" });
    }
});

// ------------------------------------------------------------------
// 4. REGISTRO
// ------------------------------------------------------------------
router.post("/registro", async (req, res) => {
    const { usuario, password } = req.body;
    const hashedPassword = md5(password); // Calcular MD5 en Node.js

    if (!usuario || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    try {
        // Verificar si el usuario ya existe
        const checkQuery = "SELECT * FROM usuario WHERE nombre = $1";
        const existingResult = await db.query(checkQuery, [usuario]);

        if (existingResult.rows.length > 0) {
            return res.status(409).json({ message: "El usuario ya existe" });
        }

        // Insertar el hash calculado y usar RETURNING para obtener el ID
        const insertQuery = 
            "INSERT INTO usuario (nombre, password) VALUES ($1, $2) RETURNING id_usuario";
        
        const result = await db.query(insertQuery, [usuario, hashedPassword]);

        // Obtener el ID insertado
        res.status(201).json({ 
            message: "Usuario registrado exitosamente",
            id: result.rows[0].id_usuario 
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
