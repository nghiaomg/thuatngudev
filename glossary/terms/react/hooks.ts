import type { GlossaryTerm } from '../../types'

export const hooksTerms: GlossaryTerm[] = [
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
]
