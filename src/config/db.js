const {
    dbUrl,
    dbBootstrap,
    dbSsl,
} = require("../config/env");
const { Client } = require("pg");

const client = new Client({
    connectionString: dbUrl,
    connectionTimeoutMillis: 7000,
    query_timeout: 10000,
    statement_timeout: 10000,
    ssl: dbSsl ? { rejectUnauthorized: false } : false,
});

const connectDB = async () => {
    await client.connect();

    const result = await client.query("SELECT NOW()");
    console.log("Connected to PostgreSQL at:", result.rows[0].now);

    if (dbBootstrap) {
        await createTables();
    } else {
        console.log("DB bootstrap is disabled (set DB_BOOTSTRAP=true to enable)");
    }
};

const createTables = async () => {
    try {
        // const bootstrapTimeoutMs = 60000;

        await client.query({
            text: `CREATE TABLE IF NOT EXISTS statuses (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL
        );`,
            // query_timeout: bootstrapTimeoutMs,
        });
        console.log('Таблица STATUSES успешно создана или уже есть существующая');

        await client.query({
            text: `
                INSERT INTO statuses (name)
                VALUES ('todo'), ('in_progress'), ('done')
                ON CONFLICT (name) DO NOTHING;
            `,
        });

        await client.query({
            text: `
                SELECT setval(
                    pg_get_serial_sequence('statuses', 'id'),
                    COALESCE((SELECT MAX(id) FROM statuses), 1),
                    true
                );
            `,
        });
        console.log('Базовые статусы добавлены или уже существуют');

        await client.query({
            text: `CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            author TEXT DEFAULT 'admin',
            priority VARCHAR(50) NOT NULL DEFAULT 'medium',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            due_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 week'),
            status_id INTEGER REFERENCES statuses(id) DEFAULT 1
        );`,
            // query_timeout: bootstrapTimeoutMs,
        });
        console.log('Таблица TASKS успешно создана или уже есть существующая');

        await client.query({
            text: `CREATE INDEX IF NOT EXISTS idx_tasks_status_id ON tasks(status_id);`,
            // query_timeout: bootstrapTimeoutMs,
        });
        await client.query({
            text: `CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);`,
            // query_timeout: bootstrapTimeoutMs,
        });
        await client.query({
            text: `CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);`,
            // query_timeout: bootstrapTimeoutMs,
        });
        console.log('Индексы таблицы TASKS созданы или уже существуют');

        
    }
    catch (err) {
        console.error('Ошибка при создании таблицы', err)
    }
}

module.exports = { client, connectDB };
