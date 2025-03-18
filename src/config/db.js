const { Client } = require("pg");

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: 'admin',
    port: process.env.DB_PORT,
});

module.exports = client;
