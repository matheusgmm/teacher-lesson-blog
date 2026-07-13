/**
 * HTTP endpoint tests with Supertest.
 * Services and auth are mocked so tests do not depend on a real DB/JWT.
 */

jest.mock('../../src/services/user-service');
jest.mock('../../src/services/auth-token-service');
jest.mock('../../src/utils/Token.util', () => ({
  ...jest.requireActual('../../src/utils/Token.util'),
  getUserByToken: jest.fn(),
  verifyToken: jest.fn(),
}));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const userService = require('../../src/services/user-service');
const authTokenService = require('../../src/services/auth-token-service');
const { getUserByToken, verifyToken } = require('../../src/utils/Token.util');

describe('POST /api/auth/register', () => {
  it('should register a public user and return 201', async () => {
    userService.createUser.mockResolvedValue({
      id: 1,
      name: 'John',
      email: 'john@mail.com',
      role: 'USER',
      password: 'hash',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@mail.com', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');
    expect(res.body.data).toMatchObject({
      id: 1,
      name: 'John',
      email: 'john@mail.com',
      role: 'USER',
    });
    expect(res.body.data).not.toHaveProperty('password');
    expect(userService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'john@mail.com' }),
      null,
    );
  });

  it('should propagate duplicate email error', async () => {
    const { CodedApiError } = require('../../src/utils/CodedApiError.util');
    userService.createUser.mockRejectedValue(
      new CodedApiError('EMAIL_ALREADY_EXISTS', 'Email already exists', 400),
    );

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@mail.com', password: '123456' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('EMAIL_ALREADY_EXISTS');
  });
});

describe('POST /api/auth/login', () => {
  it('should authenticate and return a token', async () => {
    const password = '123456';
    const hash = await bcrypt.hash(password, 10);

    userService.findUserByEmail.mockResolvedValue({
      id: 1,
      name: 'John',
      email: 'john@mail.com',
      role: 'USER',
      password: hash,
      created_at: new Date(),
      updated_at: new Date(),
    });
    authTokenService.createToken.mockResolvedValue({ token: 'jwt-fake' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@mail.com', password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBe('jwt-fake');
    expect(res.body.data.user.email).toBe('john@mail.com');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should return 401 with an invalid password', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    userService.findUserByEmail.mockResolvedValue({
      id: 1,
      email: 'john@mail.com',
      password: hash,
      role: 'USER',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@mail.com', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('GET /status', () => {
  it('should return API status', async () => {
    const res = await request(app).get('/status');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Running');
  });
});

describe('POST /api/auth/logout', () => {
  it('should return 401 when the token is expired', async () => {
    const { CodedApiError } = require('../../src/utils/CodedApiError.util');
    authTokenService.deleteToken.mockRejectedValue(
      new CodedApiError('TOKEN_EXPIRED', 'Token expired', 401),
    );

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer expired-token');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
    expect(authTokenService.deleteToken).toHaveBeenCalledWith('expired-token');
  });
});

afterEach(() => {
  getUserByToken.mockReset();
  verifyToken.mockReset();
});
