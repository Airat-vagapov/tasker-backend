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
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
    refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7),
    cookieDomain: process.env.COOKIE_DOMAIN,
    cookieSecure: process.env.COOKIE_SECURE === "true",
}
