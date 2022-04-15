const mongoose = require('mongoose');

//iniciando conexao db
const User = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

module.exports = User;