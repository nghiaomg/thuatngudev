import type { GlossaryTerm } from '../../types'

export const renderingOptimizationTerms: GlossaryTerm[] = [
  {
    id: 'react-perf-9',
    term: 'Reconciliation',
    slug: 'reconciliation',
    category: 'React',
    definition:
      'Reconciliation là quá trình React so sánh Virtual DOM tree mới với current tree và tính toán minimal updates cần thiết để update real DOM.',
    details:
      '**Diffing Algorithm:**\n- Same type: update attributes/props\n- Different type: unmount old, mount new\n- List with keys: match elements by key\n\n**Heuristics:**\n- Trees: O(n) thay vì O(n³) grâce assumptions\n- Same level siblings: không compare cross-level\n- Type-based: cùng type = update, khác type = replace\n\n**Key prop:**\n- Giúp React identify elements trong lists\n- Stable, predictable, unique\n- Không dùng index nếu list can reorder\n\n**Performance:**\n- Batch updates để minimize DOM operations\n- Fiber architecture: interruptible rendering\n- Concurrent Mode: prioritize updates',
    examples: [
      {
        title: 'Reconciliation with Keys',
        code: `// ❌ Bad: Index as key
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <TodoItem key={index} todo={todo} />
      ))}
    </ul>
  );
}

// ✅ Good: Stable unique key
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

// Reconciliation process:
// 1. State change → new Virtual DOM
// 2. Diff: compare new vs current VDOM
// 3. Calculate minimal changes
// 4. Apply to real DOM (commit phase)

// With keys, React can:
// - Match items when reordered
// - Avoid unnecessary unmounts/mounts
// - Efficiently insert/remove items`,
        explanation:
          'Key prop giúp React identify items trong lists. Stable keys避免 unnecessary re-renders khi list thay đổi. Index keys gây issues khi reorder/filter.',
      },
    ],
    relatedTerms: ['Virtual DOM', 'React Fiber', 'Key Prop', 'Diffing', 'Rendering'],
    tags: ['reconciliation', 'performance', 'virtual-dom', 'diffing', 'rendering'],
  },
  {
    id: 'react-perf-10',
    term: 'React Fiber',
    slug: 'react-fiber',
    category: 'React',
    definition:
      'React Fiber là reimplementation của React reconciliation engine (React 16+) — cho phép interruptible rendering, priority-based updates và concurrent features.',
    details:
      '**Architecture:**\n- Fiber nodes: linked list tree structure\n- Work units: mỗi node là work unit\n- Interruptible: pause/resume rendering\n\n**Phases:**\n1. Render phase: build work-in-progress tree (interruptible)\n2. Commit phase: apply changes to DOM (synchronous)\n\n**Features enabled:**\n- Concurrent Mode\n- Suspense\n- Time slicing\n- Priority-based updates\n\n**Benefits:**\n- Better responsiveness\n- Smooth animations\n- Non-blocking UI updates\n- Better user experience',
    examples: [
      {
        title: 'Fiber Architecture Overview',
        code: `// Fiber node structure (simplified)
const fiberNode = {
  type: 'div',
  stateNode: actualDomNode,
  child: firstChildFiber,
  sibling: nextSiblingFiber,
  return: parentFiber,
  
  // Work info
  pendingProps: newProps,
  memoizedProps: currentProps,
  updateQueue: pendingUpdates,
  memoizedState: currentState,
  
  // Effects
  effectTag: PLACEMENT | UPDATE,
  nextEffect: nextEffectFiber,
  firstEffect: firstChildEffect,
  lastEffect: lastChildEffect,
};

// Fiber allows:
// 1. Pause work and resume later
// 2. Abort work if not needed
// 3. Reuse work from previous renders
// 4. Priority-based rendering

// Example: Low priority update
React.startTransition(() => {
  setFilter(inputValue); // Low priority, interruptible
});

// High priority: immediate
setInputValue(e.target.value); // High priority, sync`,
        explanation:
          'Fiber architecture cho phép interruptible rendering. Updates có priorities — high priority (user input) được xử lý trước, low priority (data fetch) có thể pause.',
      },
    ],
    relatedTerms: ['Reconciliation', 'Concurrent Mode', 'Virtual DOM', 'Rendering'],
    tags: ['react-fiber', 'performance', 'architecture', 'concurrent', 'rendering'],
  },
  {
    id: 'react-perf-11',
    term: 'Batching',
    slug: 'batching',
    category: 'React',
    definition:
      'Batching là kỹ thuật React groups multiple state updates thành single re-render để avoid redundant renders và improve performance.',
    details:
      '**Automatic batching:**\n- React 18: Batch tất cả updates (promises, timeouts, native events)\n- React <18: Chỉ batch trong event handlers và lifecycle methods\n\n**How it works:**\n- Multiple setState calls → single render\n- State updates được queued và processed together\n- Final state calculated từ all updates\n\n**Manual control:**\n- `ReactDOM.flushSync()`: Force synchronous render (avoid batching)\n- `React.startTransition()`: Mark low-priority updates\n\n**Benefits:**\n- Fewer renders\n- Better performance\n- Less DOM manipulation',
    examples: [
      {
        title: 'Automatic Batching in React 18',
        code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  // React 18: All updates batched → 1 render
  const handleClick = () => {
    setCount(c => c + 1);     // Queued
    setFlag(f => !f);         // Queued
    console.log(count);       // Still old value (not updated yet)
  };

  // Async updates also batched in React 18
  const handleAsync = async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    // These are batched in React 18 (not in React 17)
    setData(data);
    setLoading(false);
  };

  // Force synchronous render (avoid batching)
  import { flushSync } from 'react-dom';

  const handleSyncUpdate = () => {
    flushSync(() => {
      setCount(c => c + 1);
    });
    // DOM updated immediately
    console.log('Count updated:', count);
    
    flushSync(() => {
      setFlag(true);
    });
    // Separate render → 2 renders total
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}`,
        explanation:
          'React 18 tự động batch tất cả state updates — sync, async, promises, timeouts. flushSync() force immediate render khi cần.',
      },
    ],
    relatedTerms: ['State Updates', 'Re-renders', 'React 18', 'Performance Optimization'],
    tags: ['batching', 'performance', 'state', 'react-18', 'optimization'],
  },
  {
    id: 'react-perf-12',
    term: 'Windowing (Virtualization)',
    slug: 'windowing-virtualization',
    category: 'React',
    definition:
      'Windowing là kỹ thuật chỉ render visible items trong large lists — giảm DOM nodes và improve rendering performance cho lists với hàng ngàn items.',
    details:
      '**How it works:**\n- Calculate viewport size\n- Render only visible items + buffer\n- Recycle DOM nodes khi scroll\n\n**Libraries:**\n- react-window: Lightweight, common use cases\n- react-virtualized: Feature-rich, complex layouts\n- @tanstack/virtual: Framework-agnostic\n\n**Benefits:**\n- Constant memory usage (không depend on list size)\n- Fast initial render\n- Smooth scrolling\n- Reduced DOM nodes\n\n**Use cases:**\n- Long lists (1000+ items)\n- Tables with many rows\n- Infinite scroll implementations',
    examples: [
      {
        title: 'react-window Virtualized List',
        code: `import { FixedSizeList as List } from 'react-window';

// Virtualized list - only renders visible items
function VirtualizedTodoList({ todos }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TodoItem todo={todos[index]} />
    </div>
  );

  return (
    <List
      height={600}           // Container height
      itemCount={todos.length}
      itemSize={50}          // Each item height
      width="100%"
    >
      {Row}
    </List>
  );
}

// Variable size items
import { VariableSizeList } from 'react-window';

function VariableSizeList({ items }) {
  const getItemSize = (index) => {
    // Calculate dynamic height
    return items[index].expanded ? 100 : 50;
  };

  return (
    <VariableSizeList
      height={600}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <Item data={items[index]} />
        </div>
      )}
    </VariableSizeList>
  );
}

// Grid virtualization
import { FixedSizeGrid as Grid } from 'react-window';

function VirtualizedGrid({ data }) {
  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      {data[rowIndex][columnIndex]}
    </div>
  );

  return (
    <Grid
      columnCount={100}
      columnWidth={100}
      height={400}
      rowCount={1000}
      rowHeight={50}
      width={600}
    >
      {Cell}
    </Grid>
  );
}`,
        explanation:
          'Windowing chỉ render visible items + buffer. Giảm từ 1000+ DOM nodes xuống còn ~20-30 nodes. Cải thiện đáng kể performance cho large lists.',
      },
    ],
    relatedTerms: ['Large Lists', 'Performance', 'DOM Optimization', 'react-window'],
    tags: ['windowing', 'virtualization', 'performance', 'lists', 'optimization'],
  },
  {
    id: 'react-perf-13',
    term: 'Lazy Loading Images',
    slug: 'lazy-loading-images',
    category: 'React',
    definition:
      'Lazy Loading Images là kỹ thuật defer loading of images until they are about to enter the viewport — giảm initial page load và save bandwidth.',
    details:
      '**Methods:**\n- Native: `loading="lazy"` attribute\n- Intersection Observer API\n- Libraries: react-lazyload, react-intersection-observer\n\n**Benefits:**\n- Faster initial page load\n- Reduced bandwidth usage\n- Better LCP (Largest Contentful Paint)\n- Improved Core Web Vitals\n\n**Best practices:**\n- Lazy load below-fold images\n- Eager load above-fold/hero images\n- Use placeholder/skeleton while loading\n- Consider user connection speed',
    examples: [
      {
        title: 'Image Lazy Loading Techniques',
        code: `// Native lazy loading (modern browsers)
function ImageGallery({ images }) {
  return (
    <div>
      {images.map((img, index) => (
        <img
          key={img.id}
          src={img.src}
          alt={img.alt}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
}

// Intersection Observer approach
import { useInView } from 'react-intersection-observer';

function LazyImage({ src, alt }) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px', // Start loading 200px before visible
  });

  return (
    <div ref={ref}>
      {inView ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="placeholder">Loading...</div>
      )}
    </div>
  );
}

// Custom lazy loading with fade-in
function FadeInImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true });

  const handleLoad = () => setLoaded(true);

  return (
    <div ref={ref} className="image-container">
      {inView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={loaded ? 'visible' : 'hidden'}
        />
      )}
      {!loaded && <Skeleton />}
    </div>
  );
}`,
        explanation:
          'Native lazy loading đơn giản nhất nhưng limited control. Intersection Observer cho phép fine-grained control với rootMargin và thresholds.',
      },
    ],
    relatedTerms: ['Intersection Observer', 'Performance', 'Core Web Vitals', 'Image Optimization'],
    tags: ['lazy-loading', 'images', 'performance', 'intersection-observer', 'optimization'],
  },
  {
    id: 'react-perf-14',
    term: 'Debouncing and Throttling',
    slug: 'debouncing-throttling',
    category: 'React',
    definition:
      'Debouncing và Throttling là techniques limit frequency of function executions — prevent excessive re-renders và API calls trong response to rapid events.',
    details:
      '**Debounce:**\n- Wait cho pause trong events\n- Execute sau khi events dừng\n- Use case: search input, resize handler\n\n**Throttle:**\n- Execute at fixed intervals\n- Limit execution rate\n- Use case: scroll events, mouse move\n\n**Libraries:**\n- lodash: `_.debounce`, `_.throttle`\n- Custom implementations\n- React hooks: use-debounce\n\n**React patterns:**\n- Debounce search input\n- Throttle scroll handlers\n- Rate-limit API calls',
    examples: [
      {
        title: 'Debounce and Throttle in React',
        code: `import { useState, useEffect, useCallback } from 'react';

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler); // Cleanup on value change or unmount
    };
  }, [value, delay]);

  return debouncedValue;
}

// Debounced search
function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults(debouncedQuery);
    }
  }, [debouncedQuery]); // Only fires after 300ms pause

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}

// Throttle with useCallback
function ScrollComponent() {
  const handleScroll = useCallback(
    throttle(() => {
      console.log('Scroll position:', window.scrollY);
      updateVisibleItems();
    }, 100), // Max 10 times per second
    []
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return <div>Scroll content...</div>;
}

// lodash usage
import { debounce, throttle } from 'lodash';

const debouncedFn = debounce(() => console.log('debounced'), 300);
const throttledFn = throttle(() => console.log('throttled'), 300);`,
        explanation:
          'Debounce delay execution until events pause — good cho search inputs. Throttle limits execution rate — good cho scroll/mouse events. Cả hai prevent excessive re-renders.',
      },
    ],
    relatedTerms: ['Event Handlers', 'Performance', 'API Calls', 'useEffect'],
    tags: ['debouncing', 'throttling', 'performance', 'optimization', 'events'],
  },
]
