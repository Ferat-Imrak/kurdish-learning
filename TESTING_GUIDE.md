# Testing Guide for Kurdish Learning App

This guide covers automated testing setup for your Next.js application.

## Testing Stack

1. **Jest + React Testing Library** - Unit & Component tests
2. **Playwright** - End-to-End (E2E) tests
3. **MSW (Mock Service Worker)** - API mocking
4. **Testing Library** - Component testing utilities

## Quick Start

```bash
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @playwright/test msw
```

## Test Structure

```
frontend/
├── __tests__/           # Unit tests
│   ├── components/     # Component tests
│   ├── lib/           # Utility function tests
│   └── hooks/         # Custom hook tests
├── e2e/               # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── lessons.spec.ts
│   ├── games.spec.ts
│   └── stories.spec.ts
└── __mocks__/         # Mock files
```

## Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

## Test Examples

See the example test files in:
- `__tests__/components/` - Component tests
- `__tests__/lib/` - Utility tests
- `e2e/` - E2E tests











