const { isAdmin, isUser, authorizeRoles } = require('../../src/middlewares/role.middleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('role.middleware', () => {
  it('isAdmin should call next when role is ADMIN', () => {
    const req = { user: { role: 'ADMIN' } };
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('isAdmin should respond 403 when role is USER', () => {
    const req = { user: { role: 'USER' } };
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'FORBIDDEN' }),
    );
  });

  it('isAdmin should respond 401 when req.user is missing', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('isUser should allow USER and ADMIN', () => {
    const nextUser = jest.fn();
    const nextAdmin = jest.fn();

    isUser({ user: { role: 'USER' } }, mockRes(), nextUser);
    isUser({ user: { role: 'ADMIN' } }, mockRes(), nextAdmin);

    expect(nextUser).toHaveBeenCalled();
    expect(nextAdmin).toHaveBeenCalled();
  });

  it('authorizeRoles should accept a custom role list', () => {
    const onlyAdmin = authorizeRoles('ADMIN');
    const next = jest.fn();
    const res = mockRes();

    onlyAdmin({ user: { role: 'USER' } }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
