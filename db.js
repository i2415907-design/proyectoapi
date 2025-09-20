// db.js
<<<<<<< HEAD
// Configuración de conexión a PostgreSQL usando la librería 'pg'

const { Pool } = require('pg'); 

// 1. Obtiene la cadena de conexión de las variables de entorno de Render.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("FATAL ERROR: La variable de entorno DATABASE_URL no está configurada.");
    process.exit(1); 
}

// 2. Configura el pool de conexiones.
const pool = new Pool({
    connectionString: connectionString,
    // Render requiere SSL (Secure Sockets Layer) para la conexión entre servicios.
    ssl: {
        rejectUnauthorized: false
    }
});

// 3. Exporta la función query() para mantener la compatibilidad con tus rutas.
// El método pool.query() de 'pg' ya devuelve una promesa, ¡así que no necesitas Promisify!
module.exports = {
    // La función 'query' recibe el texto SQL y los parámetros (valores).
    query: (text, params) => pool.query(text, params),
};
=======
const mysql = require('mysql2');
// Crear pool de conexiones para manejar múltiples requests
const pool = mysql.createPool({
host: 'localhost',
user: 'root', // tu usuario de MySQL
password: '', // tu contraseña de MySQL
database: 'tienda'
});
// Promisify para usar async/await
const promisePool = pool.promise();
module.exports = promisePool;[]
>>>>>>> ddff8a15223f5c051e0a74c04fc6af3bf4f8f155
