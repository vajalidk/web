const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const Joi = require('joi');
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

// Validación de datos con Joi
const schemaUsuario = Joi.object({
    correo: Joi.string().email().required(),
    clave: Joi.string().min(4).required()
});

const schemaProducto = Joi.object({
    nombre: Joi.string().min(2).required(),
    descripcion: Joi.string().min(5).required(),
    precio: Joi.number().positive().required(),
    cantidad: Joi.number().integer().positive().required()
});

// Rutas
app.post('/login', async (req, res) => {
    const { error } = schemaUsuario.validate(req.body);
    if (error) return res.status(400).json({ mensaje: error.details[0].message });

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
    const { error } = schemaProducto.validate(req.body);
    if (error) return res.status(400).json({ mensaje: error.details[0].message });

    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
});

app.get('/productos', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(403).json({ mensaje: '⚠️ No autorizado' });
    }
    const productos = await Producto.find().limit(20);
    res.json(productos);
});

// Servir página HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pagina.html');
});

// Iniciar servidor
app.listen(process.env.PORT, () => console.log(`🚀 Servidor en http://localhost:${process.env.PORT}`));
