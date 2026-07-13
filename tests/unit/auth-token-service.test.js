jest.mock('../../src/repositories/auth-token-repository');
jest.mock('../../src/utils/Token.util', () => ({
  verifyToken: jest.fn(),
}));

const authTokenRepository = require('../../src/repositories/auth-token-repository');
const { verifyToken } = require('../../src/utils/Token.util');
const authTokenService = require('../../src/services/auth-token-service');
const { CodedApiError } = require('../../src/utils/CodedApiError.util');

describe('auth-token-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteToken', () => {
    it('should throw TOKEN_EXPIRED and remove an expired token', async () => {
      const expiredAt = new Date(Date.now() - 60_000);
      verifyToken.mockReturnValue({ owner_id: 1, role: 'USER' });
      authTokenRepository.findToken.mockResolvedValue({
        token: 'expired-token',
        expires_at: expiredAt,
        owner_id: 1,
      });
      authTokenRepository.deleteAuthToken.mockResolvedValue({ token: 'expired-token' });

      await expect(authTokenService.deleteToken('expired-token')).rejects.toMatchObject({
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
      });

      expect(authTokenRepository.deleteAuthToken).toHaveBeenCalledWith('expired-token');
    });

    it('should delete a valid non-expired token', async () => {
      const future = new Date(Date.now() + 60_000);
      verifyToken.mockReturnValue({ owner_id: 1, role: 'USER' });
      authTokenRepository.findToken.mockResolvedValue({
        token: 'valid-token',
        expires_at: future,
        owner_id: 1,
      });
      authTokenRepository.deleteAuthToken.mockResolvedValue({ token: 'valid-token' });

      await authTokenService.deleteToken('valid-token');

      expect(authTokenRepository.deleteAuthToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw when token is missing', async () => {
      await expect(authTokenService.deleteToken()).rejects.toBeInstanceOf(CodedApiError);
      await expect(authTokenService.deleteToken('')).rejects.toMatchObject({
        code: 'TOKEN_REQUIRED',
      });
    });
  });
});
