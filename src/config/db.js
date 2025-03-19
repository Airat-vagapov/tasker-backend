const {
    dbUser,
    dbHost,
    database,
    dbPassword,
    dbPort,
} = require("../config/env");
const { Client } = require("pg");

const client = new Client({
    user: dbUser,
    host: dbHost,
    database: database,
    password: dbPassword,
    port: dbPort,
});

const connectDB = async () => {
    await client.connect();
    console.log("Connected to PostgreSQL");

    const result = await client.query("SELECT NOW()");
    console.log("Connected to PostgreSQL at:", result.rows[0].now);
};

module.exports = { client, connectDB };
