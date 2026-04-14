import type { GlossaryTerm } from '../../types'

export const bundleOptimizationTerms: GlossaryTerm[] = [
  {
    id: 'react-perf-15',
    term: 'Tree Shaking',
    slug: 'tree-shaking',
    category: 'React',
    definition:
      'Tree Shaking là build optimization loại bỏ unused code từ final bundle — chỉ include code thực sự được sử dụng, giảm bundle size.',
    details:
      '**Requirements:**\n- ES6 modules (import/export)\n- Static analysis (not dynamic imports)\n- Production mode (Webpack, Vite, etc.)\n\n**How it works:**\n- Build tool analyzes import/export graph\n- Marks unused exports as "dead code"\n- Removes dead code from bundle\n- Minification further reduces size\n\n**Best practices:**\n- Use ES6 imports (not CommonJS)\n- Avoid barrel imports (index.js re-exports)\n- Use specific imports: `import { button }` not `import * as all`\n- Side-effect-free code',
    examples: [
      {
        title: 'Tree Shaking Best Practices',
        code: `// ❌ Bad: Import entire library
import * as _ from 'lodash';
const result = _.debounce(fn, 300);

// ✅ Good: Import only what you need
import { debounce } from 'lodash';
const result = debounce(fn, 300);

// ❌ Bad: Barrel imports (prevents tree shaking)
import { Button, Input, Modal } from './components';
// If index.js re-exports everything, all components included

// ✅ Good: Direct imports
import Button from './components/Button';
import Input from './components/Input';

// Side effects in modules (prevents tree shaking)
// utils.js
export function helper1() { /* ... */ }
export function helper2() { /* ... */ }

// This side effect prevents removal
console.log('Module loaded');

// package.json mark side effects
// {
//   "sideEffects": false, // or ["./src/polyfill.js"]
// }`,
        explanation:
          'Tree shaking loại bỏ unused code. ES6 imports cho phép static analysis. Barrel imports và side effects prevent tree shaking. Mark sideEffects trong package.json.',
      },
    ],
    relatedTerms: ['Code Splitting', 'Bundle Size', 'Minification', 'Build Optimization'],
    tags: ['tree-shaking', 'performance', 'bundle', 'build', 'optimization'],
  },
  {
    id: 'react-perf-16',
    term: 'Bundle Analysis',
    slug: 'bundle-analysis',
    category: 'React',
    definition:
      'Bundle Analysis là quá trình analyze JavaScript bundle để identify large dependencies, duplicate code, và optimization opportunities.',
    details:
      '**Tools:**\n- Webpack Bundle Analyzer\n- Source Map Explorer\n- Rollup Plugin Visualizer\n- Vite Plugin Analyzer\n\n**Metrics:**\n- Total bundle size (gzip)\n- Individual chunk sizes\n- Dependencies breakdown\n- Duplicate modules\n\n**Optimization targets:**\n- Large dependencies\n- Duplicate packages\n- Unused code\n- Code splitting opportunities',
    examples: [
      {
        title: 'Bundle Analysis with Webpack',
        code: `// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  // ... your config
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerPort: 8888,
      openAnalyzer: true,
    })
  ]
};

// package.json scripts
// "analyze": "webpack --profile --json > stats.json"
// Then upload to: https://webpack.github.io/analyse/

// Source map explorer
// npm install -g source-map-explorer
// source-map-explorer build/static/js/*.js

// Common findings:
// - Moment.js: 200KB+ (replace with date-fns: 10KB)
// - Lodash: 70KB (use specific imports: 5KB)
// - Duplicate React: 120KB (check dependencies)
// - Unused routes: 50KB (code split)`,
        explanation:
          'Bundle Analyzer visualize bundle composition. Identify large dependencies và duplication. Regular analysis giúp maintain optimal bundle size.',
      },
    ],
    relatedTerms: ['Tree Shaking', 'Code Splitting', 'Bundle Size', 'Webpack'],
    tags: ['bundle-analysis', 'performance', 'optimization', 'webpack', 'build'],
  },
  {
    id: 'react-perf-17',
    term: 'Minification',
    slug: 'minification',
    category: 'React',
    definition:
      'Minification là quá trình remove unnecessary characters từ code (whitespace, comments, long variable names) — giảm file size mà không thay đổi functionality.',
    details:
      '**What gets removed:**\n- Whitespace và newlines\n- Comments\n- Semicolons (optional)\n- Long variable names → short names\n\n**What gets transformed:**\n- ES6+ → ES5 (Babel)\n- Dead code elimination\n- Constant folding\n- Function inlining\n\n**Tools:**\n- Terser (Webpack default)\n- ESBuild (very fast)\n- SWC (Rust-based, fast)\n- UglifyJS (legacy)',
    examples: [
      {
        title: 'Minification Example',
        code: `// Original code
function calculateTotal(items) {
  // Calculate total price
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

// Minified code
function c(i){let t=0;for(let e=0;e<i.length;e++)t+=i[e].p*i[e].q;return t}

// Terser config (terser.config.js)
module.exports = {
  compress: {
    drop_console: true,    // Remove console.log
    pure_funcs: ['debug'], // Remove specific functions
  },
  mangle: {
    keep_fnames: false,    // Mangle function names
  }
};

// Webpack production mode enables minification
// mode: 'production'

// Typical reductions:
// - Whitespace/comments: 10-20%
// - Variable mangling: 5-10%
// - Dead code removal: 5-15%
// - Total: 40-60% reduction`,
        explanation:
          'Minification giảm 40-60% bundle size. Production mode tự động enable. Terser là default. Drop console.log và dead code trong production.',
      },
    ],
    relatedTerms: ['Tree Shaking', 'Bundle Size', 'Build Optimization', 'Terser'],
    tags: ['minification', 'performance', 'bundle', 'build', 'optimization'],
  },
  {
    id: 'react-perf-18',
    term: 'Memoization Patterns',
    slug: 'memoization-patterns',
    category: 'React',
    definition:
      'Memoization Patterns là advanced techniques cache intermediate computations và avoid redundant calculations — trade memory for CPU time.',
    details:
      '**Patterns:**\n- Component memoization (React.memo)\n- Value memoization (useMemo)\n- Function memoization (useCallback)\n- Custom memoization (Map/WeakMap)\n- Selector memoization (reselect)\n\n**Advanced patterns:**\n- LRU Cache (Least Recently Used)\n- WeakMap for object keys\n- Stale-while-revalidate\n- Multi-level memoization\n\n**When to use:**\n- Expensive calculations\n- Repeated computations\n- Data transformations\n- Selector functions',
    examples: [
      {
        title: 'Advanced Memoization Patterns',
        code: `import { useMemo, useCallback, useRef } from 'react';

// LRU Cache implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value); // Move to end (most recent)
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

// Custom memoization with LRU cache
const lruCache = new LRUCache(50);

function memoizeWithLRU(fn) {
  return (...args) => {
    const key = JSON.stringify(args);
    let result = lruCache.get(key);
    if (result === undefined) {
      result = fn(...args);
      lruCache.set(key, result);
    }
    return result;
  };
}

// Expensive function with memoization
const fibonacci = memoizeWithLRU((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

// WeakMap for object memoization
const objectCache = new WeakMap();

function memoizeObject(obj) {
  if (!objectCache.has(obj)) {
    objectCache.set(obj, { ...obj, createdAt: Date.now() });
  }
  return objectCache.get(obj);
}

// Multi-level memoization
function createMemoizedSelector(selectorFn) {
  let lastArgs = null;
  let lastResult = null;

  return (...args) => {
    const argsChanged = !lastArgs || args.some((arg, i) => arg !== lastArgs[i]);
    
    if (argsChanged) {
      lastArgs = args;
      lastResult = selectorFn(...args);
    }
    
    return lastResult;
  };
}

// Usage
const selectFilteredItems = createMemoizedSelector(
  (items, filter) => items.filter(item => item.type === filter)
);`,
        explanation:
          'Advanced memoization patterns: LRU Cache cho limited memory, WeakMap cho object keys (auto GC), multi-level cho complex selectors. Trade memory cho CPU time.',
      },
    ],
    relatedTerms: ['useMemo', 'useCallback', 'React.memo', 'Caching'],
    tags: ['memoization', 'performance', 'caching', 'patterns', 'optimization'],
  },
  {
    id: 'react-perf-19',
    term: 'Concurrent Mode',
    slug: 'concurrent-mode',
    category: 'React',
    definition:
      'Concurrent Mode là React feature set cho phép interruptible rendering, priority-based updates và better user experience — React có thể pause và resume work.',
    details:
      '**Features:**\n- `startTransition`: Mark non-urgent updates\n- `useTransition`: Access transition state\n- `useDeferredValue`: Defer expensive values\n- Suspense: Declarative loading states\n\n**How it works:**\n- Urgent updates: Immediate (typing, clicks)\n- Transition updates: Deferred (filtering, sorting)\n- React interrupts low-priority work for high-priority\n\n**Benefits:**\n- Responsive UI during heavy operations\n- No jank during data fetching\n- Better perceived performance\n- Automatic optimization',
    examples: [
      {
        title: 'Concurrent Mode APIs',
        code: `import { useState, useTransition, useDeferredValue } from 'react';

// useTransition - mark low-priority updates
function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value) => {
    // Urgent: update input immediately
    setQuery(value);
    
    // Low priority: filter results (can be interrupted)
    startTransition(() => {
      const filtered = filterResults(value);
      setResults(filtered);
    });
  };

  return (
    <div>
      <input value={query} onChange={e => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <ResultsList data={results} />
    </div>
  );
}

// useDeferredValue - defer expensive value
function ExpensiveComponent({ query }) {
  // Deferred value updates after urgent renders
  const deferredQuery = useDeferredValue(query, {
    timeoutMs: 2000, // Max delay before forcing update
  });

  // Renders immediately with old value
  // Updates to new value when React has time
  const results = expensiveFilter(data, deferredQuery);

  return <ResultsList data={results} />;
}

// Comparison
function App() {
  const [text, setText] = useState('');
  
  // Without concurrent mode: blocks UI
  // const results = filterHugeList(text);
  
  // With concurrent mode: non-blocking
  const deferredText = useDeferredValue(text);
  const results = useMemo(
    () => filterHugeList(deferredText),
    [deferredText]
  );
  
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <Results data={results} />
    </>
  );
}`,
        explanation:
          'Concurrent Mode cho phép React prioritize updates. Urgent updates (input) không bị blocked bởi expensive operations (filtering). useTransition và useDeferredValue provide control.',
      },
    ],
    relatedTerms: ['React Fiber', 'Suspense', 'Priority Updates', 'Performance'],
    tags: ['concurrent-mode', 'performance', 'react-18', 'transitions', 'optimization'],
  },
  {
    id: 'react-perf-20',
    term: 'Render Blocking',
    slug: 'render-blocking',
    category: 'React',
    definition:
      'Render Blocking xảy ra khi JavaScript execution blocks browser từ painting/updating UI — gây jank, unresponsive UI và poor user experience.',
    details:
      '**Causes:**\n- Synchronous long-running computations\n- Large synchronous state updates\n- Blocking the main thread\n- Synchronous API calls in render\n\n**Solutions:**\n- Web Workers for heavy computations\n- Concurrent Mode (interruptible rendering)\n- Time slicing (break work into chunks)\n- Async operations\n\n**Detection:**\n- React DevTools Profiler\n- Chrome DevTools Performance tab\n- Long Tasks API\n- Web Vitals (FID, INP)',
    examples: [
      {
        title: 'Avoiding Render Blocking',
        code: `import { useState, useCallback } from 'react';

// ❌ Bad: Blocking render with heavy computation
function BadComponent() {
  const [result, setResult] = useState(null);

  const handleClick = () => {
    // Blocks main thread - UI freezes
    const output = heavyComputation(); // Takes 500ms
    setResult(output);
  };

  return <button onClick={handleClick}>Process</button>;
}

// ✅ Good: Web Worker for heavy computation
function GoodComponent() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    setLoading(true);
    
    // Non-blocking: runs in background thread
    const worker = new Worker('./worker.js');
    worker.onmessage = (e) => {
      setResult(e.data);
      setLoading(false);
      worker.terminate();
    };
    worker.postMessage('start');
  }, []);

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Processing...' : 'Process'}
      </button>
      {result && <Display data={result} />}
    </div>
  );
}

// ✅ Good: Time slicing with startTransition
import { useTransition } from 'react';

function TimeSlicedComponent({ data }) {
  const [processed, setProcessed] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleProcess = () => {
    // Break into chunks, React can interrupt
    startTransition(() => {
      const result = processInChunks(data);
      setProcessed(result);
    });
  };

  return (
    <div>
      <button onClick={handleProcess}>
        {isPending ? 'Processing...' : 'Process'}
      </button>
      {processed && <Display data={processed} />}
    </div>
  );
}

// worker.js (separate file)
self.onmessage = function(e) {
  const result = heavyComputation();
  self.postMessage(result);
};`,
        explanation:
          'Render blocking làm freeze UI. Web Workers offload heavy computations đến background thread. Concurrent Mode cho phép interruptible rendering. Time slicing break work thành chunks.',
      },
    ],
    relatedTerms: ['Web Workers', 'Concurrent Mode', 'Main Thread', 'Performance'],
    tags: ['render-blocking', 'performance', 'web-workers', 'concurrent', 'optimization'],
  },
]
