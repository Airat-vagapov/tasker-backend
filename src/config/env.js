require('dotenv').config()

module.exports = {
    port: process.env.PORT,
    dbUser: process.env.DB_USER,
    dbHost: process.env.DB_HOST,
    database: process.env.DB_NAME,
    dbPassword: 'admin',
    dbPort: process.env.DB_PORT,
}