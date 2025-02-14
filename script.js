const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 5000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar sesión de administrador
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === "Admin" && password === "Admin") {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "❌ Credenciales incorrectas" });
    }
});

// Ruta protegida para `tablas.html`
app.get('/tablas', (req, res) => {
    res.sendFile(path.join(__dirname, 'tablas.html'));
});

// Obtener autos
app.get('/api/autos', (req, res) => {
    db.query('SELECT * FROM autos', (err, results) => {
        if (err) {
            console.error('❌ Error al obtener autos:', err);
            res.status(500).json({ message: "Error al obtener autos." });
        } else {
            res.json(results);
        }
    });
});

// Obtener clientes
app.get('/api/clientes', (req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
        if (err) {
            console.error('❌ Error obteniendo clientes:', err);
            res.status(500).json({ message: "Error al obtener clientes." });
        } else {
            res.json(results);
        }
    });
});

// Obtener compras
app.get('/api/compras', (req, res) => {
    const query = `
        SELECT v.fecha_venta, 
               c.nombre AS cliente,  
               c.email, 
               c.telefono, 
               CONCAT(a.marca, ' ', a.modelo, ' ', a.anio) AS auto_comprado, 
               v.precio_final, 
               v.enganche, 
               v.plazo, 
               v.pago_mensual
        FROM ventas v
        JOIN clientes c ON v.id_cliente = c.id
        JOIN autos a ON v.id_auto = a.id;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error obteniendo compras:', err);
            res.status(500).json({ message: "Error al obtener compras." });
        } else {
            res.json(results);
        }
    });
});

// Registrar compra con manejo detallado de errores
app.post('/realizar-compra', (req, res) => {
    try {
        const { id_auto, nombre, email, telefono, estado, ciudad, fecha_venta, precio_final, enganche, plazo, pago_mensual } = req.body;

        if (!id_auto || !nombre || !email || !telefono || !estado || !ciudad || !fecha_venta || !precio_final || !enganche || !plazo || !pago_mensual) {
            throw new Error("❌ Faltan datos obligatorios para procesar la compra.");
        }

        db.query('SELECT id FROM clientes WHERE email = ?', [email], (err, clienteResult) => {
            if (err) {
                console.error("❌ Error verificando cliente en la base de datos:", err);
                return res.status(500).json({ message: "Error al verificar cliente." });
            }

            if (clienteResult.length === 0) {
                console.log("🔹 Cliente no encontrado, creando nuevo cliente...");
                db.query('INSERT INTO clientes (nombre, email, telefono, estado, ciudad) VALUES (?, ?, ?, ?, ?)',
                    [nombre, email, telefono, estado, ciudad],
                    (err, insertResult) => {
                        if (err) {
                            console.error("❌ Error creando cliente en la base de datos:", err);
                            return res.status(500).json({ message: "Error creando cliente." });
                        }
                        registrarVenta(insertResult.insertId);
                    });
            } else {
                console.log("✅ Cliente encontrado, procediendo con la compra...");
                registrarVenta(clienteResult[0].id);
            }
        });
    } catch (error) {
        console.error("❌ Error en el servidor al procesar la compra:", error);
        res.status(500).json({ message: error.message });
    }

    function registrarVenta(id_cliente) {
        db.query('INSERT INTO ventas (id_auto, id_cliente, fecha_venta, precio_final, enganche, plazo, pago_mensual) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_auto, id_cliente, fecha_venta, precio_final, enganche, plazo, pago_mensual],
            (err) => {
                if (err) {
                    console.error("❌ Error al registrar la compra en la base de datos:", err);
                    res.status(500).json({ message: "Error al procesar la compra." });
                } else {
                    console.log("✅ Compra registrada exitosamente.");
                    res.json({ success: true, message: "Compra realizada correctamente." });
                }
            }
        );
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
