// Importando logger
const logger = require("../utils/logger");

// Função de exibição das informações a serem logadas/registradas
function logar(req, res, next){
    // %s é utilizado para interpolação de strings de forma respectiva 
    logger.debug("Requisição %s na rota %s", req.method, req.path);
    next();
}

// Exportando a função logar
module.exports = logar