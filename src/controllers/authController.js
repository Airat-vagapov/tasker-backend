const authService = require("../service/authService");
const { cookieSecure, cookieDomain, refreshTokenTtlDays } = require("../config/env");

const REFRESH_COOKIE_NAME = "refreshToken";

const buildRefreshCookieOptions = () => {
    const options = {
        httpOnly: true,
        sameSite: "lax",
        secure: cookieSecure,
        path: "/",
        maxAge: Number(refreshTokenTtlDays) * 24 * 60 * 60 * 1000,
    };

    if (cookieDomain) {
        options.domain = cookieDomain;
    }

    return options;
};

const setRefreshCookie = (res, refreshToken) => {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, buildRefreshCookieOptions());
};

const clearRefreshCookie = (res) => {
    const options = {
        httpOnly: true,
        sameSite: "lax",
        secure: cookieSecure,
        path: "/",
    };

    if (cookieDomain) {
        options.domain = cookieDomain;
    }

    res.clearCookie(REFRESH_COOKIE_NAME, options);
};

const getClientIp = (req) => {
    return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || null;
};

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body || {});
        res.status(201).json({ user });
    } catch (err) {
        const statusCode = err.statusCode || 400;
        res.status(statusCode).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { accessToken, refreshToken, user } = await authService.login({
            ...(req.body || {}),
            userAgent: req.headers["user-agent"] || null,
            ip: getClientIp(req),
        });

        setRefreshCookie(res, refreshToken);
        res.status(200).json({ accessToken, user });
    } catch (err) {
        const statusCode = err.statusCode || 400;
        res.status(statusCode).json({ message: err.message });
    }
};

const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
        const { accessToken, refreshToken: nextRefreshToken } = await authService.refresh({
            refreshToken,
            userAgent: req.headers["user-agent"] || null,
            ip: getClientIp(req),
        });

        setRefreshCookie(res, nextRefreshToken);
        res.status(200).json({ accessToken });
    } catch (err) {
        const statusCode = err.statusCode || 401;
        clearRefreshCookie(res);
        res.status(statusCode).json({ message: err.message });
    }
};

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
        await authService.logout({ refreshToken });
        clearRefreshCookie(res);
        res.status(200).json({ ok: true });
    } catch (err) {
        clearRefreshCookie(res);
        res.status(200).json({ ok: true });
    }
};

const me = async (req, res) => {
    res.status(200).json(req.user);
};

module.exports = {
    register,
    login,
    refresh,
    logout,
    me,
};
