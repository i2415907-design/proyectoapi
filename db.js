// db.js

// Configuración de conexión a PostgreSQL usando la librería 'pg'
const { Pool } = require('pg'); 

// 1. Obtiene la cadena de conexión de las variables de entorno de Render.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("FATAL ERROR: La variable de entorno DATABASE_URL no está configurada.");
    process.exit(1); 
}

// 2. Configura y crea la instancia del pool de conexiones.
// Usamos 'pool' (minúscula) para la instancia para evitar el conflicto de redeclaración.
const pool = new Pool({
    connectionString: connectionString,
    // Render requiere SSL (Secure Sockets Layer) para la conexión entre servicios.
    ssl: {
        rejectUnauthorized: false
    }
});

// 3. Exporta la instancia del pool para que las rutas puedan usar pool.query(text, params).
// Esto simplifica el require en las rutas.
module.exports = pool;
