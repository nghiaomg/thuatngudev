import type { GlossaryTerm } from '../types'

export const typescriptTerms: GlossaryTerm[] = [
  {
    id: 'ts-1',
    term: 'TypeScript Generic',
    slug: 'typescript-generic',
    category: 'TypeScript',
    definition:
      'Generic cho phép viết code có thể tái sử dụng với nhiều kiểu dữ liệu khác nhau, đồng thời vẫn giữ nguyên type safety (an toàn kiểu) tại thời điểm biên dịch.',
    details:
      'Generic sử dụng type parameters (tham số kiểu), thường ký hiệu là `T`, để đại diện cho kiểu dữ liệu sẽ được xác định khi sử dụng.\n\n**Cú pháp:**\n- `function func<T>(arg: T): T` - Generic function\n- `interface Box<T>` - Generic interface\n- `class Container<T>` - Generic class\n- `type Pair<K, V>` - Generic type alias\n\n**Constraints (ràng buộc):**\nDùng `extends` để giới hạn kiểu:\n`function longest<T extends { length: number }>(a: T, b: T): T`',
    examples: [
      {
        title: 'Generic Function cơ bản',
        code: `// Function không generic - mất type safety
function identity(arg: any): any {
  return arg;
}

// Function với generic - giữ type safety
function identity<T>(arg: T): T {
  return arg;
}

const num = identity(42);       // T = number
const str = identity('hello');   // T = string
const arr = identity([1, 2, 3]); // T = number[]

// Explicit type
const bool = identity<boolean>(true);`,
        explanation:
          'Generic cho phép function hoạt động với mọi kiểu, nhưng TypeScript vẫn biết chính xác kiểu của argument và return value, giúp IntelliSense hoạt động đúng.',
      },
      {
        title: 'Generic Interface và Class',
        code: `// Generic Interface
interface Response<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
}

// Sử dụng
const userResponse: Response<User> = {
  data: { id: 1, name: 'John' },
  status: 200,
  message: 'Success'
};

// Generic Class
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);`,
        explanation:
          'Generic interface và class cho phép tạo cấu trúc dữ liệu type-safe. Stack<T> có thể dùng cho number, string, hay bất kỳ kiểu nào với đầy đủ type checking.',
      },
      {
        title: 'Generic với Constraints',
        code: `// Ràng buộc generic phải có thuộc tính length
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

getLength('hello');      // OK: string có length
getLength([1, 2, 3]);    // OK: array có length
getLength({ length: 5 }); // OK: object có length
// getLength(123);        // Error: number không có length

// Generic với keyof
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: 'John', age: 30 };
const name = getProperty(user, 'name'); // type: string
const age = getProperty(user, 'age');   // type: number
// getProperty(user, 'email');           // Error: không tồn tại`,
        explanation:
          "Constraints dùng 'extends' để giới hạn kiểu generic. 'keyof' dùng để giới hạn key hợp lệ, đảm bảo chỉ truyền key thực sự tồn tại trong object.",
      },
    ],
    relatedTerms: ['TypeScript Interface', 'TypeScript Type', 'Union Types', 'Type Inference'],
    tags: ['generics', 'type-safety', 'reusability', 'polymorphism'],
  },
  {
    id: 'ts-2',
    term: 'TypeScript Interface',
    slug: 'typescript-interface',
    category: 'TypeScript',
    definition:
      'Interface trong TypeScript định nghĩa cấu trúc (shape) của một object — khai báo các properties và methods mà một object phải có, giúp type-checking tại compile-time.',
    details:
      '**Interface vs Type Alias:**\n- Interface mở rộng được (declaration merging)\n- Interface dùng cho object shapes\n- Type Alias linh hoạt hơn (union, intersection)\n\n**Tính năng nâng cao:**\n- `readonly` - Thuộc tính chỉ đọc\n- `?` - Thuộc tính optional\n- `extends` - Kế thừa từ interface khác\n- Index signatures - Thuộc tính động\n\n**Class Implements:**\n`class User implements Person`\n\n**Interface Declaration Merging:**\nNhiều interface cùng tên sẽ merge.',
    examples: [
      {
        title: 'Interface cơ bản',
        code: `interface User {
  id: number;
  name: string;
  email: string;
  age?: number;        // Optional
  readonly createdAt: Date; // Chỉ đọc
}

// Sử dụng
const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  createdAt: new Date(),
};

// Error: missing required field
// const bad: User = { name: 'John' };

// Error: cannot assign to readonly
// user.createdAt = new Date();`,
        explanation:
          'Interface định nghĩa contract cho object. Required fields phải có, optional (?) có thể bỏ qua, readonly không thể gán lại sau khi tạo.',
      },
      {
        title: 'Interface kế thừa và extends',
        code: `interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

interface GuideDog extends Dog {
  certifications: string[];
}

const buddy: GuideDog = {
  name: 'Buddy',
  breed: 'Golden Retriever',
  certifications: ['guide', 'therapy'],
};

// Multiple inheritance
interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

interface Persistable extends Serializable, Loggable {
  save(): void;
}

// Extending from array/object index signatures
interface StringMap {
  [key: string]: string;
  name: string; // Specific required field
}

const map: StringMap = {
  name: 'John',
  role: 'admin', // Dynamic keys allowed
};`,
        explanation:
          'Interface có thể extends nhiều interfaces khác (multiple inheritance). Index signature cho phép thêm properties động với type nhất quán.',
      },
      {
        title: 'Class Implements Interface',
        code: `interface Shape {
  area(): number;
  perimeter(): number;
}

interface Colorable {
  color: string;
}

abstract class Polygon implements Shape {
  abstract area(): number;
  abstract perimeter(): number;
}

class Rectangle extends Polygon {
  constructor(
    public width: number,
    public height: number
  ) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

class ColoredRectangle extends Rectangle implements Colorable {
  constructor(
    width: number,
    height: number,
    public color: string
  ) {
    super(width, height);
  }
}

const rect = new ColoredRectangle(10, 5, 'red');
console.log(rect.area()); // 50
console.log(rect.color);  // red`,
        explanation:
          'class implements interface phải cung cấp tất cả properties và methods đã định nghĩa. Có thể implements nhiều interfaces. TypeScript check tại compile-time.',
      },
    ],
    relatedTerms: ['TypeScript Type', 'TypeScript Generic', 'Union Types', 'Duck Typing'],
    tags: ['interface', 'types', 'oop', 'contracts'],
  },
  {
    id: 'ts-3',
    term: 'Union Types',
    slug: 'union-types',
    category: 'TypeScript',
    definition:
      'Union Types cho phép một biến có thể là một trong nhiều kiểu khác nhau, khai báo bằng dấu `|` giữa các kiểu. Giúp mô hình hóa các giá trị có thể có nhiều dạng khác nhau.',
    details:
      '**Cú pháp:** `type A | B | C`\n\n**Discriminated Unions:**\nDùng một property chung (discriminant) để TypeScript xác định type cụ thể.\n\n**Type Guards:**\n- `typeof` - cho primitive types\n- `instanceof` - cho classes\n- Custom type predicates\n\n**Các utility types liên quan:**\n- `Extract<T, U>` - Lấy type trong union\n- `Exclude<T, U>` - Loại type khỏi union\n- `NonNullable<T>` - Loại null/undefined\n- `Partial<T>`, `Required<T>`\n- `Pick<T, K>`, `Omit<T, K>`',
    examples: [
      {
        title: 'Union Types cơ bản',
        code: `// Primitive union
type StringOrNumber = string | number;

function printId(id: StringOrNumber) {
  console.log('ID:', id);
}

printId(123);    // OK
printId('abc');   // OK
// printId(true); // Error

// Union với literal types
type Status = 'pending' | 'approved' | 'rejected';

function handleStatus(status: Status) {
  switch (status) {
    case 'pending': return 'Đang xử lý';
    case 'approved': return 'Đã duyệt';
    case 'rejected': return 'Từ chối';
  }
}

// Nullable types
type MaybeUser = User | null;

// Multiple types
function processInput(value: string | number | boolean) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // TypeScript biết là string
  }
  if (typeof value === 'number') {
    return value * 2; // TypeScript biết là number
  }
  return !value; // boolean
}`,
        explanation:
          'Union type cho phép nhiều possible types. TypeScript dùng type narrowing (if/typeof) để xác định type cụ thể trong block, IntelliSense hoạt động đầy đủ.',
      },
      {
        title: 'Discriminated Unions',
        code: `// Discriminant property
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
  }
}

// API Response pattern
type ApiResponse<T> =
  | { status: 'success'; data: T; timestamp: number }
  | { status: 'error'; message: string; code: number }
  | { status: 'loading' };

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.status === 'success') {
    console.log(response.data); // TypeScript biết T
    console.log(response.timestamp);
  } else if (response.status === 'error') {
    console.error(response.message); // TypeScript biết message
    console.error(response.code);
  } else {
    console.log('Loading...'); // loading state
  }
}`,
        explanation:
          'Discriminated unions dùng common property (kind/status) làm discriminant. TypeScript exhaustiveness checking đảm bảo handle mọi case. Rất phổ biến trong Redux/State management.',
      },
      {
        title: 'Type Guards và Utility Types',
        code: `// Custom Type Guard
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // OK - value is string
  }
}

// keyof với union
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Extract và Exclude
type AllStatus = 'pending' | 'approved' | 'rejected' | 'draft';
type ActiveStatus = Extract<AllStatus, 'pending' | 'approved'>;
// 'pending' | 'approved'

type InactiveStatus = Exclude<AllStatus, 'pending' | 'approved'>;
// 'rejected' | 'draft'

// NonNullable
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// Pick và Omit
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

type PublicUser = Omit<User, 'password' | 'createdAt'>;
type UserPreview = Pick<User, 'id' | 'name'>;`,
        explanation:
          'Type guards giúp TypeScript narrow type trong conditional blocks. Extract/Exclude lọc union. Pick/Omit tạo type mới từ existing type mà không thay đổi type gốc.',
      },
    ],
    relatedTerms: ['TypeScript Interface', 'TypeScript Type', 'Type Inference', 'Type Narrowing'],
    tags: ['union', 'types', 'polymorphism', 'type-safety'],
  },
  {
    id: 'ts-4',
    term: 'Type Inference',
    slug: 'type-inference',
    category: 'TypeScript',
    definition:
      'Type Inference là khả năng của TypeScript tự động suy luận kiểu dữ liệu của biến, return type của function, hay cấu trúc object mà không cần khai báo tường minh.',
    details:
      '**Khi nào TypeScript infer \\`infer\\`:**\n1. Khởi tạo biến với giá trị\n2. Return type của function\n3. Default parameters\n4. Array/object literals\n5. Type predicates (return type của guard function)\n\n**Best practices:**\n- Để TypeScript infer khi có thể — code gọn hơn\n- Khai báo tường minh khi: public API, ambiguous types, generic functions phức tạp\n\n**Type Annotation vs Inference:**\n- Annotation: \\`let name: string = \'John\'\`\n- Inference: \\`let name = \'John\'\` (infer là string)',
    examples: [
      {
        title: 'Type Inference cơ bản',
        code: `// TypeScript tự infer kiểu từ giá trị gán
let name = 'John';      // infer: string
let age = 25;           // infer: number
let isActive = true;    // infer: boolean

// name = 123; // Error: Type 'number' is not assignable to 'string'

// Array
const nums = [1, 2, 3];       // infer: number[]
const mixed = [1, 'two', true]; // infer: (string | number | boolean)[]

// Object literal
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
};
// infer: { id: number; name: string; email: string }`,
        explanation:
          'TypeScript quan sát giá trị được gán và suy ra kiểu. Không cần khai báo `let name: string`, TypeScript tự biết là string.',
      },
      {
        title: 'Function Return Type Inference',
        code: `// Return type được infer từ return statement
function add(a: number, b: number) {
  return a + b; // infer: number
}

// Explicit return type khi cần
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Infer từ conditional
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // infer: string
  }
  return value * 2; // infer: number
}

// Generic inference
function first<T>(arr: T[]): T | undefined {
  return arr[0]; // infer: T
}

const num = first([1, 2, 3]);   // infer: number | undefined
const str = first(['a', 'b']);   // infer: string | undefined`,
        explanation:
          'TypeScript infer return type từ các return statements. Nếu có nhiều branches với types khác nhau, union type được infer. Generic inference suy ra T từ argument.',
      },
    ],
    relatedTerms: ['TypeScript Type', 'TypeScript Interface', 'Type Annotation', 'Type Safety'],
    tags: ['inference', 'types', 'type-safety', 'typescript'],
  },
  {
    id: 'ts-5',
    term: 'Utility Types',
    slug: 'utility-types',
    category: 'TypeScript',
    definition:
      'Utility Types là các generic types có sẵn trong TypeScript (`Partial`, `Required`, `Omit`, `Pick`, `Record`, ...) giúp biến đổi và tạo type mới từ existing types một cách nhanh chóng.',
    details:
      '**Transforming Types:**\n- `Partial<T>` - Tất cả fields thành optional\n- `Required<T>` - Tất cả fields thành required\n- `Readonly<T>` - Tất cả fields thành readonly\n- `Record<K, V>` - Tạo object type với keys K và values V\n\n**Picking/Omitting:**\n- `Pick<T, K>` - Chọn fields K từ T\n- `Omit<T, K>` - Loại bỏ fields K khỏi T\n\n**Extracting Types:**\n- `Extract<T, U>` - Lấy types trong T assignable cho U\n- `Exclude<T, U>` - Loại types trong T assignable cho U\n\n**Conditional + Mapped:**\n- `NonNullable<T>` - Loại null và undefined\n- `ReturnType<T>` - Lấy return type của function',
    examples: [
      {
        title: 'Partial, Required, Readonly',
        code: `interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

// Partial - tất cả fields thành optional
type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number }

// Required - tất cả fields thành required
type CompleteUser = Required<User>;

// Readonly - không thể gán lại
type FrozenUser = Readonly<User>;
// const user: FrozenUser = { ... };
// user.name = 'New'; // Error: Cannot assign to 'name'

// Partial với ví dụ update function
async function updateUser(
  id: number,
  data: Partial<User>
): Promise<User> {
  const existing = await db.user.findUnique({ where: { id } });
  return db.user.update({
    where: { id },
    data: { ...existing, ...data },
  });
}

// React useState pattern
const [user, setUser] = useState<User | null>(null);
// Update với Partial
setUser(prev => prev ? { ...prev, name: 'New Name' } : null);`,
        explanation:
          'Partial<T> rất hữu ích cho update functions — chỉ cần truyền fields muốn thay đổi. Required<T> ngược lại, bắt buộc tất cả fields.',
      },
      {
        title: 'Pick, Omit, Record',
        code: `interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  role: 'admin' | 'user';
}

// Pick - chọn fields
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit - loại bỏ fields
type PublicUser = Omit<User, 'password' | 'createdAt'>;

// Nested Omit
type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;
// { name: string; email: string; password: string; age?: number; role: ... }

// Record - tạo object type
type UserRole = 'admin' | 'editor' | 'viewer';

const permissions: Record<UserRole, string[]> = {
  admin: ['read', 'write', 'delete', 'manage'],
  editor: ['read', 'write'],
  viewer: ['read'],
};

// Record với API response
type ApiResponse<T> = Record<'data' | 'error', T>;

const success: ApiResponse<User> = {
  data: { id: 1, name: 'John', email: 'j@x.com', password: 'x', createdAt: new Date(), role: 'user' },
};
const fail: ApiResponse<string> = { error: 'Not found' };`,
        explanation:
          'Pick/Omit giúp tạo DTOs (Data Transfer Objects) cho API. Record<K,V> tạo map/object type với keys và values cụ thể.',
      },
      {
        title: 'ReturnType, Parameters, NonNullable',
        code: `function createUser(name: string, email: string, age?: number) {
  return {
    id: crypto.randomUUID(),
    name,
    email,
    age,
    createdAt: new Date(),
  };
}

// Lấy return type
type User = ReturnType<typeof createUser>;
// { id: string; name: string; email: string; age?: number; createdAt: Date }

// Lấy parameter types
type CreateUserParams = Parameters<typeof createUser>;
// [name: string, email: string, age?: number]

// Dùng để tạo update function
type UpdateUserParams = Partial<Parameters<typeof createUser>[0]>;

// NonNullable
type MaybeUser = {
  name: string | null;
  email: string | undefined;
};

type DefiniteUser = {
  [K in keyof MaybeUser]-?: NonNullable<MaybeUser[K]>;
};
// { name: string; email: string }

// Infer từ class constructor
class UserService {
  constructor(
    public name: string,
    private apiKey: string
  ) {}

  async getUser(id: string) { return {}; }
}

type ServiceConfig = ConstructorParameters<typeof UserService>;
// [name: string, apiKey: string]`,
        explanation:
          'ReturnType và Parameters lấy type từ function signature. NonNullable loại bỏ null/undefined. ConstructorParameters tương tự nhưng cho class constructors.',
      },
    ],
    relatedTerms: ['TypeScript Type', 'TypeScript Interface', 'Type Inference', 'Generic Types'],
    tags: ['utility-types', 'generics', 'typescript', 'types'],
  },
  {
    id: 'ts-6',
    term: 'Type Narrowing',
    slug: 'type-narrowing',
    category: 'TypeScript',
    definition:
      'Type Narrowing là kỹ thuật thu hẹp type của một biến trong conditional blocks, giúp TypeScript hiểu chính xác kiểu dữ liệu và cung cấp IntelliSense đầy đủ.',
    details:
      '**Các kỹ thuật Narrowing phổ biến:**\n1. `typeof` - cho primitive types (string, number, boolean)\n2. `instanceof` - cho class instances\n3. `in` - kiểm tra property tồn tại trong object\n4. `Array.isArray()` - kiểm tra array\n5. `truthiness` - kiểm tra giá trị truthy/falsy\n6. **Discriminated Unions** - dùng common property\n\n**Type Predicates:**\n`function isString(val: unknown): val is string`\n\n**Assertion Functions:**\n`function assertIsString(val: unknown): asserts val is string`',
    examples: [
      {
        title: 'typeof và instanceof Narrowing',
        code: `function processInput(value: string | number | boolean | null) {
  // typeof narrowing
  if (typeof value === 'string') {
    return value.toUpperCase(); // TypeScript: value is string
  }
  if (typeof value === 'number') {
    return value * 2; // TypeScript: value is number
  }
  if (typeof value === 'boolean') {
    return !value; // TypeScript: value is boolean
  }

  // null check
  if (value === null) {
    return 'null value';
  }

  // Exhaustiveness check
  const _exhaustive: never = value;
}

// instanceof narrowing
function printDate(date: Date | string) {
  if (date instanceof Date) {
    console.log(date.toISOString()); // date is Date
  } else {
    console.log(date); // date is string
  }
}

// Array narrowing
function printFirst(items: string[] | number[]) {
  if (Array.isArray(items)) {
    console.log(items[0]); // items is array
  } else {
    console.log(items); // items is primitive
  }
}`,
        explanation:
          'typeof, instanceof, Array.isArray() là các type guards tự nhiên của JavaScript. TypeScript tự động narrow type trong các nhánh if.',
      },
      {
        title: 'Type Predicates và Assertion Functions',
        code: `// Type Predicate - tra ve val is T
interface Cat {
  meow(): void;
}

interface Dog {
  bark(): void;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function makeSound(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // TypeScript biết là Cat
  } else {
    animal.bark(); // TypeScript biết là Dog
  }
}

// Assertion Function - throw nếu không đúng
function assertIsString(
  val: unknown
): asserts val is string {
  if (typeof val !== 'string') {
    throw new Error(\`Expected string, got \${typeof val}\`);
  }
}

function process(value: unknown) {
  assertIsString(value); // Sau dòng này, value là string
  console.log(value.toUpperCase());
}

// Kết hợp với unknown (thay vì any)
async function parseJSON<T>(json: string): Promise<T> {
  try {
    const value = JSON.parse(json);
    return value as T;
  } catch {
    throw new Error('Invalid JSON');
  }
}`,
        explanation:
          'Type predicates `val is T` return boolean, TypeScript dùng nó để narrow trong if block. Assertion functions `asserts val is T` throw error thay vì return boolean.',
      },
      {
        title: 'Discriminated Unions và Exhaustive Checks',
        code: `// Discriminated Union - dùng literal làm discriminant
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number }
  | { kind: 'square'; side: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    case 'square':
      return shape.side ** 2;
    default:
      // Exhaustive check - TypeScript báo lỗi nếu thiếu case
      const _exhaustive: never = shape;
      throw new Error('Unknown shape');
  }
}

// Dùng type predicate với discriminated union
function isCircle(shape: Shape): shape is { kind: 'circle'; radius: number } {
  return shape.kind === 'circle';
}

// Dùng in operator
function hasRadius(shape: Shape): shape is Shape & { radius: number } {
  return 'radius' in shape;
}`,
        explanation:
          'Discriminated unions dùng literal property (kind) làm discriminant, TypeScript exhaustiveness checking đảm bảo xử lý mọi case. Thêm case mới mà không cập nhật switch = compile error.',
      },
    ],
    relatedTerms: ['Union Types', 'Type Inference', 'TypeScript Interface', 'Type Guards'],
    tags: ['narrowing', 'type-safety', 'typescript', 'types'],
  },
  {
    id: 'ts-7',
    term: 'TypeScript Mapped Types',
    slug: 'mapped-types',
    category: 'TypeScript',
    definition:
      'Mapped Types là type transformation cho phép tạo type mới bằng cách duyệt qua các keys của một type khác, biến đổi mỗi property theo quy tắc định nghĩa.',
    details:
      '**Cú pháp cơ bản:**\n`type MappedType<T> = { [P in keyof T]: Transformation }`\n\n**Modifiers:**\n- `readonly` - Thêm readonly vào properties\n- `?` - Loại bỏ optional modifier\n- `-readonly` / `-?` - Loại bỏ modifiers\n\n**Builtin Mapped Types:**\n- `Partial<T>` = `{ [P in keyof T]?: T[P] }`\n- `Required<T>` = `{ [P in keyof T]-?: T[P] }`\n- `Readonly<T>` = `{ readonly [P in keyof T]: T[P] }`\n\n**Key Remapping:**\n- `as` clause để đổi tên keys\n- Kết hợp với conditional types',
    examples: [
      {
        title: 'Basic Mapped Types',
        code: `interface Person {
  name: string;
  age: number;
  email: string;
}

// Mapped type - tất cả properties thành optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Mapped type - tất cả properties thành readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Mapped type - tất cả properties thành required
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Ví dụ sử dụng
type PartialPerson = Partial<Person>;
// { name?: string; age?: number; email?: string }

type ReadonlyPerson = Readonly<Person>;
// { readonly name: string; readonly age: number; readonly email: string }

// Custom Mapped Type - loại bỏ certain properties
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type PersonPreview = Pick<Person, 'name' | 'age'>;
// { name: string; age: number }`,
        explanation:
          'Mapped Types duyệt qua keyof T (tất cả keys). [P in keyof T] tạo property mới với transformation. Built-in types như Partial, Required, Pick đều implement bằng mapped types.',
      },
      {
        title: 'Key Remapping và Filter Keys',
        code: `interface Config {
  database: { host: string; port: number };
  api: { url: string; timeout: number };
  debug: boolean;
}

// Remap keys - thêm prefix
type PrefixedConfig = {
  [P in keyof Config as \`get\${Capitalize<string & P>\`]: Config[P];
};
// { getDatabase: ...; getApi: ...; getDebug: ... }

// Filter keys - loại bỏ certain keys
type NoFunctions<T> = {
  [P in keyof T as T[P] extends Function ? never : P]: T[P];
};

// Filter keys bằng conditional
type StringOnly<T> = {
  [P in keyof T as string extends T[P] ? P : never]: T[P];
};

// Ví dụ: tạo type cho API response keys
type APIRoutes = {
  '/users': { get: () => User[]; post: (u: User) => User };
  '/posts': { get: () => Post[] };
};

// Chỉ lấy GET routes
type GETRoutes<T> = {
  [P in keyof T as \`GET \${string & P}\`]: {
    get: T[P]['get'];
  };
};

type GETAPI = GETRoutes<APIRoutes>;
// { 'GET /users': { get: () => User[] }; 'GET /posts': { get: () => Post[] } }`,
        explanation:
          'Key remapping với `as` clause cho phép filter và transform keys. `never` filter loại bỏ key. Conditional `as` cho phép key-dependent transformation.',
      },
      {
        title: 'Template Literal Types',
        code: `// Template literal type cho event handlers
type PropEventSource<T> = {
  on<K extends string & keyof T>(
    eventName: \`\${K}Changed\`,
    callback: (newValue: T[K]) => void
  ): void;
};

// Tạo type với template literals
type EmailLocaleIDs = 'welcome_email' | 'email_heading';
type FooterLocaleIDs = 'footer_title' | 'footer_sendoff';

type AllLocaleIDs = \`\${EmailLocaleIDs | FooterLocaleIDs}\`;
// 'welcome_email' | 'email_heading' | 'footer_title' | 'footer_sendoff'

// Uppercase letters
type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

interface Data {
  name: string;
  age: number;
  active: boolean;
}

type StringKeys = KeysOfType<Data, string>;  // 'name'
type NumberKeys = KeysOfType<Data, number>;  // 'age'
type BooleanKeys = KeysOfType<Data, boolean>; // 'active'`,
        explanation:
          'Template literal types cho phép tạo strings với pattern cụ thể. Kết hợp với mapped types để tạo event systems hoặc utility types phức tạp.',
      },
    ],
    relatedTerms: ['TypeScript Utility Types', 'TypeScript Interface', 'TypeScript Type', 'Conditional Types'],
    tags: ['mapped-types', 'generics', 'transformation', 'typescript'],
  },
  {
    id: 'ts-8',
    term: 'TypeScript Decorators',
    slug: 'typescript-decorators',
    category: 'TypeScript',
    definition:
      'Decorators là expressions gắn metadata và behavior vào declarations (classes, methods, properties, parameters) thông qua @symbol syntax, được sử dụng rộng rãi trong Angular, NestJS, TypeORM.',
    details:
      '**Decorator Types:**\n1. **Class Decorators** - `@Sealed`, `@Injectable`\n2. **Method Decorators** - `@Get`, `@Post`, `@Cache`\n3. **Property Decorators** - `@Column`, `@Input`\n4. **Parameter Decorators** - `@Body`, `@Query`\n\n**Signature:**\n```typescript\ntype ClassDecorator = <T extends Function>(target: T) => T | void\ntype MethodDecorator = (target: Object, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor\n```\n\n**Metadata Reflection:**\n`Reflect.metadata()` lưu trữ metadata để đọc sau\n\n**Experimental Features:**\nDecorators cần `experimentalDecorators: true` trong tsconfig',
    examples: [
      {
        title: 'Class và Method Decorators',
        code: `// Class Decorator
function Sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

// Class Decorator với factory
function logger(prefix: string) {
  return function(constructor: Function) {
    const original = constructor.prototype.constructor;
    constructor.prototype.constructor = function(...args: any[]) {
      console.log(\`\${prefix}: Creating instance...\`);
      return original.apply(this, args);
    };
  };
}

// Method Decorator
function ReadOnly(target: any, key: string, descriptor: PropertyDescriptor) {
  descriptor.writable = false;
  return descriptor;
}

@Sealed
@logger('APP')
class User {
  constructor(
    public name: string,
    public email: string
  ) {}

  @ReadOnly
  getId() {
    return this.email;
  }

  @Log
  updateEmail(newEmail: string) {
    this.email = newEmail;
  }
}

// Property Decorator
function UpperCase(target: any, key: string) {
  let value = target[key];

  const getter = () => value.toUpperCase();
  const setter = (v: string) => { value = v; };

  Object.defineProperty(target, key, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true,
  });
}

class Person {
  @UpperCase
  name = 'john doe';
}`,
        explanation:
          'Decorators nhận target (class/prototype) và metadata. Class decorator chạy khi class được định nghĩa. Method decorator nhận thêm descriptor để modify property. Property decorator dùng Object.defineProperty.',
      },
      {
        title: 'Decorator trong NestJS',
        code: `import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';

// Custom decorator
export const Roles = (...roles: string[]) =>
  SetMetadata('roles', roles);

// Guard decorator
@Controller('users')
export class UsersController {
  @Get()
  @Roles('admin', 'user')
  findAll(@Query('page') page: number) {
    return \`Users page \${page}\`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return \`User \${id}\`;
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() createUserDto: any) {
    return createUserDto;
  }
}

// Parameter decorators
function CurrentUser(user: any) {
  return createParamDecorator(
    (data, ctx) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    }
  )();
}

// Sử dụng
@Get('profile')
getProfile(@CurrentUser() user: any) {
  return user;
}`,
        explanation:
          'NestJS dùng decorators cho routing, validation, guards. @Controller() define routes prefix. @Get/@Post/@UseGuards attach behaviors. Custom decorators tạo reusable abstractions.',
      },
      {
        title: 'Metadata Reflection',
        code: `import 'reflect-metadata';

const METADATA_KEY = 'custom:metadata';

// Define metadata decorator
function Metadata(key: string, value: any) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(METADATA_KEY, value, target, propertyKey);
  };
}

// Read metadata
function getMetadata(target: any, propertyKey: string): any {
  return Reflect.getMetadata(METADATA_KEY, target, propertyKey);
}

// Sử dụng
class UserService {
  @Metadata('version', '1.0')
  @Metadata('author', 'John Doe')
  getUser(id: string) {
    return { id, name: 'John' };
  }

  @Metadata('deprecated', true)
  legacyMethod() {
    console.log('This method is deprecated');
  }
}

// Đọc metadata
const methods = ['getUser', 'legacyMethod'];
methods.forEach(method => {
  const version = getMetadata(UserService.prototype, method);
  console.log(\`\${method} version:\`, version);

  const deprecated = getMetadata(
    UserService.prototype,
    method
  );
  if (deprecated) console.log(\`\${method} is deprecated!\`);
});`,
        explanation:
          'Reflect-metadata API lưu trữ metadata trên decorators. Define metadata khi class được load, đọc metadata khi cần (validation, serialization, documentation generation).',
      },
    ],
    relatedTerms: ['TypeScript', 'Metadata', 'Annotation', 'Class', 'Method'],
    tags: ['decorators', 'metadata', 'annotation', 'typescript', 'angular', 'reflect'],
  },
]
