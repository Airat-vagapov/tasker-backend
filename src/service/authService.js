const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authModel = require("../models/authModel");
const {
    jwtAccessSecret,
    jwtRefreshSecret,
    accessTokenTtl,
    refreshTokenTtlDays,
} = require("../config/env");

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

const validateUsername = (username) => {
    if (typeof username !== "string" || !USERNAME_REGEX.test(username)) {
        throw new Error("Username must be 3-30 chars and contain only letters, numbers, _, ., -");
    }
};

const validatePassword = (password) => {
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }
};

const validateRole = (role) => {
    if (role !== "user" && role !== "admin") {
        throw new Error("Role must be either 'user' or 'admin'");
    }
};

const validateName = (value, fieldLabel) => {
    if (typeof value !== "string" || value.trim().length < 1 || value.trim().length > 50) {
        throw new Error(`${fieldLabel} must be a non-empty string up to 50 characters`);
    }
};

const hashRefreshToken = (token) => {
    return crypto
        .createHmac("sha256", jwtRefreshSecret)
        .update(token)
        .digest("hex");
};

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user.id,
            username: user.username,
            role: user.role,
        },
        jwtAccessSecret,
        { expiresIn: accessTokenTtl }
    );
};

const getRefreshExpiry = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(refreshTokenTtlDays));
    return expiresAt;
};

const issueSession = async (user, userAgent, ip) => {
    const refreshToken = crypto.randomBytes(48).toString("hex");
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = getRefreshExpiry();

    await authModel.createSession(user.id, refreshTokenHash, expiresAt, userAgent, ip);

    return {
        accessToken: generateAccessToken(user),
        refreshToken,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        },
    };
};

const register = async ({ username, password, role = "user", firstName, lastName }) => {
    validateUsername(username);
    validatePassword(password);
    validateRole(role);
    validateName(firstName, "First name");
    validateName(lastName, "Last name");

    const existingUser = await authModel.findUserByUsername(username);
    if (existingUser) {
        const err = new Error("Username already exists");
        err.statusCode = 409;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const createdUser = await authModel.createUser(
        username,
        passwordHash,
        role,
        firstName.trim(),
        lastName.trim()
    );

    return {
        id: createdUser.id,
        username: createdUser.username,
        role: createdUser.role,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
    };
};

const login = async ({ username, password, userAgent, ip }) => {
    validateUsername(username);
    validatePassword(password);

    const user = await authModel.findUserByUsername(username);
    if (!user) {
        const err = new Error("Invalid credentials");
        err.statusCode = 401;
        throw err;
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
        const err = new Error("Invalid credentials");
        err.statusCode = 401;
        throw err;
    }

    return issueSession(user, userAgent, ip);
};

const refresh = async ({ refreshToken, userAgent, ip }) => {
    if (!refreshToken || typeof refreshToken !== "string") {
        const err = new Error("Refresh token is missing");
        err.statusCode = 401;
        throw err;
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session = await authModel.findValidSessionByHash(refreshTokenHash);

    if (!session) {
        const err = new Error("Invalid refresh token");
        err.statusCode = 401;
        throw err;
    }

    const user = await authModel.findUserById(session.user_id);
    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 401;
        throw err;
    }

    await authModel.revokeSession(session.id);

    return issueSession(user, userAgent, ip);
};

const logout = async ({ refreshToken }) => {
    if (!refreshToken || typeof refreshToken !== "string") {
        return;
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session = await authModel.findValidSessionByHash(refreshTokenHash);
    if (!session) {
        return;
    }

    await authModel.revokeSession(session.id);
};

module.exports = {
    register,
    login,
    refresh,
    logout,
};
