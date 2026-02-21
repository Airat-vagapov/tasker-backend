const { client } = require("../config/db");

const createUser = async (username, passwordHash, role = "user", firstName, lastName) => {
    const query = `
        INSERT INTO users (username, password_hash, role, first_name, last_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, role, first_name AS "firstName", last_name AS "lastName", created_at;
    `;
    const res = await client.query(query, [username, passwordHash, role, firstName, lastName]);
    return res.rows[0];
};

const findUserByUsername = async (username) => {
    const query = `
        SELECT id, username, password_hash, role
             , first_name AS "firstName"
             , last_name AS "lastName"
        FROM users
        WHERE username = $1
        LIMIT 1;
    `;
    const res = await client.query(query, [username]);
    return res.rows[0] || null;
};

const findUserById = async (id) => {
    const query = `
        SELECT id, username, role
             , first_name AS "firstName"
             , last_name AS "lastName"
        FROM users
        WHERE id = $1
        LIMIT 1;
    `;
    const res = await client.query(query, [id]);
    return res.rows[0] || null;
};

const createSession = async (userId, refreshTokenHash, expiresAt, userAgent = null, ip = null) => {
    const query = `
        INSERT INTO auth_sessions (user_id, refresh_token_hash, expires_at, user_agent, ip)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, expires_at;
    `;
    const res = await client.query(query, [userId, refreshTokenHash, expiresAt, userAgent, ip]);
    return res.rows[0];
};

const findValidSessionByHash = async (refreshTokenHash) => {
    const query = `
        SELECT id, user_id, expires_at, revoked_at
        FROM auth_sessions
        WHERE refresh_token_hash = $1
          AND revoked_at IS NULL
          AND expires_at > NOW()
        LIMIT 1;
    `;
    const res = await client.query(query, [refreshTokenHash]);
    return res.rows[0] || null;
};

const revokeSession = async (sessionId) => {
    await client.query(
        `UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL;`,
        [sessionId]
    );
};

const revokeAllUserSessions = async (userId) => {
    await client.query(
        `UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL;`,
        [userId]
    );
};

module.exports = {
    createUser,
    findUserByUsername,
    findUserById,
    createSession,
    findValidSessionByHash,
    revokeSession,
    revokeAllUserSessions,
};
