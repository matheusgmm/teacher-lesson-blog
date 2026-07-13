# Tests

## Scripts

```bash
npm test              # run all tests once
npm run test:watch    # re-run on file changes
npm run test:coverage # run tests and generate a coverage report
```

## Structure

```
tests/
  unit/          → isolated business rules (services, helpers, middleware)
  endpoints/     → HTTP layer with Supertest (routes/controllers), mocked services
  setup.js       → shared mocks (e.g. Prisma client)
```

## Concepts

- **Unit test**: exercises one function without HTTP/DB. Dependencies are mocked.
- **Endpoint test**: boots Express in-memory (`supertest`) and asserts status/body.
- **Mock**: fake module replacement (`jest.mock`) so you control return values.
- **Coverage**: percentage of source lines/branches executed by tests. See `coverage/` after `npm run test:coverage` (open `coverage/lcov-report/index.html` in a browser).
