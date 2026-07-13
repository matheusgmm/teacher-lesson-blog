jest.mock('../src/config/prisma', () => ({
  prisma: {
    user: {},
    post: {},
    authToken: {},
    $disconnect: jest.fn(),
  },
}));
