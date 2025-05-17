const express = require("express");
const { startServer } = require("./server");

const app = express();

startServer(app);

module.exports = app;
