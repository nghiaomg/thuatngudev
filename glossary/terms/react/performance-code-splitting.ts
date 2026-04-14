import type { GlossaryTerm } from '../../types'

export const codeSplitTerms: GlossaryTerm[] = [
  {
    id: 'react-perf-4',
    term: 'Code Splitting',
    slug: 'code-splitting',
    category: 'React',
    definition:
      'Code Splitting là kỹ thuật chia nhỏ JavaScript bundle thành các chunks nhỏ hơn, load on-demand — giảm initial bundle size và cải thiện page load time.',
    details:
      '**Phương pháp:**\n- Dynamic import: `import()` syntax\n- React.lazy: Lazy load components\n- Route-based splitting: Load per route\n- Component-based splitting: Load on interaction\n\n**Benefits:**\n- Giảm initial load time\n- Better caching (smaller chunks)\n- Improved Time to Interactive (TTI)\n- Reduced bandwidth usage\n\n**Tools:**\n- Webpack: Automatic code splitting\n- Vite: Dynamic imports\n- Next.js: Automatic route-based splitting',
    examples: [
      {
        title: 'React.lazy and Suspense',
        code: `import { lazy, Suspense } from 'react';

// Lazy load component
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}

// Route-based code splitting
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}`,
        explanation:
          'React.lazy + Suspense cho phép lazy load components. Code chỉ được load khi component được render, giảm initial bundle size.',
      },
      {
        title: 'Conditional Code Splitting',
        code: `import { useState, lazy, Suspense } from 'react';

function TextEditor() {
  const [showMarkdown, setShowMarkdown] = useState(false);

  // Only load Markdown editor when needed
  const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

  return (
    <div>
      <button onClick={() => setShowMarkdown(true)}>
        Switch to Markdown
      </button>
      
      {showMarkdown && (
        <Suspense fallback={<div>Loading editor...</div>}>
          <MarkdownEditor />
        </Suspense>
      )}
    </div>
  );
}

// Named exports with lazy
const Components = lazy(() => 
  import('./components').then(module => ({
    default: module.ExpensiveComponent
  }))
);`,
        explanation:
          'Conditional splitting: load features only when user requests them. Named exports require transformation.',
      },
    ],
    relatedTerms: ['React.lazy', 'Suspense', 'Dynamic Import', 'Bundle Size', 'Lazy Loading'],
    tags: ['code-splitting', 'performance', 'bundle', 'lazy-loading', 'optimization'],
  },
  {
    id: 'react-perf-5',
    term: 'React.lazy',
    slug: 'react-lazy',
    category: 'React',
    definition:
      'React.lazy cho phép render dynamic import như regular component — component chỉ được load khi được render, giúp giảm initial bundle size.',
    details:
      '**Signature:** `const LazyComponent = lazy(() => import(\'./Component\'))`\n\n**Requirements:**\n- Must be used with Suspense boundary\n- Only works with default exports\n- Only in client components (not server components)\n\n**Use cases:**\n- Route-based splitting\n- Modal/dialog loading\n- Heavy features (charts, editors)\n- Conditional features\n\n**Error handling:**\n- Use Error Boundary với lazy components\n- Handle network failures\n- Provide fallback UI',
    examples: [
      {
        title: 'Lazy Loading with Error Handling',
        code: `import { lazy, Suspense } from 'react';

// Error Boundary for lazy components
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}`,
        explanation:
          'Error Boundary catches lazy loading errors. Suspense provides loading state. Combined for robust error handling.',
      },
    ],
    relatedTerms: ['Code Splitting', 'Suspense', 'Dynamic Import', 'Error Boundary', 'Lazy Loading'],
    tags: ['react-lazy', 'performance', 'lazy-loading', 'code-splitting', 'dynamic-import'],
  },
  {
    id: 'react-perf-6',
    term: 'Suspense',
    slug: 'suspense',
    category: 'React',
    definition:
      'Suspense là React component cho phép "wait" cho quelque chose trước khi render — thường dùng với lazy loading và data fetching để show loading states.',
    details:
      '**Usage:** `<Suspense fallback={<Loading />}>{children}</Suspense>`\n\n**Features:**\n- Declarative loading states\n- Works with React.lazy\n- Nested Suspense boundaries\n- Concurrent Mode support\n\n**Best practices:**\n- Place Suspense close to lazy component\n- Provide meaningful fallback UI\n- Can nest multiple Suspense boundaries\n- Not for all async operations yet',
    examples: [
      {
        title: 'Nested Suspense Boundaries',
        code: `import { lazy, Suspense } from 'react';

const Header = lazy(() => import('./Header'));
const Sidebar = lazy(() => import('./Sidebar'));
const Content = lazy(() => import('./Content'));

function App() {
  return (
    <Suspense fallback={<MainLoader />}>
      <Header />
      <div className="layout">
        <Suspense fallback={<SidebarLoader />}>
          <Sidebar />
        </Suspense>
        <Suspense fallback={<ContentLoader />}>
          <Content />
        </Suspense>
      </div>
    </Suspense>
  );
}`,
        explanation:
          'Nested Suspense cho phép independent loading states cho different sections. Mỗi section có loading UI riêng.',
      },
    ],
    relatedTerms: ['React.lazy', 'Code Splitting', 'Concurrent Mode', 'Loading States'],
    tags: ['suspense', 'performance', 'lazy-loading', 'loading', 'concurrent'],
  },
]
