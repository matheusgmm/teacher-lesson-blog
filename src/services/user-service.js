const userRepository = require('../repositories/user-repository');
const { CodedApiError } = require('../utils/CodedApiError.util');

async function findUserByEmail(email) {
  if (!email) {
    throw new CodedApiError("EMAIL_REQUIRED", 'Email is required', 400);
  }

  return userRepository.findByEmail(email);
}

async function createUser(data) {
  if (!data.name || !data.email || !data.password) {
    throw new CodedApiError("NAME_EMAIL_PASSWORD_REQUIRED", 'Name, email and password are required', 400);
  }

  return userRepository.createUser(data);
}

module.exports = { findUserByEmail, createUser };
