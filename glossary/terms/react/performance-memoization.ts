import type { GlossaryTerm } from '../../types'

export const memoizationTerms: GlossaryTerm[] = [
  {
    id: 'react-perf-1',
    term: 'React.memo',
    slug: 'react-memo',
    category: 'React',
    definition:
      'React.memo là higher-order component giúp prevent unnecessary re-renders bằng cách memoizing component — chỉ re-render khi props thay đổi (shallow comparison).',
    details:
      '**Cách hoạt động:**\n- React.memo wraps component và caches kết quả render\n- Khi component nhận cùng props, React reuses kết quả cũ\n- So sánh shallow: primitives so sánh value, objects so sánh reference\n\n**Khi nào dùng:**\n- Component render frequently với cùng props\n- Component có expensive render logic\n- Parent re-renders thường xuyên nhưng child props không đổi\n\n**Lưu ý:**\n- Không dùng cho mọi component — overhead có thể outweigh benefits\n- Props là functions cần useCallback để giữ stable reference\n- Objects/arrays cần useMemo hoặc stable reference\n\n**Custom comparison:**\n- Nhận optional second argument: `(prevProps, nextProps) => boolean`\n- Return `true` = skip re-render, `false` = re-render',
    examples: [
      {
        title: 'React.memo Basic Usage',
        code: `import React from 'react';

// Functional component wrapped with React.memo
const UserCard = React.memo(function UserCard({ user, onClick }) {
  console.log('UserCard rendered:', user.id);
  
  return (
    <div onClick={() => onClick(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// Parent component
function UserList({ users, selectedId }) {
  // UserCard chỉ re-render khi user prop thay đổi
  // selectedId change không affect UserCard
  return (
    <div>
      <h2>Selected: {selectedId}</h2>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onClick={console.log}
        />
      ))}
    </div>
  );
}`,
        explanation:
          'UserCard chỉ re-render khi user object thay đổi reference. selectedId state change không trigger UserCard re-render vì nó không được pass vào UserCard.',
      },
      {
        title: 'Custom Comparison Function',
        code: `// Custom comparison - deep comparison
const ProductCard = React.memo(
  ({ product, onAddToCart }) => {
    return (
      <div>
        <h3>{product.name}</h3>
        <p>{'\$'}{product.price}</p>
        <button onClick={() => onAddToCart(product.id)}>
          Add to Cart
        </button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Return true = skip re-render
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.name === nextProps.product.name &&
      prevProps.product.price === nextProps.product.price
    );
  }
);

// Using with context - only re-render when needed
function ThemeComponent({ theme }) {
  return <div className={theme}>Theme: {theme}</div>;
}

const MemoizedTheme = React.memo(ThemeComponent);`,
        explanation:
          'Custom comparison cho phép deep comparison hoặc selective field comparison. Return true = skip render, false = re-render.',
      },
    ],
    relatedTerms: ['useMemo', 'useCallback', 'PureComponent', 'Memoization', 'shouldComponentUpdate'],
    tags: ['react-memo', 'performance', 'optimization', 're-render', 'memoization'],
  },
  {
    id: 'react-perf-2',
    term: 'useMemo',
    slug: 'usememo',
    category: 'React',
    definition:
      'useMemo là React Hook dùng để memoize expensive computations — chỉ recalculate khi dependencies thay đổi, tránh redundant calculations mỗi lần render.',
    details:
      '**Signature:** `const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])`\n\n**Khi nào dùng:**\n- Expensive calculations (filtering, sorting, transforming large data)\n- Creating new object/array reference mỗi render\n- Passing computed values to memoized child components\n\n**Khi nào KHÔNG dùng:**\n- Simple computations (addition, string concatenation)\n- Effects (dùng useEffect thay thế)\n-过早优化 premature optimization\n\n**Anti-patterns:**\n- useMemo cho side effects — dùng useEffect\n- Dependency array sai → stale values\n- Overuse → memory overhead\n\n**Performance notes:**\n- useMemo không guarantee không recompute — React có thể clear cache\n- Chỉ là performance optimization, không phải semantic guarantee',
    examples: [
      {
        title: 'useMemo for Expensive Computation',
        code: `import { useState, useMemo } from 'react';

function DataDashboard({ rawData }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Expensive filtering + sorting
  const processedData = useMemo(() => {
    console.log('Processing data...');
    
    let filtered = rawData;
    if (filter !== 'all') {
      filtered = rawData.filter(item => item.category === filter);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      return 0;
    });
  }, [rawData, filter, sortBy]); // Only recompute when these change

  return (
    <div>
      <FilterButtons filter={filter} onFilter={setFilter} />
      <SortButtons sortBy={sortBy} onSort={setSortBy} />
      <DataList data={processedData} />
    </div>
  );
}`,
        explanation:
          'processedData chỉ được recompute khi rawData, filter, hoặc sortBy thay đổi. State changes khác (như input focus) không trigger recomputation.',
      },
      {
        title: 'useMemo for Stable References',
        code: `function Parent({ items }) {
  // Without useMemo - new array each render
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.priority - b.priority);
  }, [items]);

  // Memoized object for context value
  const contextValue = useMemo(() => ({
    items: sortedItems,
    addItem: () => console.log('add'),
  }), [sortedItems]);

  return (
    <ItemsContext.Provider value={contextValue}>
      {/* Child chỉ re-render khi contextValue thay đổi */}
      <MemoizedChild />
    </ItemsContext.Provider>
  );
}

// Memoized object for style
function StyledComponent({ color, fontSize }) {
  const style = useMemo(() => ({
    color,
    fontSize: \`\${fontSize}px\`,
    padding: '10px',
  }), [color, fontSize]);

  return <div style={style}>Styled text</div>;
}`,
        explanation:
          'useMemo tạo stable references cho objects/arrays — critical khi passing đến memoized components hoặc dùng làm context values.',
      },
    ],
    relatedTerms: ['useCallback', 'React.memo', 'Memoization', 'Context API', 'Re-renders'],
    tags: ['usememo', 'performance', 'memoization', 'optimization', 'hooks'],
  },
  {
    id: 'react-perf-3',
    term: 'useCallback',
    slug: 'usecallback',
    category: 'React',
    definition:
      'useCallback là React Hook memoizes function reference — trả về stable function identity giữa các renders, giúp prevent unnecessary re-renders của child components.',
    details:
      '**Signature:** `const memoizedCallback = useCallback(() => { doSomething(a, b) }, [a, b])`\n\n**Khi nào dùng:**\n- Passing functions đến memoized child components (React.memo)\n- Functions dùng làm dependency trong useEffect/useMemo\n- Event handlers trong lists hoặc frequently re-rendered components\n\n**Khi nào KHÔNG cần:**\n- Event handlers không pass đến children\n- Functions chỉ dùng trong component và không affect renders\n- Inline functions trong components không memoized\n\n**Common pitfalls:**\n- Stale closures: function captures old state values\n- Missing dependencies → bugs\n- Overuse → code complexity without benefits',
    examples: [
      {
        title: 'useCallback with React.memo',
        code: `import { useState, useCallback } from 'react';

// Memoized child component
const TodoItem = React.memo(function TodoItem({ todo, onToggle, onDelete }) {
  console.log('TodoItem rendered:', todo.id);
  return (
    <li>
      <input 
        type="checkbox" 
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
});

function TodoList() {
  const [todos, setTodos] = useState([]);

  // Stable function reference
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}`,
        explanation:
          'handleToggle và handleDelete giữ stable reference giữa renders. TodoItem không re-render khi parent state khác thay đổi.',
      },
      {
        title: 'useCallback for Dependencies',
        code: `function DataFetcher({ userId }) {
  const [data, setData] = useState(null);

  // Stable callback for useEffect dependency
  const fetchData = useCallback(async () => {
    const response = await fetch(\`/api/users/\${userId}\`);
    const result = await response.json();
    setData(result);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is stable, effect runs when userId changes

  return <div>{data?.name}</div>;
}

// useCallback với parameters
function Form({ onSubmit }) {
  const [formData, setFormData] = useState({});

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  // handleSubmit có thể pass đến memoized child
  return <SubmitButton onClick={handleSubmit} />;
}`,
        explanation:
          'useCallback giúp function stable làm dependency, tránh infinite loops hoặc re-runs. Function parameters được pass qua closures.',
      },
    ],
    relatedTerms: ['useMemo', 'React.memo', 'Closures', 'Stable References', 'Re-renders'],
    tags: ['usecallback', 'performance', 'memoization', 'functions', 'hooks'],
  },
  {
    id: 'react-perf-7',
    term: 'PureComponent',
    slug: 'purecomponent',
    category: 'React',
    definition:
      'PureComponent là class component version của React.memo — tự động implement shouldComponentUpdate với shallow comparison để prevent unnecessary re-renders.',
    details:
      '**Usage:** `class MyComponent extends React.PureComponent`\n\n**How it works:**\n- Extends React.PureComponent thay vì React.Component\n- Tự động shallow compare props và state\n- Skip render nếu props và state không thay đổi\n\n**Shallow comparison:**\n- Primitives: so sánh value\n- Objects/Arrays: so sánh reference (not deep comparison)\n- Mutable changes không detect được\n\n**When to use:**\n- Class components (legacy code)\n- Functional components dùng React.memo thay thế\n- Components với simple props/state\n\n**Limitations:**\n- Không detect mutable data changes\n- Không có custom comparison function\n- Only for class components',
    examples: [
      {
        title: 'PureComponent Example',
        code: `import React from 'react';

// PureComponent with shallow comparison
class UserCard extends React.PureComponent {
  render() {
    console.log('UserCard rendered:', this.props.user.id);
    return (
      <div>
        <h3>{this.props.user.name}</h3>
        <p>{this.props.user.email}</p>
      </div>
    );
  }
}

// Parent component
class UserList extends React.Component {
  state = { selectedId: null };

  render() {
    // UserCard chỉ re-render khi user prop change
    // selectedId state change không affect UserCard
    return (
      <div>
        <h2>Selected: {this.state.selectedId}</h2>
        {this.props.users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    );
  }
}

// Comparison with React.memo
// Functional component equivalent:
const UserCardFunc = React.memo(function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});`,
        explanation:
          'PureComponent là legacy pattern cho class components. React.memo là modern approach cho functional components. Cả hai đều dùng shallow comparison.',
      },
    ],
    relatedTerms: ['React.memo', 'shouldComponentUpdate', 'Memoization', 'Re-renders'],
    tags: ['purecomponent', 'performance', 'class-component', 'memoization', 'optimization'],
  },
  {
    id: 'react-perf-8',
    term: 'shouldComponentUpdate',
    slug: 'shouldcomponentupdate',
    category: 'React',
    definition:
      'shouldComponentUpdate là lifecycle method cho phép control khi nào component nên re-render — return false để skip rendering và improve performance.',
    details:
      '**Signature:** `shouldComponentUpdate(nextProps, nextState): boolean`\n\n**How it works:**\n- Called trước mỗi render (except first render)\n- Return true = continue render (default)\n- Return false = skip render\n- Không called cho forceUpdate\n\n**Use cases:**\n- Fine-grained render control\n- Custom comparison logic\n- Performance optimization cho expensive components\n\n**Best practices:**\n- Dùng PureComponent hoặc React.memo thay thế (shallow comparison)\n- Chỉ dùng khi cần custom logic phức tạp\n- Avoid deep comparisons (expensive)\n\n**Modern alternatives:**\n- Functional components: React.memo với custom comparison\n- Class components: extends PureComponent',
    examples: [
      {
        title: 'shouldComponentUpdate Custom Logic',
        code: `import React from 'react';

class ExpensiveList extends React.Component {
  // Custom update control
  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render if items array changed
    if (this.props.items !== nextProps.items) {
      return true;
    }
    
    // Only re-render if filter changed
    if (this.props.filter !== nextProps.filter) {
      return true;
    }
    
    // Skip render for other changes
    return false;
  }

  render() {
    console.log('ExpensiveList rendered');
    const filtered = this.props.items.filter(item =>
      item.name.includes(this.props.filter)
    );

    return (
      <ul>
        {filtered.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  }
}

// Modern equivalent with React.memo
const ExpensiveListModern = React.memo(
  function ExpensiveList({ items, filter }) {
    const filtered = items.filter(item =>
      item.name.includes(filter)
    );

    return (
      <ul>
        {filtered.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.items === nextProps.items &&
      prevProps.filter === nextProps.filter
    );
  }
);`,
        explanation:
          'shouldComponentUpdate cho phép custom logic nhưng verbose. React.memo với custom comparison là modern approach cho functional components.',
      },
    ],
    relatedTerms: ['PureComponent', 'React.memo', 'Re-renders', 'Lifecycle Methods'],
    tags: ['shouldcomponentupdate', 'performance', 'lifecycle', 'optimization', 're-render'],
  },
]
