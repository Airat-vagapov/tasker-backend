const {
    dbUser,
    dbHost,
    database,
    dbPassword,
    dbPort,
    dbUrl,
} = require("../config/env");
const { Client } = require("pg");

const client = new Client({
    // user: dbUser,
    // host: dbHost,
    // database: database,
    // password: dbPassword,
    // port: dbPort,
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

const connectDB = async () => {
    await client.connect();

    const result = await client.query("SELECT NOW()");
    console.log("Connected to PostgreSQL at:", result.rows[0].now);
    createTable();
};

const createTable = async () => {
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            author TEXT DEFAULT 'admin',
            status VARCHAR(50) NOT NULL DEFAULT 'new',
            priority VARCHAR(50) NOT NULL DEFAULT 'medium',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            due_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 week')
        );`)
        console.log('Таблица успешно создана или уже есть существующая');
    }
    catch (err) {
        console.error('Ошибка при создании таблицы', err)
    }
}

module.exports = { client, connectDB };
