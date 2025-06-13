
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User; 

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
          
            token = req.headers.authorization.split(' ')[1];

          
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

        
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password_hash'] }
            });

            if (!req.user) {
                return res.status(401).json({ error: 'Not authorized, user not found' });
            }

            next(); 
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Not authorized, token expired' });
            }
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
};

const authorize = (roles = []) => {
    // roles can be a single role string (e.g., 'admin') or an array of roles (e.g., ['farmer', 'expert'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ error: 'Access denied, user not authenticated' });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Access denied, role "${req.user.role}" not authorized for this action` });
        }
        next();
    };
};

module.exports = { protect, authorize };