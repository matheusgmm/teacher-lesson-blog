jest.mock('../../src/services/auth-token-service');
jest.mock('../../src/utils/Token.util', () => ({
  verifyToken: jest.fn(),
}));

const { authenticateToken } = require('../../src/middlewares/auth-middleware');
const authTokenService = require('../../src/services/auth-token-service');
const { verifyToken } = require('../../src/utils/Token.util');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('auth-middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject requests without a token', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject an expired stored token', async () => {
    const expiredAt = new Date(Date.now() - 60_000);
    authTokenService.findToken.mockResolvedValue({
      token: 'expired-token',
      expires_at: expiredAt,
      owner_id: 1,
    });

    const req = { headers: { authorization: 'Bearer expired-token' } };
    const res = mockRes();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(authTokenService.findToken).toHaveBeenCalledWith('expired-token');
    expect(verifyToken).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, message: 'Unauthorized' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject when the token is not found in storage', async () => {
    authTokenService.findToken.mockResolvedValue(null);

    const req = { headers: { authorization: 'Bearer missing-token' } };
    const res = mockRes();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when the token is valid and not expired', async () => {
    const future = new Date(Date.now() + 60_000);
    authTokenService.findToken.mockResolvedValue({
      token: 'valid-token',
      expires_at: future,
      owner_id: 1,
    });
    verifyToken.mockReturnValue({ owner_id: 1, role: 'ADMIN' });

    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = mockRes();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(req.user).toEqual({ owner_id: 1, role: 'ADMIN' });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
