// middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');

// Middleware to verify the JWT (Authentication)
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, users) => {
        if (err) return res.sendStatus(403); // Forbidden (token is invalid)
        req.user = users;
        next();
    });
};

// Middleware factory to check for specific roles (Authorization)
exports.authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: `Access denied. Requires ${role} role.` });
        }
        next();
    };
};
