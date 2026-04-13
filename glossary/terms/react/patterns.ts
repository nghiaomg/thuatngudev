import type { GlossaryTerm } from '../../types'

export const patternsTerms: GlossaryTerm[] = [
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
          'Custom hook wrapper kiểm tra context có tồn tại không, throw error rõ ràng nếu dùng ngoài provider. Dùng useMemo cho value để tránh tạo object mới mỗi render gây re-render.',
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
      "**Server vs Client Components:**\n\n*Server Components:*\n- Render ở server, chỉ chạy một lần\n- Truy cập trực tiếp database, file system, APIs\n- Không bundle vào JS client\n- Không dùng hooks hay event handlers\n- Default trong Next.js App Router\n\n*Client Components:*\n- Render ở client (browser)\n- Có thể dùng hooks, event handlers\n- Cần \`'use client'\` directive\n- Hydrate ở client\n\n**Streaming & Suspense:**\n- RSC hỗ trợ streaming — gửi HTML từng phần\n- Kết hợp `<Suspense>` để show loading state\n- Progressive enhancement",
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
    relatedTerms: [
      'Server Components',
      'Client Components',
      'Next.js App Router',
      'Streaming',
      'Suspense',
    ],
    tags: ['rsc', 'server', 'next.js', 'streaming', 'react'],
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
