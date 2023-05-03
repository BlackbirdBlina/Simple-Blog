// Importando funcionalidades desejadas para esta aplicação da biblioteca "Winston" 
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

// Configurando exbição de informação
const myFormat = printf(({ level, message, label, timestamp }) => {
    // Para utilizar o label acrescentar no return [${label}]
    return `${timestamp} [${level}] ${message}`;
});

// Criando o objeto responsável pelo registro de informações
const logger = createLogger({
  format: combine(
    // label({ label: 'right meow!' }),
    format.splat(),
    timestamp(),
    myFormat
  ),
  // Define qual o nível do log e o caminho para salvá-lo
  transports: [new transports.Console({
    level: "debug"
  }), new transports.File({
    filename: "logs/app-log.log",
    level: "debug" 
})]
});

module.exports = logger