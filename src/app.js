const express = require("express");
const { startServer } = require("./server");

const app = express();

startServer(app);

// app.get("/", (req, res) => {
//     res.status(200);
//     res.send("test my simple API");
// });

module.exports = app;
