const jwt = require('jsonwebtoken');

function generateToken(ownerId, role) {
  return jwt.sign({ ownerId, role }, process.env.JWT_SECRET,  { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function decodeToken(token) {
  return jwt.decode(token);
}

function getUserRoleByToken(token) {
    return decodeToken(token).role;
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  getUserRoleByToken,
};
