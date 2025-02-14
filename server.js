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
            res.status(500).json({ message: "Error al obtener compras." });
        } else {
            res.json(results);
        }
    });
});

// Registrar compra
app.post('/realizar-compra', (req, res) => {
    try {
        let { id_auto, nombre, apellido_paterno, apellido_materno, email, telefono, estado, ciudad, fecha_venta, precio_final, enganche, plazo, pago_mensual } = req.body;

        if (!fecha_venta) {
            const hoy = new Date();
            fecha_venta = hoy.toISOString().split('T')[0];
        }

        if (!id_auto || !nombre || !email || !telefono || !estado || !ciudad || !fecha_venta || !precio_final || !enganche || !plazo || !pago_mensual) {
            return res.status(400).json({ message: "❌ Faltan datos obligatorios para procesar la compra." });
        }

        db.query('SELECT id FROM clientes WHERE email = ?', [email], (err, clienteResult) => {
            if (err) {
                return res.status(500).json({ message: "Error al verificar cliente." });
            }

            if (clienteResult.length === 0) {
                db.query(
                    'INSERT INTO clientes (nombre, apellido_paterno, apellido_materno, email, telefono, estado, ciudad) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [nombre, apellido_paterno || null, apellido_materno || null, email, telefono, estado, ciudad],
                    (err, insertResult) => {
                        if (err) {
                            return res.status(500).json({ message: "Error creando cliente." });
                        }
                        registrarVenta(insertResult.insertId);
                    }
                );
            } else {
                registrarVenta(clienteResult[0].id);
            }
        });

        function registrarVenta(id_cliente) {
            db.query(
                'INSERT INTO ventas (id_auto, id_cliente, fecha_venta, precio_final, enganche, plazo, pago_mensual) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id_auto, id_cliente, fecha_venta, precio_final, enganche, plazo, pago_mensual],
                (err) => {
                    if (err) {
                        return res.status(500).json({ message: "Error al procesar la compra." });
                    } else {
                        res.json({ success: true, message: "Compra realizada correctamente." });
                    }
                }
            );
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/api/eliminar/clientes/:id', (req, res) => {
    const clienteId = req.params.id;
    
    if (!clienteId) {
        return res.status(400).json({ message: "ID de cliente inválido." });
    }

    db.query('DELETE FROM clientes WHERE id = ?', [clienteId], (err, result) => {
        if (err) {
            console.error("❌ Error al eliminar cliente:", err);
            return res.status(500).json({ message: "Error al eliminar cliente." });
        }

        console.log(`✅ Cliente con ID ${clienteId} eliminado.`);
        res.json({ success: true, message: "Cliente y sus compras eliminados correctamente." });
    });
});

app.put('/api/editar/clientes/:id', (req, res) => {
    const clienteId = req.params.id;
    const nuevosDatos = req.body;

    let campos = Object.keys(nuevosDatos).map(key => `${key} = ?`).join(', ');
    let valores = Object.values(nuevosDatos);

    // Actualizamos la información del cliente
    db.query(`UPDATE clientes SET ${campos} WHERE id = ?`, [...valores, clienteId], (err) => {
        if (err) {
            console.error("❌ Error al actualizar cliente:", err);
            return res.status(500).json({ message: "Error al actualizar cliente." });
        }
        res.json({ success: true, message: "✅ Cliente actualizado correctamente." });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
