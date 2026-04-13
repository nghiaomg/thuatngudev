import type { GlossaryTerm } from '../types'

export const reactTerms: GlossaryTerm[] = [
  {
    id: 'react-1',
    term: 'React Hook',
    slug: 'react-hook',
    category: 'React',
    definition:
      'Hook là các hàm đặc biệt cho phép bạn sử dụng các tính năng của React như state và lifecycle trong các functional components.',
    details:
      '**Rules of Hooks:**\n1. Chỉ gọi Hook ở top level - không gọi trong loops, conditions, hoặc nested functions\n2. Chỉ gọi Hook từ React function components hoặc custom hooks\n\n**Built-in Hooks phổ biến:**\n- `useState` - Quản lý state cục bộ\n- `useEffect` - Xử lý side effects\n- `useContext` - Truy cập Context\n- `useReducer` - Quản lý state phức tạp\n- `useMemo` / `useCallback` - Tối ưu performance\n- `useRef` - Tham chiếu DOM hoặc giá trị bền vững',
    examples: [
      {
        title: 'useState - Quản lý State',
        code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}

// useState với object
function UserForm() {
  const [user, setUser] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    setUser(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form>
      <input
        name="name"
        value={user.name}
        onChange={handleChange}
      />
      <input
        name="email"
        value={user.email}
        onChange={handleChange}
      />
    </form>
  );
}`,
        explanation:
          'useState nhận initial value và trả về array với current state và setter function. Dùng functional update (setCount(c => c + 1)) khi state phụ thuộc vào giá trị trước đó.',
      },
      {
        title: 'useEffect - Side Effects',
        code: `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chạy sau mỗi render
    console.log('Component rendered');

    // Cleanup function
    return () => {
      console.log('Cleanup before next run');
    };
  }); // Empty deps = chỉ chạy 1 lần

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const response = await fetch(\`/api/users/\${userId}\`);
      const data = await response.json();
      setUser(data);
      setLoading(false);
    }

    fetchUser();
  }, [userId]); // Chạy khi userId thay đổi

  useEffect(() => {
    const handleScroll = () => {
      console.log(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup: gỡ event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Chỉ đăng ký 1 lần

  if (loading) return <p>Loading...</p>;
  return <h1>Hello, {user.name}!</h1>;
}`,
        explanation:
          'useEffect nhận callback và dependency array. Không có deps = chạy sau mỗi render. Empty [] = chỉ chạy 1 lần (như componentDidMount). Có deps = chạy khi deps thay đổi. Luôn return cleanup function để tránh memory leaks.',
      },
      {
        title: 'Custom Hook - Tái sử dụng Logic',
        code: `// Custom hook: useLocalStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// Sử dụng
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);

  return (
    <div>
      <button onClick={() => setTheme('dark')}>
        Dark Mode: {theme === 'dark' ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}`,
        explanation:
          "Custom Hook là function bắt đầu bằng 'use' và có thể gọi other hooks. Cho phép trích xuất và chia sẻ logic stateful giữa các components. useLocalStorage tự động sync với localStorage.",
      },
    ],
    relatedTerms: ['useState', 'useEffect', 'useContext', 'Custom Hook', 'State Management'],
    tags: ['hooks', 'state', 'lifecycle', 'react'],
  },
  {
    id: 'react-2',
    term: 'Component Lifecycle',
    slug: 'component-lifecycle',
    category: 'React',
    definition:
      'Component Lifecycle là các giai đoạn từ khi React component được khởi tạo, render, cập nhật, đến khi unmount khỏi DOM. Mỗi giai đoạn có methods tương ứng để thực hiện side effects.',
    details:
      '**Class Component Lifecycle:**\n\n*Giai đoạn Mounting:*\n1. constructor() - Khởi tạo state, binding methods\n2. static getDerivedStateFromProps() - Rare case\n3. render() - Render UI\n4. componentDidMount() - DOM ready, side effects\n\n*Giai đoạn Updating:*\n1. static getDerivedStateFromProps()\n2. shouldComponentUpdate() - Optimize, return false để skip render\n3. render()\n4. getSnapshotBeforeUpdate() - Lấy DOM state trước update\n5. componentDidUpdate() - Side effects sau update\n\n*Giai đoạn Unmounting:*\n- componentWillUnmount() - Cleanup subscriptions, timers\n\n**Hooks tương ứng:**\n- constructor → useState initial value\n- componentDidMount → useEffect(() => {}, [])\n- componentDidUpdate → useEffect(() => {}, [deps])\n- componentWillUnmount → useEffect cleanup',
    examples: [
      {
        title: 'Class Component Lifecycle',
        code: `class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, loading: true };
    this.handleScroll = this.handleScroll.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    // Rare: sync state với props
    return null;
  }

  componentDidMount() {
    // Side effects: API calls, subscriptions
    this.fetchUser(this.props.userId);

    // Đăng ký event listeners
    window.addEventListener('scroll', this.handleScroll);

    // Timers
    this.timer = setInterval(() => {
      this.checkStatus();
    }, 5000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Optimize: không re-render nếu user không đổi
    return nextProps.userId !== this.props.userId;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // Lấy scroll position trước khi update
    return window.scrollY;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Side effects sau khi render
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser(this.props.userId);
    }

    // Khôi phục scroll position
    window.scrollTo(0, snapshot);
  }

  componentWillUnmount() {
    // Cleanup: KHÔNG quên!
    window.removeEventListener('scroll', this.handleScroll);
    clearInterval(this.timer);
  }

  render() {
    if (this.state.loading) return <Spinner />;
    return <div>{this.state.user.name}</div>;
  }
}`,
        explanation:
          'Lifecycle methods được gọi theo thứ tự. componentDidMount chạy sau render đầu tiên. componentDidUpdate chạy sau mỗi update. componentWillUnmount phải cleanup để tránh memory leaks.',
      },
      {
        title: 'useEffect Hooks thay thế Lifecycle',
        code: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // 1. componentDidMount + componentDidUpdate (khi userId thay đổi)
  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(\`/api/users/\${userId}\`);
      setUser(await response.json());
    };

    fetchUser();

    // Cleanup: chạy trước khi effect tiếp theo
    return () => {
      console.log('Cleanup trước effect tiếp theo');
    };
  }, [userId]);

  // 2. Chỉ componentDidMount (scroll listener)
  useEffect(() => {
    const handleScroll = () => {
      console.log(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup: bắt buộc khi đăng ký listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty deps = chỉ chạy 1 lần

  // 3. Chỉ componentDidUpdate (document title)
  useEffect(() => {
    if (user) {
      document.title = \`\${user.name} - Profile\`;
    }
  }, [user]); // Chạy khi user thay đổi

  // 4. Cleanup khi unmount
  useEffect(() => {
    const controller = new AbortController();

    return () => {
      // Cancel pending requests
      controller.abort();
      console.log('Component unmounted');
    };
  }, []);

  return user ? <div>{user.name}</div> : <Spinner />;
}`,
        explanation:
          'useEffect với deps array rỗng [] tương đương componentDidMount. Có deps tương đương componentDidUpdate. Cleanup function tương đương componentWillUnmount. Luôn cleanup subscriptions và abort requests.',
      },
      {
        title: 'Common Lifecycle Mistakes',
        code: `// ❌ SAI: Tạo infinite loop
function BadComponent({ userId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(\`/api/data/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setData(data); // Trigger re-render → lại chạy effect!
      });
  }); // Không có deps = chạy sau MỌI render

  return <List data={data} />;
}

// ✅ ĐÚNG: Thêm deps và cleanup
function GoodComponent({ userId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch(\`/api/data/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) { // Kiểm tra trước khi set state
          setData(data);
        }
      });

    return () => {
      cancelled = true; // Cleanup: prevent setState sau unmount
    };
  }, [userId]); // Chạy khi userId thay đổi

  return <List data={data} />;
}

// ❌ SAI: Async function trong useEffect không có async
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getData();
    setData(data);
  };
  fetchData();
  // Không return cleanup = potential memory leak
}, []);

// ✅ ĐÚNG: Wrap async, return cleanup
useEffect(() => {
  let isActive = true;

  const fetchData = async () => {
    const data = await api.getData();
    if (isActive) setData(data);
  };

  fetchData();

  return () => {
    isActive = false;
  };
}, []);`,
        explanation:
          "Common mistakes: thiếu deps array (infinite loop), không cleanup subscriptions, setState sau unmount. Luôn dùng cleanup function và kiểm tra 'cancelled' flag cho async operations.",
      },
    ],
    relatedTerms: ['useEffect', 'useState', 'React Hooks', 'Virtual DOM', 'State Management'],
    tags: ['lifecycle', 'hooks', 'render', 'react'],
  },
  {
    id: 'react-3',
    term: 'Context API',
    slug: 'context-api',
    category: 'React',
    definition:
      'Context API cho phép truyền dữ liệu qua cây component mà không cần prop drilling — truy cập state từ bất kỳ component nào mà không cần truyền props qua từng cấp.',
    details:
      '**Context gồm 3 phần:**\n\n1. `React.createContext(defaultValue)` - Tạo Context object\n2. `Context.Provider` - Cung cấp giá trị cho cây con\n3. `useContext(Context)` - Hook để đọc giá trị\n\n**Khi nào dùng Context:**\n- Theme (dark/light mode)\n- Ngôn ngữ (i18n)\n- Authentication state\n- User preferences\n- Settings cần truy cập toàn cục\n\n**Caveats:**\n- Context làm toàn bộ subtree re-render khi value thay đổi\n- Chia nhỏ Context theo từng concern để tránh re-render không cần thiết\n- Có thể kết hợp `useMemo` hoặc tách thành nhiều providers',
    examples: [
      {
        title: 'Tạo và sử dụng Context cơ bản',
        code: `import { createContext, useContext, useState } from 'react';

// 1. Tạo Context với default value
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// 2. Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Consumer component
function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333',
      }}
    >
      Current: {theme}
    </button>
  );
}

// Sử dụng ở bất kỳ đâu trong tree
function Header() {
  const { theme } = useContext(ThemeContext);
  return <nav style={{ borderBottom: '1px solid' }}>Header - {theme}</nav>;
}

// App structure
function App() {
  return (
    <ThemeProvider>
      <Header />
      <ThemeToggle />
    </ThemeProvider>
  );
}`,
        explanation:
          'Context API gồm createContext, Provider wrap tree, và useContext để đọc. Mọi component bên trong Provider đều truy cập được value mà không cần prop drilling.',
      },
      {
        title: 'Custom Hook wrapper cho Context',
        code: `import { createContext, useContext, useState, useMemo } from 'react';

// Tạo Context
const AuthContext = createContext(null);

// Custom hook - throw error nếu ngoài provider
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const userData = await res.json();
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Memoize value để tránh re-render không cần thiết
  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Sử dụng trong component
function Profile() {
  const { user, logout } = useAuth();

  if (!user) return <p>Please login</p>;

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}`,
        explanation:
          "Custom hook wrapper kiểm tra context có tồn tại không, throw error rõ ràng nếu dùng ngoài provider. Dùng useMemo cho value để tránh tạo object mới mỗi render gây re-render.",
      },
    ],
    relatedTerms: ['React Hooks', 'useState', 'useReducer', 'State Management', 'Prop Drilling'],
    tags: ['context', 'state', 'hooks', 'react'],
  },
  {
    id: 'react-4',
    term: 'React Server Components',
    slug: 'react-server-components',
    category: 'React',
    definition:
      'Server Components (RSC) là components được render trên server và gửi HTML đã render tới client — giảm đáng kể bundle size và cho phép truy cập trực tiếp vào backend resources mà không cần API layer.',
    details:
      '**Server vs Client Components:**\n\n*Server Components:*\n- Render ở server, chỉ chạy một lần\n- Truy cập trực tiếp database, file system, APIs\n- Không bundle vào JS client\n- Không dùng hooks hay event handlers\n- Default trong Next.js App Router\n\n*Client Components:*\n- Render ở client (browser)\n- Có thể dùng hooks, event handlers\n- Cần \`\'use client\'\` directive\n- Hydrate ở client\n\n**Streaming & Suspense:**\n- RSC hỗ trợ streaming — gửi HTML từng phần\n- Kết hợp `<Suspense>` để show loading state\n- Progressive enhancement',
    examples: [
      {
        title: 'Server Component - Truy cập DB trực tiếp',
        code: `// app/posts/page.tsx — Server Component (default)
// Không cần API route, gọi DB trực tiếp
async function PostsPage() {
  // Fetch trực tiếp từ database (Server-only)
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <main>
      <h1>Latest Posts</h1>
      <div className="grid">
        {posts.map(post => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <span>{post.author.name}</span>
          </article>
        ))}
      </div>
    </main>
  );
}

// Hoặc fetch từ external API
async function GitHubRepos() {
  const res = await fetch('https://api.github.com/users/vercel/repos');
  const repos = await res.json();

  return (
    <ul>
      {repos.slice(0, 5).map(repo => (
        <li key={repo.id}>{repo.name}</li>
      ))}
    </ul>
  );
}`,
        explanation:
          'Server Components fetch data trực tiếp từ DB hoặc API mà không qua API route. Bundle size không tăng vì code không gửi xuống client. async/await hoạt động trực tiếp.',
      },
      {
        title: 'Client Component với "use client"',
        code: `// components/LikeButton.tsx
'use client'; // Bắt buộc cho hooks/event handlers

import { useState } from 'react';

interface LikeButtonProps {
  initialCount: number;
  postId: string;
}

export function LikeButton({ initialCount, postId }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    // Client-side logic: gọi API để persist
    await fetch(\`/api/posts/\${postId}/like\`, {
      method: 'POST',
    });

    setCount(prev => liked ? prev - 1 : prev + 1);
    setLiked(!liked);
  };

  return (
    <button onClick={handleLike}>
      {liked ? '❤️' : '🤍'} {count}
    </button>
  );
}

// SideBar.tsx — Server Component
// Truyền data từ server vào client component
async function SideBar() {
  const popularPosts = await db.post.findMany({
    orderBy: { likes: 'desc' },
    take: 5,
  });

  return (
    <aside>
      <h3>Popular Posts</h3>
      {popularPosts.map(post => (
        <div key={post.id}>
          <span>{post.title}</span>
          {/* Client Component nhận data từ Server */}
          <LikeButton
            initialCount={post.likes}
            postId={post.id}
          />
        </div>
      ))}
    </aside>
  );
}`,
        explanation:
          '"use client" directive đánh dấu component chạy ở client. Server Component truyền data vào Client Component qua props. LikeButton là Client vì cần useState và onClick handler.',
      },
      {
        title: 'Streaming với Suspense',
        code: `// app/dashboard/page.tsx
import { Suspense } from 'react';

async function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Wrapped component sẽ stream khi ready */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats /> {/* Server Component - có thể chậm */}
      </Suspense>

      <Suspense fallback={<FeedSkeleton />}>
        <RecentFeed /> {/* Server Component */}
      </Suspense>

      {/* Notifications luôn ready ngay */}
      <Notifications />
    </div>
  );
}

// Server Component - có thể lâu
async function Stats() {
  // Simulate slow query
  await new Promise(r => setTimeout(r, 2000));
  const stats = await fetchStats();
  return <div>{/* stats */}</div>;
}

function StatsSkeleton() {
  return <div className="animate-pulse">Loading stats...</div>;
}

export default Dashboard;`,
        explanation:
          'Suspense cho phép streaming — UI chính hiển thị ngay, các phần nặng (Stats, Feed) sẽ stream vào sau. fallback hiển thị skeleton trong lúc chờ. Progressive loading experience.',
      },
    ],
    relatedTerms: ['Server Components', 'Client Components', 'Next.js App Router', 'Streaming', 'Suspense'],
    tags: ['rsc', 'server', 'next.js', 'streaming', 'react'],
  },
  {
    id: 'react-5',
    term: 'Virtual DOM',
    slug: 'virtual-dom',
    category: 'React',
    definition:
      'Virtual DOM là JavaScript representation của real DOM, React dùng nó để so sánh (diff) và tính toán minimal changes trước khi cập nhật actual DOM — giúp tránh expensive direct DOM manipulations.',
    details:
      '**Cách hoạt động:**\n1. State thay đổi → tạo new Virtual DOM tree\n2. So sánh (reconcile/diff) với previous Virtual DOM\n3. Tính toán minimal batch of changes\n4. Apply changes vào real DOM (commit phase)\n\n**Tối ưu hóa:**\n- Batch updates — nhóm nhiều changes thành một render\n- Key prop — giúp React xác định elements thay đổi\n- shouldComponentUpdate / React.memo — tránh re-render không cần thiết\n\n**Reconciliation:**\n- Same element type → update attributes\n- Different element type → unmount và mount mới\n- List với keys → match elements correctly',
    examples: [
      {
        title: 'Virtual DOM Diffing Demo',
        code: `// State change → new Virtual DOM
const [count, setCount] = useState(0);

// Virtual DOM Tree (simplified)
const vdom = {
  type: 'div',
  props: { className: 'container' },
  children: [
    {
      type: 'h1',
      props: { style: { color: count % 2 === 0 ? 'blue' : 'red' } },
      children: \`Count: \${count}\`
    },
    {
      type: 'button',
      props: { onClick: () => setCount(c => c + 1) },
      children: 'Increment'
    }
  ]
};

// React không update real DOM trực tiếp
// Nó so sánh new VDOM với current VDOM
// Sau đó batch updates vào actual DOM

// Demo: List với keys
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>  {/* Key giúp React match elements */}
          {todo.text}
        </li>
      ))}
    </ul>
  );
}

// Demo: Conditional rendering
function ConditionalComponent({ show }) {
  // React so sánh element types
  // Nếu null → unmount
  // Nếu div → mount mới
  return show ? <div>Shown</div> : null;
}`,
        explanation:
          'React tạo Virtual DOM mỗi lần render. Key prop giúp React match elements khi list thay đổi. Conditional rendering với null/undefined unmount component.',
      },
      {
        title: 'React.memo và useMemo',
        code: `import { useMemo } from 'react';

// Component không re-render khi props không thay đổi
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  console.log('ExpensiveList rendered');
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

// useMemo - memoize computed value
function DataTable({ data, filter }) {
  // Chỉ recalculate khi data hoặc filter thay đổi
  const filteredData = useMemo(() => {
    console.log('Filtering data...');
    return data.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  // useCallback - memoize function reference
  const handleSort = useCallback((column) => {
    console.log('Sort by:', column);
  }, []); // Empty deps = function không thay đổi

  return (
    <div>
      <ExpensiveList items={filteredData} />
      <SortButton onClick={handleSort} />
    </div>
  );
}

// Custom comparison function
const CustomComponent = React.memo(
  ({ data, onClick }) => {
    return <div onClick={() => onClick(data.id)}>{data.name}</div>;
  },
  (prevProps, nextProps) => {
    // Custom comparison - re-render nếu trả về false
    return prevProps.data.id === nextProps.data.id;
  }
);`,
        explanation:
          'React.memo() memoizes component — không re-render nếu props unchanged. useMemo() memoizes computed value. useCallback() memoizes function reference. Custom comparison cho phép fine-grained control.',
      },
    ],
    relatedTerms: ['Reconciliation', 'React Fiber', 'ShouldComponentUpdate', 'Memoization', 'DOM'],
    tags: ['virtual-dom', 'performance', 'reconciliation', 'rendering', 'dom'],
  },
  {
    id: 'react-6',
    term: 'State Management',
    slug: 'state-management',
    category: 'React',
    definition:
      'State Management là cách quản lý và chia sẻ data (state) giữa các components trong ứng dụng React, từ local state đơn giản đến global state phức tạp như Redux, Zustand, Jotai.',
    details:
      '**Các loại State:**\n- **Local State** - useState, chỉ trong một component\n- **Lifted State** - State được lift lên parent component\n- **Context State** - Chia sẻ qua Context API\n- **External State** - Redux, Zustand, Jotai, Recoil\n\n**Khi nào dùng gì:**\n- Local state → useState\n- Shared state trong tree → Context\n- Complex state logic → useReducer\n- Global state phức tạp → Redux Toolkit / Zustand\n\n**State Management Patterns:**\n- Single source of truth (Redux)\n- Atomic state (Jotai)\n- Derived state / Selectors',
    examples: [
      {
        title: 'Local State và Lifted State',
        code: `// Local state - chỉ dùng trong component này
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
}

// Lifted state - chia sẻ giữa siblings
function Parent() {
  const [sharedValue, setSharedValue] = useState('');

  return (
    <>
      <InputComponent value={sharedValue} onChange={setSharedValue} />
      <DisplayComponent value={sharedValue} />
    </>
  );
}

function InputComponent({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

function DisplayComponent({ value }) {
  return <p>Value: {value}</p>;
}`,
        explanation:
          'Local state dùng khi không cần share. Lifted state giải quyết prop drilling cho tree không quá sâu.',
      },
      {
        title: 'Zustand - Lightweight State Management',
        code: `import { create } from 'zustand';

// Tạo store
const useStore = create((set, get) => ({
  // State
  user: null,
  cart: [],
  theme: 'light',

  // Actions
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),

  addToCart: (product) => set(state => ({
    cart: [...state.cart, product]
  })),

  removeFromCart: (productId) => set(state => ({
    cart: state.cart.filter(item => item.id !== productId)
  })),

  // Computed/derived state
  cartTotal: () =>
    get().cart.reduce((sum, item) => sum + item.price, 0),

  toggleTheme: () => set(state => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));

// Sử dụng trong component
function Cart() {
  const { cart, addToCart, removeFromCart, cartTotal } = useStore();

  return (
    <div>
      <h2>Cart ({cart.length} items)</h2>
      <p>Total: \${cartTotal()}</p>
      {cart.map(item => (
        <div key={item.id}>
          {item.name} - \${item.price}
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

// Select specific slices (prevent re-renders)
function CartBadge() {
  // Chỉ re-render khi cart thay đổi
  const itemCount = useStore(state => state.cart.length);
  return <span className="badge">{itemCount}</span>;
}`,
        explanation:
          'Zustand là state management nhẹ, không có Provider. Selector function trả về specific slice — component chỉ re-render khi slice đó thay đổi.',
      },
      {
        title: 'useReducer cho Complex State',
        code: `// useReducer cho state phức tạp
const initialState = {
  status: 'idle', // idle | loading | success | error
  data: null,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null };

    case 'FETCH_SUCCESS':
      return { ...state, status: 'success', data: action.payload };

    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

function useFetch(url) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await fetch(url);
      const data = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  }, [url]);

  return { ...state, refetch: fetchData };
}

// Sử dụng
function UserProfile({ userId }) {
  const { status, data, error, refetch } = useFetch(
    \`/api/users/\${userId}\`
  );

  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}`,
        explanation:
          'useReducer tốt hơn useState khi state logic phức tạp, có nhiều actions, hoặc state phụ thuộc vào state trước đó. Dispatch actions clear hơn setState.',
      },
    ],
    relatedTerms: ['useState', 'useReducer', 'Context API', 'Redux', 'Zustand'],
    tags: ['state-management', 'redux', 'zustand', 'global-state'],
  },
]
