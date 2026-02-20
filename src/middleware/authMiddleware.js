const jwt = require("jsonwebtoken");
const { jwtAccessSecret } = require("../config/env");

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.slice(7);

    try {
        const payload = jwt.verify(token, jwtAccessSecret);
        req.user = {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
        };
        return next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
};

module.exports = { authenticate };
