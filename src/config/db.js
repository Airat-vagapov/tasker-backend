const { dbUser,dbHost, database, dbPassword, dbPort } = require('../config/env')
const { Client } = require("pg");

const client = new Client({
    user: dbUser,
    host: dbHost,
    database: database,
    password: dbPassword,
    port: dbPort,
});

module.exports = client;
