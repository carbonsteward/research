# Test Automation Documentation

## Overview

ChatPDD implements comprehensive test automation with Jest for unit/integration tests and Playwright for end-to-end testing. All tests run automatically in CI pipeline with coverage reporting and multi-browser support.

## Test Architecture

### 1. Unit & Integration Tests (Jest)
**Framework**: Jest + React Testing Library
**Location**: `__tests__/unit/` and `__tests__/integration/`
**Purpose**: Component logic, API endpoints, utility functions

**Features**:
- ✅ Next.js integration with `next/jest`
- ✅ TypeScript support with proper module resolution
- ✅ React component testing with `@testing-library/react`
- ✅ API route testing with mock requests
- ✅ Coverage reporting with 70% threshold
- ✅ Parallel execution for performance

**Test Database**:
- Isolated PostgreSQL database for integration tests
- Automatic schema setup with Prisma
- Test data seeding and cleanup

### 2. End-to-End Tests (Playwright)
**Framework**: Playwright
**Location**: `__tests__/e2e/`
**Purpose**: Full user workflows and integration testing

**Browser Coverage**:
- ✅ Chromium (Desktop Chrome)
- ✅ Firefox (Desktop Firefox)
- ✅ WebKit (Desktop Safari)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

**Features**:
- Multi-browser parallel execution
- Automatic screenshot on failure
- Trace collection for debugging
- HTML and JSON reporting
- GitHub Actions integration

## CI Pipeline Integration

### Test Execution Flow
```yaml
1. Unit Tests (15 min timeout)
   ├── PostgreSQL service setup
   ├── Dependencies installation with pnpm cache
   ├── Test database schema deployment
   ├── Jest execution with coverage
   └── Coverage report upload

2. E2E Tests (20 min timeout)
   ├── PostgreSQL service setup
   ├── Playwright browser installation
   ├── Application build and start
   ├── Multi-browser test execution
   └── Test artifacts upload

3. Coverage Analysis (PR only)
   ├── Coverage report download
   ├── Threshold validation
   └── Quality gate enforcement
```

### Performance Optimization
- **Parallel Execution**: Jest uses 2 workers in CI, 50% locally
- **Browser Caching**: Playwright browsers cached between runs
- **Dependency Caching**: pnpm lockfile and node_modules cached
- **Database Reuse**: Isolated test databases per job

## Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
{
  testEnvironment: "jest-environment-jsdom",
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  },
  maxWorkers: process.env.CI ? 2 : "50%",
  testTimeout: 10000
}
```

### Playwright Configuration (`playwright.config.js`)
```javascript
{
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: ["html", "json", "github"],
  projects: [chromium, firefox, webkit, mobile]
}
```

## Running Tests Locally

### Unit & Integration Tests
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode for development
pnpm test:watch

# Run specific test file
pnpm test profile-card.test.tsx

# Run tests matching pattern
pnpm test --testNamePattern="should render"
```

### End-to-End Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI mode for debugging
pnpm test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Run specific test file
npx playwright test onboarding.spec.ts

# Debug mode
npx playwright test --debug
```

## Test Database Setup

### Environment Variables
```bash
# Unit tests
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatpdd_test"

# E2E tests
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chatpdd_e2e"

# Test environment
NODE_ENV="test"
```

### Database Lifecycle
1. **Setup**: Automatic PostgreSQL service in CI
2. **Schema**: `pnpm db:generate && pnpm db:push`
3. **Isolation**: Separate databases for unit and E2E tests
4. **Cleanup**: Automatic teardown after test completion

## Coverage Reporting

### Coverage Metrics
- **Statements**: 70% minimum threshold
- **Branches**: 70% minimum threshold
- **Functions**: 70% minimum threshold
- **Lines**: 70% minimum threshold

### Coverage Reports
- **LCOV**: For CI integration and external tools
- **HTML**: Detailed interactive report
- **Text**: Console summary for quick feedback
- **JSON**: Programmatic access for tooling

### Coverage Upload
- Automatic upload to Codecov on every CI run
- Pull request coverage comparison
- Coverage trend tracking over time

## Test Organization

### Directory Structure
```
__tests__/
├── unit/
│   ├── components/          # React component tests
│   ├── lib/                 # Utility function tests
│   └── services/            # Service layer tests
├── integration/
│   ├── api/                 # API endpoint tests
│   └── database/            # Database integration tests
└── e2e/
    ├── onboarding.spec.ts   # User onboarding flow
    ├── dashboard.spec.ts    # Dashboard functionality
    └── methodologies.spec.ts # Methodology explorer
```

### Naming Conventions
- **Unit tests**: `*.test.{ts,tsx}`
- **Integration tests**: `*.test.{ts,tsx}`
- **E2E tests**: `*.spec.ts`
- **Test utilities**: `*.helper.{ts,tsx}`

## Mocking Strategies

### Component Tests
```typescript
// Mock external libraries
jest.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> }
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}))
```

### API Tests
```typescript
// Mock database calls
jest.mock('@/lib/prisma', () => ({
  prisma: { user: { findMany: jest.fn() } }
}))

// Mock external APIs
jest.mock('axios', () => ({ get: jest.fn() }))
```

### E2E Test Data
```typescript
// Use test-specific data
await page.route('**/api/methodologies', route => {
  route.fulfill({ json: testMethodologies })
})
```

## Debugging Tests

### Jest Debugging
```bash
# Run with debug output
pnpm test --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand test.spec.js

# VS Code debugging
# Add breakpoint and run "Jest Debug" configuration
```

### Playwright Debugging
```bash
# Debug mode with browser
npx playwright test --debug

# Headed mode
npx playwright test --headed

# Slow motion
npx playwright test --slow-mo=1000

# Video recording
npx playwright test --video=on
```

## Continuous Integration Features

### Parallel Execution
- Jest runs with 2 workers in CI for stability
- Playwright tests run in parallel across browsers
- Database operations isolated per job

### Failure Handling
- **Retries**: Playwright retries failed tests 2 times in CI
- **Screenshots**: Automatic capture on E2E test failures
- **Traces**: Detailed execution traces for debugging
- **Artifacts**: Test reports uploaded for 7 days

### Status Reporting
- GitHub status checks for each test suite
- Pull request comments with coverage changes
- Slack notifications for test failures (future)

## Performance Metrics

### Target Execution Times
- **Unit Tests**: <5 minutes
- **E2E Tests**: <15 minutes
- **Total Testing**: <20 minutes
- **Coverage Analysis**: <2 minutes

### Optimization Techniques
- Test parallelization
- Dependency caching
- Browser reuse
- Database connection pooling
- Selective test execution

## Quality Gates

### Merge Requirements
1. ✅ All unit tests pass
2. ✅ All integration tests pass
3. ✅ All E2E tests pass across browsers
4. ✅ Coverage thresholds met (70%)
5. ✅ No test.only or describe.only in committed code

### Coverage Enforcement
- PR blocks if coverage drops below threshold
- New code requires reasonable test coverage
- Critical paths must have high coverage (>90%)

## Future Enhancements

**Planned Improvements** (Stories 1.4-1.7):
- Visual regression testing with Playwright
- Performance testing and benchmarking
- Database seeding automation
- Test data factories and builders
- Advanced mocking for external services
- Cross-browser compatibility reporting

**Current Limitations**:
- No visual regression testing
- Limited test data management
- No performance benchmarking
- No database migration testing

---

**Test Automation Status**: ✅ Story 1.3 Implementation Complete
**Coverage**: 70% threshold enforced
**Browsers**: 5 environments tested
**Next**: Story 1.4 - Environment Management and Configuration
