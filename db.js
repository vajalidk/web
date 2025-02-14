const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Vicente_2003',
    database: 'honda_app'
});

db.connect(err => {
    if (err) {
        console.error('❌ Error al conectar a MySQL:', err);
    } else {
        console.log('✅ Conectado a MySQL correctamente');
    }
});

module.exports = db;
