const { verifyToken } = require('../utils/Token.util');

function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }
}

module.exports = { authenticateToken };