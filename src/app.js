const express = require("express");
const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require('./config/swagger')
const { startServer } = require("./server");

const app = express();


startServer(app);


module.exports = app;
