# Testing Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd frontend
npm install --save-dev @playwright/test @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest msw
```

### 2. Run Tests

```bash
# Unit tests
npm run test

# E2E tests (first time will install browsers)
npm run test:e2e

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📝 Writing Tests

### Unit Test Example

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '../../src/components/MyComponent'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### E2E Test Example

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*\/dashboard/)
})
```

## 🎯 Test Coverage

Current test files:
- ✅ `__tests__/components/AudioButton.test.tsx` - Audio button component
- ✅ `__tests__/lib/kurdishTTS.test.ts` - TTS utility functions
- ✅ `__tests__/hooks/useLessonTracking.test.ts` - Lesson tracking hook
- ✅ `e2e/auth.spec.ts` - Authentication flows
- ✅ `e2e/lessons.spec.ts` - Lesson pages
- ✅ `e2e/games.spec.ts` - Game functionality
- ✅ `e2e/stories.spec.ts` - Story reading features

## 🔧 Configuration Files

- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test environment setup
- `playwright.config.ts` - Playwright E2E configuration

## 📊 Running Tests in CI/CD

Tests run automatically on:
- Push to main/develop branches
- Pull requests

See `.github/workflows/test.yml` for CI configuration.

## 💡 Best Practices

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user flows
4. **Mock External APIs**: Use MSW for API mocking
5. **Test Accessibility**: Use `@testing-library` queries
6. **Keep Tests Fast**: Mock heavy operations

## 🐛 Debugging Tests

```bash
# Debug E2E tests
npm run test:e2e:debug

# UI mode for Playwright
npm run test:e2e:ui

# Watch mode for Jest
npm run test:watch
```

## 📚 Resources

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev)
- [Testing Guide](./TESTING_GUIDE.md) - Full documentation












