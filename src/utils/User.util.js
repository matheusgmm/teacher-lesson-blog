
function sanitizeUser(user) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

module.exports = {
  sanitizeUser,
};
