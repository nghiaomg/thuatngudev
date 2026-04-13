import type { GlossaryTerm } from '../../types'

export const performanceTerms: GlossaryTerm[] = [
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
]
