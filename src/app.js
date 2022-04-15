const express = require('express');
const mongoose = require('mongoose');
//Model
const user = require('./models/User');
const bcrypt = require('bcrypt');//criptografia hash
const jwt = require('jsonwebtoken'); //token auth

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//conexão db
mongoose.connect("mongodb://127.0.0.1:27017/sistemaimg", {
   useNewUrlParser: true,
   useUnifiedTopology: true
}).then(() => {
   console.log("Conected.");
}).catch(err => console.log(err));

//model
const User = mongoose.model("User", user);

app.get('/',(req,res)=>{
    res.json({})
});


//create new user
app.post("/user",(req,res) => {
    if(req.body.name == '' || req.body.email == "" || req.body.password == ""){
        res.sendStatus(400) //bad request
        return;
     }
    
    try{
        const user = await User.findOne({ "email": req.body.email }); //evitando e-mails repetidos
        if(user != undefined){
           res.status(400).json({ error: "E-mail já cadastrado." });
           return; 
        }
        
        const password = req.body.password; 
        const salt = await bcrypt.genSalt(10); //hash
        const hash = await bcrypt.hash(password, salt); //salt e password p/ hash
  
        const newUser = new User({ name: req.body.name, email: req.body.email, password: hash });
        await newUser.save();
     
        res.status(200).json({ email: req.body.email });
     }catch(err){
        console.log(err)
        res.sendStatus(500);
     }
});

//autenticação de user
app.post('/auth', async (req, res) => {
    const { email, password } = req.body;
 
    const user = await User.findOne({ "email": email });
 
    if(user == undefined){
       res.status(403).json({
          errors: {
             email: "E-mail não cadastrado."
          }
       });
       return;
    }
 
    //comparar senha do db com senha digitada
    const isPasswordRight = await bcrypt.compare(password, user.password);
 
    if(!isPasswordRight){
       res.status(403).json({
          errors: {
             password: "Senha incorreta."
          }
       });
       return;
    }
 
    //acesso ao token
    jwt.sign({ email, name: user.name, id: user._id }, secret, { expiresIn: '48h' }, (err, token) => {
       if(err){
          res.sendStatus(500); // Internal Server Error
          console.log(err);
       }else{
          res.status(200).json({ token });
       }
    });
 
 });
 

//
app.delete('/user/email', async (req, res) => {
    await User.deleteOne({ "email": req.params.email });
    res.sendStatus(200);
 }); 

module.exports = app;

