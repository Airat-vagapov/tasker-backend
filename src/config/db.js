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
                SELECT setval(
                    pg_get_serial_sequence('statuses', 'id'),
                    COALESCE((SELECT MAX(id) FROM statuses), 1),
                    true
                );
            `,
        });

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
            text: `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(30) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`,
        });
        console.log('Таблица USERS успешно создана или уже есть существующая');

        await client.query({
            text: `ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(50);`,
        });
        await client.query({
            text: `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(50);`,
        });

        await client.query({
            text: `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`,
        });

        await client.query({
            text: `CREATE TABLE IF NOT EXISTS auth_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            refresh_token_hash TEXT NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            revoked_at TIMESTAMP WITH TIME ZONE,
            user_agent TEXT,
            ip VARCHAR(64)
        );`,
        });
        console.log('Таблица AUTH_SESSIONS успешно создана или уже есть существующая');

        await client.query({
            text: `CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);`,
        });
        await client.query({
            text: `CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);`,
        });

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
