// Test: console.log("Tudo certo");
const express = require("express");
const rotaUsuario = require("./rotas/usuario.rota");
const rotaPost = require("./rotas/posts.rota");
var expressLayouts = require('express-ejs-layouts');
const indexRoute = require("./rotas/index.rota"); 
const logger = require("./utils/logger");
const logMiddleware = require("./middleware/log.mid");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const helmet = require('helmet');

//Carregando o arquivo
const swaggerDocument = YAML.load('./api.yaml');

require("dotenv").config();

// App é o objeto responsável por tratar as requisições que o servidor recebe
// express() é uma função construtora para criar o servidor
const app = express();

//Configuração de segurança
app.use(helmet());

//Configurando rota swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// express.json() aplica ao objeto app a capacidade de utilizar/usar (use) jsons
app.use(express.json());

// Informa ao objeto que o motor de visualização (view engine) será renderizado pelo ejs
app.set("view engine", "ejs");

// Preparando o app para usar a função logMiddleware para printar as informações que nela forem determinadas
app.use(logMiddleware);

// Preparando o app para usar a biblioteca de layouts do express
app.use(expressLayouts);

// Configurando no objeto o caminho para buscar o layout a ser usado 
app.set("layout", "layouts/layout");

// Configurando caminho para arquivos estáticos públicos
app.use("/static", express.static("public"));

// Rotas que retornam um json, estão relacionadas à API, portanto foram alteradas para um path que especifica o caminho para a API:
app.use("/api/usuarios", rotaUsuario);
app.use("/api/posts", rotaPost);

// configurando rotas de visualização da aplicação
app.use("/", indexRoute);

// configurando a rota de teste da API
app.get("/api", (req, res) =>{
    // res.send("Hello world from Express!!!");
    res.json({msg:"Hello world from Express!!!"}); 
});

// Configurando exibição de mensagem de erro e código via json
app.use((error, req, res, next) => {
    const { statusCode, msg } = error
    res.status(statusCode).json({mgs: msg});
});

// Rotas que não serão mais necessárias nessa aula (11):
// app.get("/home", (req, res) => {
//     const number = Math.random();
//     res.render("pages/index", {variavel: number});
// }); 

// app.get("/cursos", (req, res) => {
//     const cursos = [{nome: "Programação Frontend", ch: 200},
//                     {nome: "Programação Backend", ch: 330},
//                     {nome: "Programação Concorrente", ch: 300},
//                     {nome: "Programação Distribuída", ch: 400}]
//     res.render("pages/cursos/index", {cursos: cursos});
// }); 

// app.get("/alunos", (req, res) => {
//     const alunos = [
//         {nome: "João Pedro"},
//         {nome: "Fernanda"},
//         {nome: "Francisco"}
//     ]
//     res.render("pages/alunos/index", {alunos: alunos});
// });

// Inicia o servidor na porta 8080 exibindo as msgs abaixo
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    // Antes utilizava o console.log agora se usa o logger:
    logger.info(`Iniciando no ambiente ${process.env.NODE_ENV}`);
    logger.info(`Servidor pronto na porta ${PORT}!`);
});
