jest.mock('../../src/services/user-service');
jest.mock('../../src/services/auth-token-service');
jest.mock('../../src/utils/Token.util', () => ({
  getUserByToken: jest.fn(),
  verifyToken: jest.fn(),
  generateToken: jest.fn(),
  generateRememberMeToken: jest.fn(),
  getExpirationDate: jest.fn(),
  getUserRoleByToken: jest.fn(),
  decodeToken: jest.fn(),
}));
jest.mock('../../src/middlewares/auth-middleware', () => ({
  authenticateToken: (req, res, next) => {
    const raw = req.headers['x-test-role'];
    req.user = {
      owner_id: Number(req.headers['x-test-owner'] || 1),
      role: raw || 'ADMIN',
    };
    next();
  },
}));

const request = require('supertest');
const app = require('../../src/app');
const userService = require('../../src/services/user-service');
const { getUserByToken } = require('../../src/utils/Token.util');

describe('User endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/user/', () => {
    it('should list users with pagination', async () => {
      userService.getAllActiveUsers.mockResolvedValue({
        data: [
          {
            id: 1,
            name: 'Ana',
            email: 'ana@mail.com',
            role: 'USER',
            created_at: new Date('2026-01-01'),
            updated_at: new Date('2026-01-01'),
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/user')
        .set('Authorization', 'Bearer fake-token')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toMatchObject({ name: 'Ana', email: 'ana@mail.com' });
      expect(res.body.meta.total).toBe(1);
    });
  });

  describe('GET /api/user/:id', () => {
    it('should fetch a user by id', async () => {
      userService.getUserById.mockResolvedValue({
        id: 3,
        name: 'Bob',
        email: 'bob@mail.com',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const res = await request(app)
        .get('/api/user/3')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ id: 3, name: 'Bob' });
      expect(userService.getUserById).toHaveBeenCalledWith('3');
    });
  });

  describe('PATCH /api/user/', () => {
    it('should update the authenticated user', async () => {
      getUserByToken.mockResolvedValue({ id: 1, role: 'USER', name: 'Me' });
      userService.updateUser.mockResolvedValue({
        id: 1,
        name: 'Me Updated',
        email: 'me@mail.com',
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const res = await request(app)
        .patch('/api/user')
        .set('Authorization', 'Bearer fake-token')
        .set('x-test-role', 'USER')
        .send({ name: 'Me Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Me Updated');
      expect(userService.updateUser).toHaveBeenCalledWith(
        1,
        { name: 'Me Updated' },
        expect.objectContaining({ id: 1 }),
      );
    });
  });

  describe('DELETE /api/user/:id', () => {
    it('should allow an admin to delete another user', async () => {
      getUserByToken.mockResolvedValue({ id: 1, role: 'ADMIN' });
      userService.deleteUser.mockResolvedValue({ id: 3 });

      const res = await request(app)
        .delete('/api/user/3')
        .set('Authorization', 'Bearer fake-token')
        .set('x-test-role', 'ADMIN');

      expect(res.status).toBe(200);
      expect(userService.deleteUser).toHaveBeenCalledWith(
        '3',
        expect.objectContaining({ role: 'ADMIN' }),
      );
    });

    it('should block USER on delete (isAdmin middleware)', async () => {
      const res = await request(app)
        .delete('/api/user/3')
        .set('Authorization', 'Bearer fake-token')
        .set('x-test-role', 'USER');

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
      expect(userService.deleteUser).not.toHaveBeenCalled();
    });
  });
});
