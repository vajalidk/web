const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'clave_simple',
    resave: false,
    saveUninitialized: true
}));

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error:', err));

// Modelos
const Usuario = mongoose.model('Usuario', new mongoose.Schema({
    nombre: String,
    correo: String,
    clave: String
}));

const Producto = mongoose.model('Producto', new mongoose.Schema({
    nombre: String,
    descripcion: String,
    precio: Number,
    cantidad: Number
}));

// Rutas
app.post('/login', async (req, res) => {
    const { correo, clave } = req.body;
    const usuario = await Usuario.findOne({ correo });
    if (!usuario || usuario.clave !== clave) {
        return res.status(401).json({ mensaje: '⚠️ Credenciales incorrectas' });
    }
    req.session.usuario = usuario;
    res.json({ mensaje: '✅ Inicio de sesión exitoso' });
});

app.post('/productos', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(403).json({ mensaje: '⚠️ No autorizado' });
    }
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
});

app.get('/productos', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(403).json({ mensaje: '⚠️ No autorizado' });
    }
    const productos = await Producto.find();
    res.json(productos);
});

// Servir página HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pagina.html');
});

// Iniciar servidor
app.listen(process.env.PORT, () => console.log(`🚀 Servidor en http://localhost:${process.env.PORT}`));
