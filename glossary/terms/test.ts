import type { GlossaryTerm } from '../types'

export const testTerms: GlossaryTerm[] = [
  {
    id: 'test-1',
    term: 'Unit Testing',
    slug: 'unit-testing',
    category: 'Test',
    definition:
      'Unit Testing là kiểm thử từng đơn vị code nhỏ nhất (function, method, class) một cách độc lập. Đảm bảo mỗi unit hoạt động đúng như mong đợi trước khi tích hợp.',
    details:
      '**Đặc điểm:**\n- Test isolated unit of code\n- Nhanh (milliseconds per test)\n- Không phụ thuộc external services (DB, API)\n- Viết bởi developers\n- Chạy trong CI/CD pipeline\n\n**Test Pyramid:**\n```\n        /\\\n       /  \\  E2E Tests (10%)\n      /----\\\n     /      \\  Integration Tests (20%)\n    /--------\\\n   /          \\  Unit Tests (70%)\n  /____________\\\n```\n\n**Best Practices:**\n- AAA pattern (Arrange, Act, Assert)\n- One assertion per test\n- Descriptive test names\n- Mock external dependencies\n- Keep tests fast and independent\n\n**Frameworks:**\n- JavaScript/TypeScript: Jest, Vitest, Mocha\n- Python: pytest, unittest\n- Java: JUnit, TestNG\n- C#: NUnit, xUnit',
    examples: [
      {
        title: 'Unit Testing với Jest',
        code: `// Hàm cần test
function calculateDiscount(price: number, discountPercent: number): number {
  if (price < 0 || discountPercent < 0 || discountPercent > 100) {
    throw new Error('Invalid input');
  }
  return price - (price * discountPercent) / 100;
}

// Test file: calculateDiscount.test.ts
import { calculateDiscount } from './calculateDiscount';

describe('calculateDiscount', () => {
  // Happy path tests
  test('calculates 10% discount on $100', () => {
    expect(calculateDiscount(100, 10)).toBe(90);
  });

  test('calculates 50% discount on $200', () => {
    expect(calculateDiscount(200, 50)).toBe(100);
  });

  test('returns same price when 0% discount', () => {
    expect(calculateDiscount(50, 0)).toBe(50);
  });

  test('returns 0 when 100% discount', () => {
    expect(calculateDiscount(75, 100)).toBe(0);
  });

  // Edge cases
  test('handles decimal discounts', () => {
    expect(calculateDiscount(100, 12.5)).toBe(87.5);
  });

  // Error cases
  test('throws error for negative price', () => {
    expect(() => calculateDiscount(-10, 10)).toThrow('Invalid input');
  });

  test('throws error for discount > 100', () => {
    expect(() => calculateDiscount(100, 150)).toThrow('Invalid input');
  });
});

// Chạy tests
// npx jest
// npx jest --coverage  // Xem coverage`,
        explanation:
          'Unit test nên có: happy paths, edge cases, error cases. AAA pattern: Arrange (setup), Act (call function), Assert (check result). Jest auto-mocks không cần config.',
      },
      {
        title: 'Mocking Dependencies',
        code: `// Service cần test (có external dependency)
class UserService {
  constructor(private db: Database) {}

  async getUser(id: string) {
    const user = await this.db.users.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async createUser(data: { name: string; email: string }) {
    const existing = await this.db.users.findOne({ email: data.email });
    if (existing) throw new Error('Email already exists');
    return this.db.users.create(data);
  }
}

// Test với mocking
import { UserService } from './UserService';

describe('UserService', () => {
  let mockDb: any;
  let service: UserService;

  beforeEach(() => {
    // Create mock database
    mockDb = {
      users: {
        findById: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn()
      }
    };
    service = new UserService(mockDb);
  });

  test('getUser returns user when found', async () => {
    // Arrange
    const mockUser = { id: '1', name: 'John', email: 'john@test.com' };
    mockDb.users.findById.mockResolvedValue(mockUser);

    // Act
    const result = await service.getUser('1');

    // Assert
    expect(result).toEqual(mockUser);
    expect(mockDb.users.findById).toHaveBeenCalledWith('1');
    expect(mockDb.users.findById).toHaveBeenCalledTimes(1);
  });

  test('getUser throws error when user not found', async () => {
    mockDb.users.findById.mockResolvedValue(null);

    await expect(service.getUser('999')).rejects.toThrow('User not found');
  });

  test('createUser throws error when email exists', async () => {
    mockDb.users.findOne.mockResolvedValue({ id: '1', email: 'john@test.com' });

    await expect(
      service.createUser({ name: 'Jane', email: 'john@test.com' })
    ).rejects.toThrow('Email already exists');
  });

  test('createUser creates user when email is unique', async () => {
    mockDb.users.findOne.mockResolvedValue(null);
    const newUser = { id: '2', name: 'Jane', email: 'jane@test.com' };
    mockDb.users.create.mockResolvedValue(newUser);

    const result = await service.createUser({ name: 'Jane', email: 'jane@test.com' });

    expect(result).toEqual(newUser);
    expect(mockDb.users.create).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@test.com'
    });
  });
});`,
        explanation:
          'Mock external dependencies để isolate unit test. beforeEach tạo fresh mock mỗi test. Kiểm tra mock được gọi đúng params và số lần.',
      },
      {
        title: 'Testing Async/Await Code',
        code: `// Async function cần test
async function fetchUserData(userId: string): Promise<{ name: string; posts: number }> {
  const response = await fetch(\`/api/users/\${userId}\`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

// Test async code - 3 cách

// Cách 1: async/await trong test
test('fetches user data', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ name: 'John', posts: 5 })
    })
  );

  const result = await fetchUserData('1');
  expect(result).toEqual({ name: 'John', posts: 5 });
});

// Cách 2: .resolves/.rejects
test('resolves with user data', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ name: 'John', posts: 5 })
    })
  );

  await expect(fetchUserData('1')).resolves.toEqual({
    name: 'John',
    posts: 5
  });
});

// Cách 3: Callback pattern (cho old-style callbacks)
test('callback called with data', (done) => {
  fetchData((err, data) => {
    expect(data).toEqual({ name: 'John' });
    done();
  });
});

// Test timeouts
test('fetch times out after 5s', async () => {
  jest.useFakeTimers();

  global.fetch = jest.fn(() =>
    new Promise(resolve => setTimeout(() => resolve({ ok: false }), 6000))
  );

  await expect(fetchUserData('1')).rejects.toThrow('Failed to fetch');

  jest.advanceTimersByTime(6000);
  jest.useRealTimers();
});`,
        explanation:
          'Async tests cần await hoặc .resolves/.rejects. Mock fetch để không gọi real API. Fake timers cho test timeout scenarios.',
      },
    ],
    relatedTerms: ['Integration Testing', 'TDD', 'Mocking', 'Test Coverage', 'Jest'],
    tags: ['unit-testing', 'test', 'jest', 'tdd', 'mocking'],
  },
  {
    id: 'test-2',
    term: 'Integration Testing',
    slug: 'integration-testing',
    category: 'Test',
    definition:
      'Integration Testing kiểm thử cách các components/modules tương tác với nhau. Khác với Unit Testing (test isolated), Integration test verify interfaces giữa components hoạt động đúng.',
    details:
      '**Scope:**\n- Database interactions\n- API calls between services\n- File system operations\n- External service integrations\n- Message queue communication\n\n**Test Strategies:**\n1. **Big Bang**: Test tất cả components cùng lúc\n2. **Top-Down**: Test từ top level xuống\n3. **Bottom-Up**: Test từ bottom level lên\n4. **Sandwich**: Kết hợp top-down và bottom-up\n\n**Best Practices:**\n- Use test databases (not production)\n- Seed test data before tests\n- Clean up after tests\n- Use test containers (Docker)\n- Mock only external services\n\n**Vs Unit Testing:**\n- Unit: Fast, isolated, no I/O\n- Integration: Slower, tests real interactions, more realistic',
    examples: [
      {
        title: 'Integration Testing với Database',
        code: `// Test database interactions
import { UserRepository } from './UserRepository';
import { db } from '../db';

describe('UserRepository Integration Tests', () => {
  let repo: UserRepository;

  beforeAll(async () => {
    // Connect to test database
    await db.connect(process.env.TEST_DATABASE_URL);
    repo = new UserRepository(db);
  });

  beforeEach(async () => {
    // Clean database before each test
    await db.users.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect after all tests
    await db.disconnect();
  });

  test('createUser inserts user into database', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };

    const createdUser = await repo.createUser(userData);

    expect(createdUser.id).toBeDefined();
    expect(createdUser.name).toBe(userData.name);
    expect(createdUser.email).toBe(userData.email);

    // Verify actually in database
    const fromDb = await db.users.findById(createdUser.id);
    expect(fromDb).toEqual(createdUser);
  });

  test('findByEmail returns correct user', async () => {
    // Seed test data
    await db.users.createMany([
      { name: 'Alice', email: 'alice@test.com', age: 25 },
      { name: 'Bob', email: 'bob@test.com', age: 30 }
    ]);

    const user = await repo.findByEmail('bob@test.com');

    expect(user).toBeDefined();
    expect(user.name).toBe('Bob');
    expect(user.email).toBe('bob@test.com');
  });

  test('updateUser modifies existing user', async () => {
    const created = await repo.createUser({
      name: 'Original',
      email: 'test@test.com',
      age: 20
    });

    const updated = await repo.updateUser(created.id, {
      name: 'Updated',
      age: 25
    });

    expect(updated.name).toBe('Updated');
    expect(updated.age).toBe(25);

    // Verify in database
    const fromDb = await db.users.findById(created.id);
    expect(fromDb.name).toBe('Updated');
  });

  test('deleteUser removes user from database', async () => {
    const created = await repo.createUser({
      name: 'To Delete',
      email: 'delete@test.com',
      age: 20
    });

    await repo.deleteUser(created.id);

    const fromDb = await db.users.findById(created.id);
    expect(fromDb).toBeNull();
  });
});`,
        explanation:
          'Integration test dùng real database (test DB). beforeEach cleanup đảm bảo tests không phụ thuộc nhau. Seed data trước khi test.',
      },
      {
        title: 'API Integration Testing',
        code: `// Test API endpoints
import request from 'supertest';
import { app } from '../app';
import { db } from '../db';

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    await db.connect(process.env.TEST_DATABASE_URL);
  });

  beforeEach(async () => {
    await db.users.deleteMany({});
  });

  afterAll(async () => {
    await db.disconnect();
  });

  test('POST /users creates new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secure123'
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('John Doe');
    expect(response.body.email).toBe('john@example.com');
    expect(response.body).not.toHaveProperty('password'); // Should not return password

    // Verify in database
    const user = await db.users.findById(response.body.id);
    expect(user).toBeDefined();
    expect(user.name).toBe('John Doe');
  });

  test('GET /users/:id returns user', async () => {
    // Seed
    const created = await db.users.create({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'hashed'
    });

    const response = await request(app)
      .get(\`/users/\${created.id}\`)
      .expect(200);

    expect(response.body.id).toBe(created.id);
    expect(response.body.name).toBe('Alice');
  });

  test('GET /users returns paginated list', async () => {
    // Seed 15 users
    const users = Array.from({ length: 15 }, (_, i) => ({
      name: \`User \${i}\`,
      email: \`user\${i}@test.com\`,
      password: 'hashed'
    }));
    await db.users.createMany(users);

    const response = await request(app)
      .get('/users?page=1&limit=10')
      .expect(200);

    expect(response.body.data).toHaveLength(10);
    expect(response.body.total).toBe(15);
    expect(response.body.page).toBe(1);
    expect(response.body.totalPages).toBe(2);
  });

  test('POST /users returns 400 for invalid data', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: '' }) // Missing required fields
      .expect(400);

    expect(response.body.error).toBeDefined();
  });

  test('POST /users returns 409 for duplicate email', async () => {
    await db.users.create({
      name: 'Alice',
      email: 'duplicate@test.com',
      password: 'hashed'
    });

    await request(app)
      .post('/users')
      .send({
        name: 'Alice 2',
        email: 'duplicate@test.com',
        password: 'hashed'
      })
      .expect(409);
  });
});`,
        explanation:
          'supertest test real API endpoints. Test response status, body, headers. Seed data trước, verify trong DB sau. Test cả error cases.',
      },
    ],
    relatedTerms: ['Unit Testing', 'E2E Testing', 'Test Database', 'Supertest', 'API Testing'],
    tags: ['integration-testing', 'test', 'database', 'api', 'supertest'],
  },
  {
    id: 'test-3',
    term: 'End-to-End (E2E) Testing',
    slug: 'e2e-testing',
    category: 'Test',
    definition:
      'E2E Testing kiểm thử toàn bộ flow từ đầu đến cuối như user thật. Mô phỏng user interactions trong browser, verify application hoạt động đúng trong real-world scenarios.',
    details:
      '**E2E Test Characteristics:**\n- Tests entire user flow\n- Runs in real browser\n- Slowest but most realistic\n- Catches integration issues\n- Expensive to maintain\n\n**Test Pyramid Position:**\n- Bottom: Unit Tests (70%) - Fast, cheap\n- Middle: Integration Tests (20%) - Medium\n- Top: E2E Tests (10%) - Slow, expensive\n\n**What to Test:**\n- Critical user journeys (login, checkout, signup)\n- Multi-step workflows\n- Cross-browser compatibility\n- UI rendering and interactions\n- Form validation\n\n**E2E Frameworks:**\n- **Playwright**: Microsoft, multi-browser, fast\n- **Cypress**: Developer-friendly, time travel\n- **Selenium**: Legacy, multi-language\n- **Puppeteer**: Chrome-only, headless\n\n**Best Practices:**\n- Test critical paths only\n- Use page object pattern\n- Stable selectors (data-testid)\n- Independent tests\n- Handle async properly\n- Screenshot on failure',
    examples: [
      {
        title: 'E2E Testing với Playwright',
        code: `// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Login Flow', () => {
  test('successful login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill form
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Submit form
    await page.click('[data-testid="login-button"]');

    // Wait for navigation
    await page.waitForURL('/dashboard');

    // Verify successful login
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Verify error message
    const error = page.locator('[data-testid="error-message"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Invalid email or password');

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('form validation prevents empty submission', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without filling form
    await page.click('[data-testid="login-button"]');

    // Verify validation messages
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });

  test('complete signup to dashboard flow', async ({ page }) => {
    // Signup
    await page.goto('/signup');
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="signup-button"]');

    // Verify email confirmation
    await page.waitForURL('/verify-email');
    await expect(page.locator('[data-testid="verify-message"]')).toBeVisible();

    // Simulate email verification (in real test, would click email link)
    await page.goto('/verify?token=test-token');

    // Verify redirected to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toHaveText(
      'Welcome, John Doe!'
    );
  });
});

// Run tests
// npx playwright test
// npx playwright test --headed  // See browser
// npx playwright test --ui     // UI mode`,
        explanation:
          'Playwright tests chạy trong real browser. data-testid selectors stable hơn CSS selectors. Test entire user journey từ login đến dashboard.',
      },
      {
        title: 'Page Object Pattern',
        code: `// tests/e2e/pages/LoginPage.ts
class LoginPage {
  constructor(private page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.fill('[data-testid="email-input"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('[data-testid="password-input"]', password);
  }

  async clickLogin() {
    await this.page.click('[data-testid="login-button"]');
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  getErrorMessage() {
    return this.page.locator('[data-testid="error-message"]');
  }

  getWelcomeMessage() {
    return this.page.locator('[data-testid="welcome-message"]');
  }
}

// tests/e2e/pages/DashboardPage.ts
class DashboardPage {
  constructor(private page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  getUserName() {
    return this.page.locator('[data-testid="user-name"]');
  }

  async logout() {
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/login');
  }
}

// tests/e2e/login.spec.ts (cleaner tests)
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Login Flow', () => {
  test('valid login redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.login('user@example.com', 'password123');

    await expect(dashboardPage.getUserName()).toBeVisible();
  });

  test('invalid credentials shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('user@example.com', 'wrongpassword');

    await expect(loginPage.getErrorMessage()).toBeVisible();
  });
});`,
        explanation:
          'Page Object Pattern encapsulate page logic vào classes. Tests clean hơn, dễ maintain. Nếu UI thay đổi, chỉ cần update page object.',
      },
    ],
    relatedTerms: ['Unit Testing', 'Integration Testing', 'Playwright', 'Cypress', 'Page Object Pattern'],
    tags: ['e2e-testing', 'test', 'playwright', 'browser', 'user-flow'],
  },
  {
    id: 'test-4',
    term: 'Test-Driven Development (TDD)',
    slug: 'tdd',
    category: 'Test',
    definition:
      'TDD là methodology viết tests TRƯỚC khi viết implementation code. Follow Red-Green-Refactor cycle: Write failing test → Make it pass → Refactor code.',
    details:
      '**Red-Green-Refactor Cycle:**\n\n1. **RED**: Viết test fail (chưa có code)\n2. **GREEN**: Viết code tối thiểu để test pass\n3. **REFACTOR**: Clean up code, keep tests green\n\n**TDD Benefits:**\n- Better code design (testable by nature)\n- High test coverage automatically\n- Clear requirements before coding\n- Faster debugging\n- Living documentation\n- Confidence to refactor\n\n**TDD Laws:**\n1. Không viết production code nếu chưa có failing test\n2. Không viết nhiều test code hơn cần thiết để fail\n3. Không viết nhiều production code hơn cần để pass test\n\n**When to Use TDD:**\n- Complex business logic\n- API development\n- Library/framework development\n- When requirements are clear\n\n**When NOT to Use TDD:**\n- UI/UX experimentation\n- Prototyping/spikes\n- Exploratory development\n- Unclear requirements',
    examples: [
      {
        title: 'TDD Example: String Calculator',
        code: `// Bước 1: RED - Viết test FAIL trước
// stringCalculator.test.ts
import { add } from './stringCalculator';

describe('StringCalculator', () => {
  test('returns 0 for empty string', () => {
    expect(add('')).toBe(0);  // FAIL - function chưa tồn tại
  });
});

// Bước 2: GREEN - Viết code tối thiểu
// stringCalculator.ts
export function add(numbers: string): number {
  if (numbers === '') return 0;  // Pass test với code tối thiểu
}

// Bước 3: RED - Thêm test mới
test('returns 1 for "1"', () => {
  expect(add('1')).toBe(1);  // FAIL - add('1') undefined
});

// GREEN - Update code
export function add(numbers: string): number {
  if (numbers === '') return 0;
  return parseInt(numbers);  // Pass cả 2 tests
});

// RED - Test phức tạp hơn
test('adds two numbers "1,2"', () => {
  expect(add('1,2')).toBe(3);  // FAIL
});

// GREEN
export function add(numbers: string): number {
  if (numbers === '') return 0;
  return numbers.split(',').reduce((sum, n) => sum + parseInt(n), 0);
}

// RED - Edge case
test('handles unknown number of numbers', () => {
  expect(add('1,2,3,4,5')).toBe(15);  // PASS - code đã handle
});

// REFACTOR - Clean code
export function add(numbers: string): number {
  if (!numbers) return 0;

  return numbers
    .split(',')
    .map(Number)
    .reduce((sum, n) => sum + n, 0);
}

// RED - Negative numbers not allowed
test('throws error for negative numbers', () => {
  expect(() => add('1,-2,3')).toThrow('Negatives not allowed: -2');
});

// GREEN
export function add(numbers: string): number {
  if (!numbers) return 0;

  const nums = numbers.split(',').map(Number);
  const negatives = nums.filter(n => n < 0);

  if (negatives.length > 0) {
    throw new Error(\`Negatives not allowed: \${negatives.join(', ')}\`);
  }

  return nums.reduce((sum, n) => sum + n, 0);
}`,
        explanation:
          'TDD bắt đầu từ test, không phải code. Mỗi cycle: viết test fail → code tối thiểu để pass → refactor. Kết quả: code được test coverage 100%.',
      },
      {
        title: 'TDD với Express API',
        code: `// RED - Test route chưa tồn tại
import request from 'supertest';
import { app } from '../app';

describe('POST /api/users', () => {
  test('creates user with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'John',
        email: 'john@test.com',
        age: 30
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('John');
    expect(response.body.email).toBe('john@test.com');
  });
});

// GREEN - Route tối thiểu
app.post('/api/users', async (req, res) => {
  const { name, email, age } = req.body;

  const user = await db.users.create({
    name,
    email,
    age
  });

  res.status(201).json(user);
});

// RED - Validation test
test('returns 400 for missing name', async () => {
  await request(app)
    .post('/api/users')
    .send({ email: 'test@test.com' })
    .expect(400);
});

// GREEN - Add validation
app.post('/api/users', async (req, res) => {
  const { name, email, age } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await db.users.create({ name, email, age });
  res.status(201).json(user);
});

// RED - Duplicate email test
test('returns 409 for duplicate email', async () => {
  await db.users.create({ name: 'Alice', email: 'dup@test.com', age: 25 });

  await request(app)
    .post('/api/users')
    .send({ name: 'Bob', email: 'dup@test.com', age: 30 })
    .expect(409);
});

// GREEN - Handle duplicate
app.post('/api/users', async (req, res) => {
  const { name, email, age } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: !name ? 'Name is required' : 'Email is required'
    });
  }

  const existing = await db.users.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const user = await db.users.create({ name, email, age });
  res.status(201).json(user);
});`,
        explanation:
          'TDD cho API: test route trước, implement sau. Mỗi test fail dẫn đến code mới. Validation và error handling được driven bởi tests.',
      },
    ],
    relatedTerms: ['Unit Testing', 'BDD', 'Red-Green-Refactor', 'Test Coverage', 'Refactoring'],
    tags: ['tdd', 'test-driven-development', 'test', 'red-green-refactor', 'methodology'],
  },
  {
    id: 'test-5',
    term: 'Test Coverage',
    slug: 'test-coverage',
    category: 'Test',
    definition:
      'Test Coverage đo lường phần trăm code được execute bởi tests. Cho biết quality của test suite nhưng không guarantee code correctness - 100% coverage ≠ 0 bugs.',
    details:
      '**Coverage Types:**\n1. **Statement Coverage**: % statements executed\n2. **Branch Coverage**: % branches taken (if/else)\n3. **Function Coverage**: % functions called\n4. **Line Coverage**: % lines executed\n5. **Condition Coverage**: % boolean expressions evaluated\n\n**Coverage Metrics:**\n```\nStatements: 85% (170/200)\nBranches:     78% (120/154)\nFunctions:    92% (45/49)\nLines:        86% (165/192)\n```\n\n**Good Coverage Targets:**\n- **< 50%**: Poor - too much untested code\n- **50-70%**: Fair - core logic tested\n- **70-90%**: Good - acceptable for most projects\n- **> 90%**: Excellent - but verify quality\n\n**Coverage ≠ Quality:**\n- 100% coverage doesn\'t mean bug-free\n- Tests might not assert anything\n- Edge cases might be missed\n- Logic errors still possible\n\n**Istanbul/nyc:**\n- JavaScript coverage tool\n- Integrates with Jest, Mocha\n- Generates HTML reports\n- CI/CD coverage thresholds',
    examples: [
      {
        title: 'Measuring Coverage với Jest',
        code: `// package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --coverage --ci --coverageReporters=text --coverageReporters=lcov"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 90,
        "lines": 85,
        "statements": 85
      }
    },
    "collectCoverageFrom": [
      "src/**/*.{js,ts}",
      "!src/**/*.test.{js,ts}",
      "!src/**/index.{js,ts}"
    ]
  }
}

// Chạy coverage
// npm run test:coverage

// Coverage report output:
// -----------------|---------|----------|---------|---------|
// File             | % Stmts | % Branch | % Funcs | % Lines |
// -----------------|---------|----------|---------|---------|
// All files        |   87.5  |    82.1  |   91.2  |   88.3  |
//  src/            |         |          |         |         |
//   auth.ts        |     100 |      100 |     100 |     100 |
//   users.ts       |   92.3  |    85.7  |     100 |    91.8 |
//   utils.ts       |   66.7  |    50.0  |   66.7  |   68.4 |
// -----------------|---------|----------|---------|---------|

// Coverage thresholds trong CI
// Nếu coverage < threshold → build fails

// Jest config với thresholds
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 85
    },
    // Per-file thresholds
    "./src/auth.ts": {
      branches: 95,
      functions: 100
    }
  }
};

// Xem HTML coverage report
// npx jest --coverage --coverageReporters=html
// Open coverage/lcov-report/index.html`,
        explanation:
          'Coverage reports show % code tested. Set thresholds in CI để prevent coverage drops. HTML report cho visualization chi tiết.',
      },
      {
        title: 'Improving Coverage',
        code: `// File có coverage thấp
export function validateUser(data: any) {
  const errors: string[] = [];

  if (!data.name) {
    errors.push('Name is required');
  } else if (data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (data.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!data.email) {
    errors.push('Email is required');
  } else if (!/\\S+@\\S+\\.\\S+/.test(data.email)) {
    errors.push('Email is invalid');
  }

  if (data.age && data.age < 18) {
    errors.push('Must be 18 or older');
  }

  if (data.age && data.age > 150) {
    errors.push('Age must be less than 150');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Current coverage: 60% (missing edge cases)

// Test để improve coverage
describe('validateUser', () => {
  test('valid user passes validation', () => {
    const result = validateUser({
      name: 'John',
      email: 'john@test.com',
      age: 25
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('name too short', () => {
    const result = validateUser({
      name: 'J',
      email: 'test@test.com'
    });
    expect(result.errors).toContain('Name must be at least 2 characters');
  });

  test('name too long', () => {
    const result = validateUser({
      name: 'A'.repeat(101),
      email: 'test@test.com'
    });
    expect(result.errors).toContain('Name must be less than 100 characters');
  });

  test('invalid email format', () => {
    const result = validateUser({
      name: 'John',
      email: 'invalid-email'
    });
    expect(result.errors).toContain('Email is invalid');
  });

  test('age under 18', () => {
    const result = validateUser({
      name: 'John',
      email: 'john@test.com',
      age: 15
    });
    expect(result.errors).toContain('Must be 18 or older');
  });

  test('age over 150', () => {
    const result = validateUser({
      name: 'John',
      email: 'john@test.com',
      age: 200
    });
    expect(result.errors).toContain('Age must be less than 150');
  });

  test('multiple errors collected', () => {
    const result = validateUser({});
    expect(result.errors).toHaveLength(2);
    expect(result.errors).toContain('Name is required');
    expect(result.errors).toContain('Email is required');
  });
});

// Sau khi thêm tests: Coverage tăng từ 60% → 100%`,
        explanation:
          'Coverage thấp thường do missing edge cases. Test tất cả branches (if/else) và boundary conditions để tăng coverage.',
      },
    ],
    relatedTerms: ['Unit Testing', 'TDD', 'Istanbul', 'Code Quality', 'CI/CD'],
    tags: ['test-coverage', 'coverage', 'test', 'quality', 'istanbul'],
  },
  {
    id: 'test-6',
    term: 'Mocking và Stubbing',
    slug: 'mocking-stubbing',
    category: 'Test',
    definition:
      'Mocking và Stubbing là techniques thay thế real dependencies bằng test doubles để isolate unit under test. Mocks verify interactions, Stubs provide canned responses.',
    details:
      '**Test Doubles Types:**\n\n1. **Dummy**: Passed but never used\n2. **Stub**: Returns canned data\n3. **Spy**: Records method calls\n4. **Mock**: Expects specific calls\n5. **Fake**: Working but simplified implementation\n\n**When to Mock:**\n- External APIs (payment, email, SMS)\n- Database calls (use real DB for integration tests)\n- File system operations\n- Time/date (for testing time-sensitive code)\n- Random number generation\n- Network requests\n\n**When NOT to Mock:**\n- Simple pure functions\n- Already tested units\n- Third-party libraries (test through your code)\n\n**Mock vs Stub:**\n- Stub: "Khi gọi method X, trả về Y"\n- Mock: "Method X PHẢI được gọi với Z"\n- Stub cho input, Mock cho verification',
    examples: [
      {
        title: 'Mocking với Jest',
        code: `import { UserService } from './UserService';
import { EmailService } from './EmailService';

// Mock entire module
jest.mock('./EmailService', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendEmail: jest.fn().mockResolvedValue(true),
    sendBulkEmail: jest.fn().mockResolvedValue({ sent: 0, failed: 0 })
  }))
}));

describe('UserService', () => {
  let userService: UserService;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    emailService = new EmailService() as jest.Mocked<EmailService>;
    userService = new UserService(emailService);
  });

  test('calls sendEmail when user registers', async () => {
    await userService.registerUser({
      name: 'John',
      email: 'john@test.com'
    });

    // Verify mock was called
    expect(emailService.sendEmail).toHaveBeenCalledWith({
      to: 'john@test.com',
      subject: 'Welcome!',
      body: 'Welcome to our platform'
    });
    expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
  });

  test('handles email send failure', async () => {
    emailService.sendEmail.mockRejectedValueOnce(new Error('SMTP error'));

    await expect(
      userService.registerUser({
        name: 'Jane',
        email: 'jane@test.com'
      })
    ).rejects.toThrow('Failed to send welcome email');
  });
});

// Mock functions
const mockFn = jest.fn();
mockFn.mockReturnValue('default');
mockFn.mockReturnValueOnce('first call');
mockFn.mockReturnValueOnce('second call');

console.log(mockFn()); // 'first call'
console.log(mockFn()); // 'second call'
console.log(mockFn()); // 'default'

// Mock với implementation
const mockFetch = jest.fn(async (url) => {
  if (url.includes('/users')) {
    return { id: 1, name: 'John' };
  }
  throw new Error('Not found');
});

// Mock timers
jest.useFakeTimers();
const callback = jest.fn();

setTimeout(callback, 5000);
expect(callback).not.toHaveBeenCalled();

jest.advanceTimersByTime(5000);
expect(callback).toHaveBeenCalled();

jest.useRealTimers();`,
        explanation:
          'jest.mock() auto-mock modules. mockImplementation cho custom behavior. Verify mocks được gọi đúng params và số lần.',
      },
      {
        title: 'Manual Mocks và Spies',
        code: `// Manual mock trong __mocks__/directory
// __mocks__/axios.ts
const axios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

export default axios;

// Test sử dụng manual mock
import axios from 'axios';
jest.mock('axios'); // Tự động dùng __mocks__/axios

test('fetches users from API', async () => {
  axios.get.mockResolvedValue({
    data: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  });

  const users = await fetchUsers();
  expect(users).toHaveLength(2);
  expect(axios.get).toHaveBeenCalledWith('/api/users');
});

// Spies - theo dõi method calls mà không mock
describe('Object with spy', () => {
  test('spy on console.log', () => {
    const spy = jest.spyOn(console, 'log');

    console.log('Hello');

    expect(spy).toHaveBeenCalledWith('Hello');
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockRestore(); // Cleanup
  });

  test('spy with custom implementation', () => {
    const math = {
      add: (a: number, b: number) => a + b
    };

    const spy = jest.spyOn(math, 'add');
    spy.mockImplementation((a, b) => a * b); // Override

    expect(math.add(2, 3)).toBe(6); // 2 * 3
    expect(spy).toHaveBeenCalledWith(2, 3);

    spy.mockRestore();
    expect(math.add(2, 3)).toBe(5); // 2 + 3 (back to original)
  });
});

// Mock Date
test('time-dependent function', () => {
  const fixedDate = new Date('2024-01-01');
  jest.useFakeTimers().setSystemTime(fixedDate);

  const result = getTimeSensitiveData();

  expect(result.date).toBe('2024-01-01');
  expect(result.isNewYear).toBe(true);

  jest.useRealTimers();
});`,
        explanation:
          'Manual mocks trong __mocks__ folder. Spies track calls nhưng vẫn gọi real method. mockImplementation override behavior. Luôn restore sau test.',
      },
    ],
    relatedTerms: ['Unit Testing', 'Test Doubles', 'Jest', 'Isolation', 'Dependency Injection'],
    tags: ['mocking', 'stubbing', 'test', 'jest', 'test-doubles'],
  },
  {
    id: 'test-7',
    term: 'Behavior-Driven Development (BDD)',
    slug: 'bdd',
    category: 'Test',
    definition:
      'BDD là development methodology extend TDD bằng cách viết tests dưới dạng human-readable specifications. Tập trung vào behavior của system thay vì implementation details.',
    details:
      '**BDD vs TDD:**\n- TDD: Developer-focused, technical tests\n- BDD: Business-focused, behavior specifications\n- TDD: "Hàm X trả về Y"\n- BDD: "Khi user làm Z, system sẽ W"\n\n**Gherkin Syntax:**\n```\nFeature: User Registration\n  Scenario: Successful registration\n    Given I am on the registration page\n    When I fill in valid details\n    And I click register\n    Then I should see a welcome message\n    And I should receive a confirmation email\n```\n\n**BDD Frameworks:**\n- **Cucumber**: Gherkin syntax, multi-language\n- **Jest**: describe/it blocks (BDD-style)\n- **Jasmine**: Similar to Jest\n- **SpecFlow**: .NET\n- **Behave**: Python\n\n**BDD Benefits:**\n- Shared understanding (devs, QA, business)\n- Living documentation\n- Focus on user value\n- Better test design\n- Less technical jargon\n\n**Three Amigos:**\n- Developer: Technical implementation\n- QA: Edge cases, testing perspective\n- Business: Requirements, acceptance criteria',
    examples: [
      {
        title: 'BDD với Jest (describe/it)',
        code: `// BDD-style tests với Gherkin-like structure
describe('Shopping Cart', () => {
  describe('when cart is empty', () => {
    it('should display empty cart message', () => {
      const cart = new ShoppingCart();
      expect(cart.getMessage()).toBe('Your cart is empty');
    });

    it('should show zero total', () => {
      const cart = new ShoppingCart();
      expect(cart.getTotal()).toBe(0);
    });
  });

  describe('when adding items', () => {
    let cart: ShoppingCart;

    beforeEach(() => {
      cart = new ShoppingCart();
    });

    it('should increase item count', () => {
      cart.addItem('Book', 29.99);
      expect(cart.getItemCount()).toBe(1);

      cart.addItem('Pen', 5.99);
      expect(cart.getItemCount()).toBe(2);
    });

    it('should calculate total correctly', () => {
      cart.addItem('Book', 29.99);
      cart.addItem('Pen', 5.99);
      expect(cart.getTotal()).toBe(35.98);
    });

    it('should apply 10% discount for orders over $100', () => {
      cart.addItem('Laptop', 999.99);
      expect(cart.getTotal()).toBe(899.99); // 10% off
    });
  });

  describe('when removing items', () => {
    let cart: ShoppingCart;

    beforeEach(() => {
      cart = new ShoppingCart();
      cart.addItem('Book', 29.99);
      cart.addItem('Pen', 5.99);
    });

    it('should decrease item count', () => {
      cart.removeItem('Pen');
      expect(cart.getItemCount()).toBe(1);
    });

    it('should recalculate total', () => {
      cart.removeItem('Pen');
      expect(cart.getTotal()).toBe(29.99);
    });

    it('should handle removing non-existent item', () => {
      expect(() => cart.removeItem('Laptop')).toThrow(
        'Item not found in cart'
      );
    });
  });

  describe('when checking out', () => {
    it('should process valid order', () => {
      const cart = new ShoppingCart();
      cart.addItem('Book', 29.99);

      const order = cart.checkout({
        name: 'John',
        address: '123 Main St',
        cardNumber: '4111111111111111'
      });

      expect(order.status).toBe('confirmed');
      expect(order.total).toBe(29.99);
    });

    it('should reject empty cart checkout', () => {
      const cart = new ShoppingCart();
      expect(() => cart.checkout({ name: 'John', address: '123 Main St' }))
        .toThrow('Cannot checkout empty cart');
    });
  });
});`,
        explanation:
          'describe/it blocks đọc như specifications. Nested describes cho context. it blocks cho expected behavior. BDD tests serve as living documentation.',
      },
      {
        title: 'BDD với Cucumber/Gherkin',
        code: `# features/user-registration.feature
Feature: User Registration
  As a new user
  I want to register for an account
  So that I can access the platform

  Scenario: Successful registration with valid data
    Given I am on the registration page
    When I fill in "Name" with "John Doe"
    And I fill in "Email" with "john@example.com"
    And I fill in "Password" with "SecurePass123!"
    And I click the "Register" button
    Then I should see "Welcome, John Doe!"
    And I should receive a confirmation email at "john@example.com"

  Scenario: Registration fails with weak password
    Given I am on the registration page
    When I fill in "Name" with "Jane Doe"
    And I fill in "Email" with "jane@example.com"
    And I fill in "Password" with "123"
    And I click the "Register" button
    Then I should see "Password must be at least 8 characters"
    And I should not be registered

  Scenario: Registration fails with existing email
    Given a user exists with email "existing@example.com"
    And I am on the registration page
    When I fill in "Name" with "New User"
    And I fill in "Email" with "existing@example.com"
    And I fill in "Password" with "SecurePass123!"
    And I click the "Register" button
    Then I should see "Email already registered"

  Scenario Outline: Password validation
    Given I am on the registration page
    When I fill in "Password" with "<password>"
    And I click the "Register" button
    Then I should see "<error>"

    Examples:
      | password         | error                              |
      | 123              | Password must be at least 8 chars  |
      | password         | Password must contain uppercase    |
      | PASSWORD123      | Password must contain lowercase    |
      | Password         | Password must contain number       |

// Step definitions
// tests/steps/registration.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the registration page', async function() {
  await this.page.goto('/register');
});

When('I fill in {string} with {string}', async function(field, value) {
  await this.page.fill(\`[data-testid="\${field.toLowerCase()}-input"]\`, value);
});

When('I click the {string} button', async function(button) {
  await this.page.click(\`[data-testid="\${button.toLowerCase()}-button"]\`);
});

Then('I should see {string}', async function(message) {
  await expect(this.page.locator('[data-testid="message"]')).toContainText(message);
});

Then('I should receive a confirmation email at {string}', async function(email) {
  const emailSent = await this.emailService.checkEmailSent(email);
  expect(emailSent).toBe(true);
});`,
        explanation:
          'Gherkin syntax cho non-technical stakeholders đọc hiểu. Scenario Outline cho data-driven tests. Step definitions map Gherkin sang code.',
      },
    ],
    relatedTerms: ['TDD', 'User Stories', 'Acceptance Criteria', 'Gherkin', 'Cucumber'],
    tags: ['bdd', 'behavior-driven-development', 'test', 'gherkin', 'cucumber'],
  },
  {
    id: 'test-8',
    term: 'Performance Testing',
    slug: 'performance-testing',
    category: 'Test',
    definition:
      'Performance Testing đánh giá speed, responsiveness, và stability của application dưới various loads. Xác định bottlenecks và đảm bảo system meets performance requirements.',
    details:
      '**Types of Performance Tests:**\n\n1. **Load Testing**: Normal expected load\n2. **Stress Testing**: Beyond normal load (breaking point)\n3. **Spike Testing**: Sudden traffic spikes\n4. **Endurance Testing**: Sustained load over time\n5. **Volume Testing**: Large data volumes\n\n**Key Metrics:**\n- **Response Time**: Time to respond to request\n- **Throughput**: Requests per second\n- **Latency**: Time to first byte\n- **Error Rate**: % failed requests\n- **Resource Usage**: CPU, Memory, Disk, Network\n\n**Performance Targets:**\n- **Response Time**: < 200ms (API), < 2s (page load)\n- **Throughput**: 1000+ req/s (depends on scale)\n- **Error Rate**: < 0.1%\n- **Availability**: 99.9% uptime\n\n**Tools:**\n- **k6**: Modern, developer-friendly (JS)\n- **Artillery**: Node.js-based, simple\n- **JMeter**: Legacy, GUI, Java\n- **Locust**: Python-based\n- **Gatling**: Scala-based, high performance',
    examples: [
      {
        title: 'Performance Testing với k6',
        code: `// load-test.js (k6 script)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Load test config
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 users
    { duration: '1m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 100 },  // Spike to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down
  ],

  // Thresholds (pass/fail criteria)
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function() {
  // Test API endpoint
  const res = http.get('https://api.example.com/users');

  // Check response
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has data': (r) => JSON.parse(r.body).length > 0,
  });

  sleep(1);
}

// Run k6
// k6 run load-test.js
// k6 run --vus=50 --duration=2m load-test.js

// Output:
// ✓ status is 200
#   ✓ response time < 500ms
#   ✓ has data
#
# http_req_duration..............: avg=245ms  min=120ms  med=230ms  max=890ms  p(90)=380ms  p(95)=450ms
# http_req_failed................: 0.5%
# iterations.....................: 1250
# vus............................: 100`,
        explanation:
          'k6 stages simulate user load patterns. Thresholds define pass/fail criteria. p(95) = 95th percentile response time.',
      },
      {
        title: 'API Performance Testing',
        code: `// tests/performance/api.perf.ts
import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  vus: 100,          // 100 virtual users
  duration: '5m',    // Run for 5 minutes
  thresholds: {
    'api_duration': ['p(95)<300'],
    'errors': ['rate<0.005'],
  },
};

// Test data
const testUsers = [
  { email: 'user1@test.com', token: 'token1' },
  { email: 'user2@test.com', token: 'token2' },
  // ... more users
];

export default function() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${testUsers[__VUS % testUsers.length].token}\`
  };

  // Group related requests
  group('User API', function() {
    // GET /api/users
    const getUsers = http.get('https://api.example.com/api/users', {
      headers
    });

    check(getUsers, {
      'get users: status 200': (r) => r.status === 200,
      'get users: fast response': (r) => r.timings.duration < 200,
    });

    // POST /api/users
    const createUser = http.post(
      'https://api.example.com/api/users',
      JSON.stringify({
        name: \`User \${__VUS}\`,
        email: \`user\${__VUS}@test.com\`
      }),
      { headers }
    );

    check(createUser, {
      'create user: status 201': (r) => r.status === 201,
      'create user: returns id': (r) => JSON.parse(r.body).id,
    });

    sleep(1);
  });

  group('Authentication', function() {
    // POST /api/auth/login
    const login = http.post(
      'https://api.example.com/api/auth/login',
      JSON.stringify({
        email: \`user\${__VUS}@test.com\`,
        password: 'password123'
      }),
      { headers }
    );

    check(login, {
      'login: status 200': (r) => r.status === 200,
      'login: returns token': (r) => JSON.parse(r.body).token,
    });
  });
}

// Analyze results
// k6 run --out json=results.json api.perf.ts
// Upload to k6 Cloud hoặc Grafana`,
        explanation:
          'group() organize related requests. __VUS = virtual user ID. Thresholds ensure performance meets requirements. JSON output cho analysis.',
      },
    ],
    relatedTerms: ['Load Testing', 'Stress Testing', 'k6', 'Latency', 'Throughput'],
    tags: ['performance-testing', 'load-testing', 'test', 'k6', 'benchmarking'],
  },
  {
    id: 'test-9',
    term: 'Snapshot Testing',
    slug: 'snapshot-testing',
    category: 'Test',
    definition:
      'Snapshot Testing capture và compare output của component/function với saved snapshot. Phát hiện unexpected changes trong UI hoặc data structures.',
    details:
      '**How it Works:**\n1. First run: Save snapshot of output\n2. Subsequent runs: Compare with saved snapshot\n3. If different: Test fails\n4. If change intentional: Update snapshot\n\n**Use Cases:**\n- React/Vue component rendering\n- API response shapes\n- Configuration objects\n- Error messages\n- Large data structures\n\n**Advantages:**\n- Catches unexpected changes\n- Easy to write (one line)\n- Good for regression detection\n- Visual diff on failure\n\n**Disadvantages:**\n- Brittle (breaks on any change)\n- Snapshot bloat (large files)\n- Developers auto-update snapshots\n- Doesn\'t verify correctness\n\n**Best Practices:**\n- Use for stable components\n- Review snapshot diffs carefully\n- Don\'t snapshot everything\n- Combine with unit tests\n- Keep snapshots small\n- Update snapshots intentionally',
    examples: [
      {
        title: 'Snapshot Testing với Jest',
        code: `import React from 'react';
import { render } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  test('renders user profile correctly', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg',
      role: 'admin',
      joinDate: '2024-01-01'
    };

    const { container } = render(<UserProfile user={user} />);

    // Snapshot entire rendered output
    expect(container).toMatchSnapshot();
  });

  test('renders loading state', () => {
    const { container } = render(<UserProfile loading={true} />);
    expect(container).toMatchSnapshot();
  });

  test('renders error state', () => {
    const { container } = render(<UserProfile error="Failed to load" />);
    expect(container).toMatchSnapshot();
  });
});

// First run: Creates __snapshots__/UserProfile.test.tsx.snap
// __snapshots__/UserProfile.test.tsx.snap
exports[\`UserProfile renders user profile correctly 1\`] = \`
<div class="user-profile">
  <img src="https://example.com/avatar.jpg" alt="John Doe" />
  <h2>John Doe</h2>
  <p>john@example.com</p>
  <span class="badge badge-admin">admin</span>
  <p class="join-date">Joined: 2024-01-01</p>
</div>
\`;

// Subsequent runs: Compare with snapshot
// If output changes → test fails
// Nếu change intentional: jest --updateSnapshot

// Inline snapshots (prettier formatted)
test('inline snapshot example', () => {
  const result = formatUser({ name: 'John', age: 30 });
  expect(result).toMatchInlineSnapshot(\`
    "User: John (30 years old)"
  \`);
});

// Property matchers (dynamic values)
test('snapshot with dynamic values', () => {
  const user = {
    id: expect.any(String),      // Match any string
    createdAt: expect.any(Date), // Match any Date
    name: 'John'
  };

  expect(user).toMatchSnapshot({
    id: expect.any(String),
    createdAt: expect.any(Date)
  });
});`,
        explanation:
          'toMatchSnapshot() save output lần đầu, compare lần sau. Inline snapshots dùng Prettier. Property matchers cho dynamic values (id, dates).',
      },
    ],
    relatedTerms: ['Unit Testing', 'React Testing', 'Regression Testing', 'Jest'],
    tags: ['snapshot-testing', 'test', 'jest', 'react', 'regression'],
  },
  {
    id: 'test-10',
    term: 'Continuous Testing trong CI/CD',
    slug: 'continuous-testing-cicd',
    category: 'Test',
    definition:
      'Continuous Testing là practice chạy automated tests liên tục trong CI/CD pipeline. Đảm bảo code changes không break existing functionality trước khi deploy.',
    details:
      '**CI/CD Pipeline Stages:**\n```\nCode → Lint → Unit Tests → Integration Tests → Build → E2E Tests → Deploy → Smoke Tests\n```\n\n**Test Execution Strategy:**\n1. **Pre-commit**: Lint, type-check, fast unit tests\n2. **PR/MR**: All unit tests, integration tests\n3. **Merge to main**: Full test suite + E2E\n4. **Pre-deploy**: Smoke tests, performance tests\n5. **Post-deploy**: Monitoring, health checks\n\n**Best Practices:**\n- Fast feedback (< 10 min for unit tests)\n- Parallel test execution\n- Fail fast (run fast tests first)\n- Flaky test management\n- Test result reporting\n- Coverage thresholds\n\n**Flaky Tests:**\n- Tests that pass/fail inconsistently\n- Caused by: timing, race conditions, external deps\n- Solutions: retries, better isolation, fix root cause\n\n**Tools:**\n- **GitHub Actions**: Native CI for GitHub\n- **Jenkins**: Self-hosted, customizable\n- **CircleCI**: Cloud-based\n- **GitLab CI**: Integrated with GitLab',
    examples: [
      {
        title: 'GitHub Actions CI/CD với Tests',
        code: `# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Stage 1: Fast feedback
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npx tsc --noEmit

  # Stage 2: Unit Tests (parallel)
  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    strategy:
      matrix:
        shard: [1, 2, 3, 4]  # Parallel shards
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Unit Tests (Shard \${{ matrix.shard }})
        run: npx jest --shard=\${{ matrix.shard }}/4 --coverage
        env:
          CI: true

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unit-tests

  # Stage 3: Integration Tests
  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Run Migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test_db

      - name: Integration Tests
        run: npx jest --testPathPattern=integration
        env:
          CI: true
          DATABASE_URL: postgres://postgres:test@localhost:5432/test_db

  # Stage 4: E2E Tests
  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: E2E Tests
        run: npx playwright test
        env:
          CI: true
          BASE_URL: http://localhost:3000

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  # Stage 5: Deploy (only on main branch)
  deploy:
    runs-on: ubuntu-latest
    needs: e2e-tests
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Production
        run: |
          echo "Deploying..."
          # Deploy commands here

      - name: Smoke Tests
        run: |
          curl -f https://myapp.com/health || exit 1
          curl -f https://myapp.com/api/ping || exit 1`,
        explanation:
          'CI pipeline: lint → unit (parallel) → integration → E2E → deploy. Sharding speeds up tests. Coverage upload to Codecov. Smoke tests post-deploy.',
      },
      {
        title: 'Handling Flaky Tests',
        code: `// jest.config.js
module.exports = {
  // Retry flaky tests
  retries: 2,

  // Fail fast on CI
  bail: 1,  // Stop after 1 failure

  // Test timeout
  testTimeout: 10000,

  // Report flaky tests
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'reports' }]
  ]
};

// Retry specific test
test('flaky API test', async () => {
  await retry(async () => {
    const response = await fetch('https://api.example.com/data');
    expect(response.status).toBe(200);
  }, { times: 3 });
});

// Retry wrapper
async function retry(fn, { times = 3, delay = 1000 }) {
  let lastError;
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(\`Attempt \${i + 1} failed, retrying...\`);
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
  throw lastError;
}

// CircleCI config với retries
# .circleci/config.yml
version: 2.1
jobs:
  test:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run:
          name: Install dependencies
          command: npm ci
      - run:
          name: Run tests
          command: npm test
          # Retry flaky tests
          when: always
      - run:
          name: Retry failed tests
          command: npx jest --onlyFailures --retry=3
          when: on_fail`,
        explanation:
          'Flaky tests retry tự động nhưng nên fix root cause. Jest retries, CircleCI retry. Track flaky tests để prioritize fixes.',
      },
    ],
    relatedTerms: ['CI/CD', 'GitHub Actions', 'Pipeline', 'Flaky Tests', 'Code Coverage'],
    tags: ['continuous-testing', 'cicd', 'test', 'automation', 'github-actions'],
  },
  {
    id: 'test-11',
    term: 'Accessibility Testing (a11y)',
    slug: 'accessibility-testing',
    category: 'Test',
    definition:
      'Accessibility Testing đảm bảo application usable bởi people với disabilities. Cover screen readers, keyboard navigation, color contrast, và WCAG compliance.',
    details:
      '**WCAG Guidelines:**\n- **Perceivable**: Information must be presentable\n- **Operable**: UI components must be operable\n- **Understandable**: Information must be understandable\n- **Robust**: Content must be interpretable by assistive tech\n\n**WCAG Levels:**\n- **A**: Minimum (legal requirement)\n- **AA**: Standard (most organizations)\n- **AAA**: Enhanced (specialized content)\n\n**Common Issues:**\n- Missing alt text on images\n- Insufficient color contrast\n- No keyboard navigation\n- Missing ARIA labels\n- Form inputs without labels\n- Auto-playing media\n\n**Testing Methods:**\n- Automated tools (axe, Lighthouse)\n- Manual testing (keyboard, screen reader)\n- User testing with disabled people\n\n**Tools:**\n- **axe-core**: Automated accessibility testing\n- **jest-axe**: Jest integration\n- **Lighthouse**: Chrome DevTools\n- **pa11y**: CI/CD integration',
    examples: [
      {
        title: 'Accessibility Testing với jest-axe',
        code: `import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoginForm } from './LoginForm';

expect.extend(toHaveNoViolations);

describe('LoginForm Accessibility', () => {
  test('has no accessibility violations', async () => {
    const { container } = render(<LoginForm />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('form inputs have labels', async () => {
    const { getByLabelText } = render(<LoginForm />);

    // Inputs phải có label
    expect(getByLabelText(/email/i)).toBeInTheDocument();
    expect(getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('buttons are keyboard accessible', async () => {
    const { getByRole } = render(<LoginForm />);

    const button = getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');

    // Simulate keyboard
    button.focus();
    expect(button).toHaveFocus();
  });

  test('error messages announced to screen readers', async () => {
    const { getByRole, container } = render(<LoginForm />);

    // Submit with invalid data
    const button = getByRole('button');
    button.click();

    // Error should have aria-live
    const error = container.querySelector('[aria-live="polite"]');
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent(/invalid email/i);
  });
});

// Manual accessibility checklist
// ✓ All images have alt text
// ✓ Forms have labels
// ✓ Sufficient color contrast (4.5:1 for text)
// ✓ Keyboard navigation works
// ✓ Focus indicators visible
// ✓ ARIA roles correct
// ✓ Screen reader announcements
// ✓ No content that flashes (seizures)
// ✓ Page has one h1`,
        explanation:
          'jest-axe tự động detect a11y violations. Form inputs phải có labels. Error messages dùng aria-live cho screen readers.',
      },
    ],
    relatedTerms: ['E2E Testing', 'WCAG', 'Screen Readers', 'ARIA', 'Inclusive Design'],
    tags: ['accessibility', 'a11y', 'test', 'wcag', 'inclusive'],
  },
]
