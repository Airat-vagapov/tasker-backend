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
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

const connectDB = async () => {
    await client.connect();

    const result = await client.query("SELECT NOW()");
    console.log("Connected to PostgreSQL at:", result.rows[0].now);
    createTables();
};

const createTables = async () => {
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
            due_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 week'),
            status_id INTEGER REFERENCES statuses(id) DEFAULT 1
        );`)
        console.log('Таблица TASKS успешно создана или уже есть существующая');

        await client.query(`CREATE TABLE IF NOT EXISTS statuses (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL
        );`)
        console.log('Таблица STATUSES успешно создана или уже есть существующая');
    }
    catch (err) {
        console.error('Ошибка при создании таблицы', err)
    }
}

module.exports = { client, connectDB };
