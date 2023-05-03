const express = require("express");
const router = express.Router();
const usuarioMid = require("../middleware/validarUsuario.middleware");
const { Usuario } = require("../db/models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", usuarioMid);
router.put("/", usuarioMid);

router.get("/", async (req, res) =>{
    const usuarios = await Usuario.findAll();
    const resultado = usuarios.map(user => prepararResultado(user.dataValues));
    res.json({usuarios: resultado});
});

router.get("/:id", async (req, res) => {
    const usuario = await Usuario.findByPk(req.params.id);
    if (usuario) {
        res.json({usuario: prepararResultado(usuario.dataValues)});
    } else {
        res.status(400).json({msg: "Usuario não encontrado!"});
    }
    
});

router.post("/", async (req, res) => {
    // salt + senha
    const senha = req.body.senha
    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);
    const usuario = {email: req.body.email, senha: senhaCriptografada}
    console.log(`salt: ${salt}`);
    console.log(`Senha criptografada: ${senhaCriptografada}`);
    const usuarioObj = await Usuario.create(usuario);
    res.json({msg: `Usuario ${usuarioObj.id} adicionado com sucesso!`})
});

router.post("/login", async (req, res) => {

    const email = req.body.email
    const senha = req.body.senha

    const usuario = await Usuario.findOne({
        where: {
            email: email
        }
    });

    if (usuario && await bcrypt.compare(senha, usuario.senha)){
        
        const payload = {
            sub: usuario.id, 
            iss: "imd-backend", 
            aud: "imd-frontend", 
            email: usuario.email
        };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "10m"});
        res.json({accessToken: token});
        // console.log("Sucesso");
    } else {
        res.status(403).json({msg: "Usuário ou senha inválidos."})
        // console.log("Falha ao autenticar. Usuário ou senha inválidos.");
    }

});
    // VALIDAÇÃO se fosse feita diretamente na requisição:
    // const validate = ajv.compile(usuarioSchema);
    // const valid = validate(usuario);

    // if (valid){
    //     const idUsuario = uuidv4();
    //     usuario.id = idUsuario
    //     usuarios[idUsuario] = usuario
    //     res.json({msg: "Usuário adicionado com sucesso!"});
    // } else {
    //     res.status(400).json({msg: "Dados inválidos", erros: validate.errors});
    // }
    // FIMVALIDAÇÃO agora está sendo feita no middleware


router.put("/", async (req, res) =>{
    const id = req.query.id
    const usuario = await Usuario.findByPk(id);
    if(usuario){
        usuario.email = req.body.email
        usuario.senha = req.body.senha
        await usuario.save();
        res.json({msg: `Usuário ${id} atualizado com sucesso`});
    } else {
        res.status(400).json({msg: `Usuário ${id} não encontrado!`});
    }

});

router.delete("/", async (req, res) =>{
    const id = req.query.id
    const usuario = await Usuario.findByPk(id);
    if(usuario){
        await usuario.destroy();
        res.json({msg: `Usuário ${id} deletado com sucesso!`})
    } else {
        res.status(400).json({msg: `Usuário ${id} não encontrado!`});
    }
});

function prepararResultado(usuario){
    const result = Object.assign({}, usuario)

    if (result.createdAt) delete result.createdAt
    if (result.updatedAt) delete result.updatedAt
    if (result.senha) delete result.senha

    return result
}

module.exports = router
