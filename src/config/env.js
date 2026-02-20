require('dotenv').config()

module.exports = {
    dbUrl: process.env.DB_URL,
    port: process.env.PORT,
    dbBootstrap: process.env.DB_BOOTSTRAP === 'true',
    dbSsl: process.env.DB_SSL !== 'false',
    dbUser: process.env.DB_USER,
    dbHost: process.env.DB_HOST,
    database: process.env.DB_NAME,
    // dbPassword: 'admin',
    dbPassword: process.env.DB_PASSWORD,
    dbPort: process.env.DB_PORT,
}
