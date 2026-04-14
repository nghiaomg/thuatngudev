import type { GlossaryTerm } from '../../types'

export const memoryMetricsTerms: GlossaryTerm[] = [
  {
    id: 'infra-mem-1',
    term: 'Memory Usage (Used, Available, Cached)',
    slug: 'memory-usage',
    category: 'Infrastructure',
    definition:
      'Memory Usage đo lường lượng RAM đang được sử dụng so với tổng dung lượng. Bao gồm used memory (active), available memory (free + reclaimable), và cached memory (page cache).',
    details:
      '**Memory Types (Linux):**\n- **Used**: Memory actively used by processes\n- **Available**: Memory available for new processes (free + reclaimable)\n- **Free**: Completely unused memory\n- **Cached**: Page cache (disk blocks, file contents)\n- **Buffers**: Block device buffers\n- **Swap**: Disk-based memory extension\n\n**Linux Memory Breakdown:**\n```\nTotal = Used + Free + Buffers + Cached + Slab\nAvailable ≈ Free + Cached + Buffers (reclaimable)\n```\n\n**Key Metrics:**\n- **RSS (Resident Set Size)**: Physical memory used\n- **VSZ (Virtual Size)**: Total virtual memory\n- **PSS (Proportional Set Size)**: Shared memory / processes\n\n**Memory Usage Thresholds:**\n- **< 60%**: Healthy\n- **60-80%**: Normal\n- **80-90%**: Warning - investigate\n- **> 90%**: Critical - risk of OOM killer\n\n**Cached Memory:**\n- OS caches frequently accessed files\n- Automatically freed when applications need memory\n- High cache = good performance\n- Don\'t worry about high cache if available is sufficient',
    examples: [
      {
        title: 'Monitoring Memory Usage',
        code: `// Node.js: Get memory usage
const os = require('os');
const fs = require('fs');

function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usagePercent = (usedMem / totalMem * 100).toFixed(2);
  
  return {
    totalMB: (totalMem / 1024 / 1024).toFixed(0),
    usedMB: (usedMem / 1024 / 1024).toFixed(0),
    freeMB: (freeMem / 1024 / 1024).toFixed(0),
    availableMB: (getAvailableMemory() / 1024 / 1024).toFixed(0),
    usagePercent: usagePercent + '%',
    status: getMemoryStatus(parseFloat(usagePercent))
  };
}

// Read detailed memory info from /proc/meminfo
function getDetailedMemory() {
  const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
  const result = {};
  
  meminfo.split('\\n').forEach(line => {
    const match = line.match(/(\\w+):\\s+(\\d+)/);
    if (match) {
      result[match[1]] = parseInt(match[2]); // in kB
    }
  });
  
  return {
    memTotal: result.MemTotal,
    memFree: result.MemFree,
    memAvailable: result.MemAvailable,
    buffers: result.Buffers,
    cached: result.Cached,
    swapTotal: result.SwapTotal,
    swapFree: result.SwapFree,
    slab: result.Slabs,
    // Calculate actual used
    used: result.MemTotal - result.MemFree - result.Buffers - result.Cached
  };
}

// Process memory (Node.js)
function getProcessMemory() {
  const mem = process.memoryUsage();
  return {
    rss: (mem.rss / 1024 / 1024).toFixed(2) + ' MB',      // Resident Set Size
    heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
    heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
    external: (mem.external / 1024 / 1024).toFixed(2) + ' MB',
    arrayBuffers: (mem.arrayBuffers / 1024 / 1024).toFixed(2) + ' MB'
  };
}

// Alert on high memory usage
const memUsage = getMemoryUsage();
if (parseFloat(memUsage.usagePercent) > 90) {
  console.error('🔴 CRITICAL: Memory usage > 90%');
  console.error('Risk of OOM killer - investigate immediately');
} else if (parseFloat(memUsage.usagePercent) > 80) {
  console.warn('⚠️  WARNING: Memory usage > 80%');
}

// Memory-efficient: Clear caches if needed
if (process.platform === 'linux') {
  // Clear page cache (requires root)
  // echo 3 > /proc/sys/vm/drop_caches
}`,
        explanation:
          'Memory usage = used / total. Available memory includes free + reclaimable cache. High cache is good (performance), don\'t confuse with memory pressure.',
      },
    ],
    relatedTerms: ['Swap Usage', 'Memory Leaks', 'Garbage Collection', 'OOM Killer'],
    tags: ['memory', 'ram', 'infrastructure', 'monitoring', 'performance'],
  },
  {
    id: 'infra-mem-2',
    term: 'Swap Usage',
    slug: 'swap-usage',
    category: 'Infrastructure',
    definition:
      'Swap Usage là lượng disk space được sử dụng như RAM extension khi physical memory đầy. Swap chậm hơn RAM 1000x, high swap usage gây severe performance degradation.',
    details:
      '**What is Swap:**\n- Disk partition/file used as virtual memory\n- Kernel moves inactive pages from RAM to swap\n- Frees RAM for active processes\n\n**Swap Types:**\n- **Swap Partition**: Dedicated disk partition (faster)\n- **Swap File**: Regular file on filesystem (flexible)\n- **ZRAM**: Compressed RAM (fastest, uses CPU)\n- **ZSWAP**: Compressed cache before disk swap\n\n**When Swap is Used:**\n- Physical memory pressure\n- Long-running idle processes\n- Memory leaks\n- Insufficient RAM for workload\n\n**Performance Impact:**\n- RAM access: ~100 nanoseconds\n- SSD swap: ~100 microseconds (1000x slower)\n- HDD swap: ~10 milliseconds (100,000x slower)\n\n**Swap Metrics:**\n- **Swap Total**: Total swap space\n- **Swap Used**: Currently used swap\n- **Swap In/Out**: Pages swapped per second\n- **Swap Cache**: Cached swap pages\n\n**Thresholds:**\n- **0-10%**: Normal (some idle pages swapped)\n- **10-50%**: Warning - memory pressure\n- **> 50%**: Critical - severe performance impact\n- **Swapping actively**: Emergency - add RAM now',
    examples: [
      {
        title: 'Monitoring Swap Usage',
        code: `const fs = require('fs');
const os = require('os');

function getSwapUsage() {
  const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
  const result = {};
  
  meminfo.split('\\n').forEach(line => {
    const match = line.match(/(\\w+):\\s+(\\d+)/);
    if (match) {
      result[match[1]] = parseInt(match[2]);
    }
  });
  
  const swapTotal = result.SwapTotal || 0;
  const swapFree = result.SwapFree || 0;
  const swapUsed = swapTotal - swapFree;
  const swapPercent = swapTotal > 0 ? (swapUsed / swapTotal * 100) : 0;
  
  return {
    totalMB: (swapTotal / 1024).toFixed(0),
    usedMB: (swapUsed / 1024).toFixed(0),
    freeMB: (swapFree / 1024).toFixed(0),
    usagePercent: swapPercent.toFixed(2) + '%',
    status: getSwapStatus(swapPercent),
    hasSwap: swapTotal > 0
  };
}

function getSwapStatus(percent) {
  if (percent === 0) return '✅ No swap used';
  if (percent < 10) return '✅ Minimal swap';
  if (percent < 50) return '⚠️  Moderate swap - memory pressure';
  return '🔴 High swap - severe performance impact';
}

// Check swap activity (pages swapped per second)
async function getSwapActivity(interval = 1000) {
  const vmstat1 = fs.readFileSync('/proc/vmstat', 'utf8');
  const pswpin1 = extractVmstat(vmstat1, 'pswpin');
  const pswpout1 = extractVmstat(vmstat1, 'pswpout');
  
  await new Promise(resolve => setTimeout(resolve, interval));
  
  const vmstat2 = fs.readFileSync('/proc/vmstat', 'utf8');
  const pswpin2 = extractVmstat(vmstat2, 'pswpin');
  const pswpout2 = extractVmstat(vmstat2, 'pswpout');
  
  const intervalSec = interval / 1000;
  return {
    swapInPerSec: ((pswpin2 - pswpin1) / intervalSec).toFixed(0),
    swapOutPerSec: ((pswpout2 - pswpout1) / intervalSec).toFixed(0),
    activelySwapping: (pswpout2 - pswpin1) > 0
  };
}

function extractVmstat(vmstat, key) {
  const match = vmstat.match(new RegExp(\`\${key}\\\\s+(\\\\d+)\`));
  return match ? parseInt(match[1]) : 0;
}

// Alert on active swapping
const swapUsage = getSwapUsage();
const swapActivity = getSwapActivitySync();

if (swapActivity.activelySwapping) {
  console.error('🔴 CRITICAL: Active swapping detected!');
  console.error('Add RAM or reduce memory usage immediately');
} else if (parseFloat(swapUsage.usagePercent) > 50) {
  console.warn('⚠️  WARNING: High swap usage');
}

// Kubernetes: Configure swap
// Some K8s distributions disable swap by default
// kubelet requires swap off (traditionally)
// K8s 1.22+: Alpha support for swap`,
        explanation:
          'Swap usage indicates memory pressure. Active swapping (swap in/out) severely impacts performance. Monitor both usage % and swap activity rate.',
      },
    ],
    relatedTerms: ['Memory Usage', 'OOM Killer', 'Memory Leaks', 'ZRAM'],
    tags: ['swap', 'memory', 'virtual-memory', 'infrastructure', 'performance'],
  },
  {
    id: 'infra-mem-3',
    term: 'Memory Leaks Detection',
    slug: 'memory-leaks-detection',
    category: 'Infrastructure',
    definition:
      'Memory Leaks xảy ra khi application allocates memory nhưng không freeing nó sau khi không còn sử dụng. Dần dần consume hết available memory, gây crashes hoặc OOM kills.',
    details:
      '**What Causes Memory Leaks:**\n- Unclosed connections/sockets\n- Event listeners not removed\n- Global variables accumulating\n- Caches without expiration\n- Closures holding references\n- Timers/intervals not cleared\n\n**Leak Symptoms:**\n- Memory usage grows monotonically\n- Restarts temporarily fix issue\n- Garbage collection doesn\'t reclaim memory\n- Eventually crashes with OOM\n\n**Detection Methods:**\n1. **Monitoring**: Track RSS over time\n2. **Heap Dumps**: Snapshot memory at intervals\n3. **Profiling**: Compare heap snapshots\n4. **Valgrind**: Native memory analysis (C/C++)\n5. **Node.js --inspect**: Chrome DevTools\n\n**Common JavaScript Leaks:**\n- `global.leakedVar = hugeObject`\n- Forgotten `setInterval`\n- Accumulating logs/arrays\n- Detached DOM nodes (browser)\n\n**Prevention:**\n- Use `const` instead of `var`\n- Clear references when done\n- Set max size for caches\n- Remove event listeners\n- Use WeakMap/WeakSet',
    examples: [
      {
        title: 'Detecting Memory Leaks in Node.js',
        code: `// Monitor memory growth over time
const os = require('os');

class MemoryLeakDetector {
  constructor() {
    this.samples = [];
    this.interval = null;
  }

  start(intervalMs = 60000) { // Every minute
    this.interval = setInterval(() => {
      const mem = process.memoryUsage();
      const sample = {
        timestamp: Date.now(),
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external
      };
      
      this.samples.push(sample);
      // Keep last 24 hours
      if (this.samples.length > 1440) {
        this.samples.shift();
      }
      
      this.checkForLeaks();
    }, intervalMs);
  }

  checkForLeaks() {
    if (this.samples.length < 10) return;
    
    // Check RSS growth over last hour
    const recentSamples = this.samples.slice(-60);
    const firstRSS = recentSamples[0].rss;
    const lastRSS = recentSamples[recentSamples.length - 1].rss;
    const growth = ((lastRSS - firstRSS) / firstRSS) * 100;
    
    // If memory grows > 5% per hour consistently
    if (growth > 5) {
      console.warn(\`⚠️  Possible memory leak: RSS grew \${growth.toFixed(2)}% in 1 hour\`);
      console.warn(\`Start: \${(firstRSS / 1024 / 1024).toFixed(2)} MB\`);
      console.warn(\`End: \${(lastRSS / 1024 / 1024).toFixed(2)} MB\`);
      
      // Trigger heap dump
      this.captureHeapDump();
    }
  }

  captureHeapDump() {
    // Requires: npm install heapdump
    // const heapdump = require('heapdump');
    // const filename = \`heapdump-\${Date.now()}.heapsnapshot\`;
    // heapdump.writeSnapshot(filename, (err, filename) => {
    //   console.log(\`Heap dump written: \${filename}\`);
    // });
    console.log('Heap dump captured');
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

// Usage
const detector = new MemoryLeakDetector();
detector.start(60000); // Check every minute

// Common leak patterns to avoid:

// LEAK: Growing array without limit
const logs = [];
function addLog(log) {
  logs.push(log); // Never cleared!
}

// FIX: Use bounded array
const logsBounded = [];
const MAX_LOGS = 10000;
function addLogBounded(log) {
  logsBounded.push(log);
  if (logsBounded.length > MAX_LOGS) {
    logsBounded.shift(); // Remove oldest
  }
}

// LEAK: Event listeners accumulating
emitter.on('data', handler); // Added repeatedly

// FIX: Remove or use once
emitter.once('data', handler);
// Or: emitter.removeListener('data', handler);`,
        explanation:
          'Memory leaks detected by monitoring RSS growth over time. >5% growth per hour indicates potential leak. Heap dumps help identify what\'s being retained.',
      },
    ],
    relatedTerms: ['Memory Usage', 'Garbage Collection', 'OOM Killer', 'Heap Dumps'],
    tags: ['memory-leaks', 'memory', 'debugging', 'infrastructure', 'nodejs'],
  },
  {
    id: 'infra-mem-4',
    term: 'Garbage Collection Pauses',
    slug: 'gc-pauses',
    category: 'Infrastructure',
    definition:
      'Garbage Collection (GC) Pauses là thời gian application bị stop-the-world khi GC reclaim unused memory. Long GC pauses gây latency spikes và timeout errors.',
    details:
      '**What is Garbage Collection:**\n- Automatic memory management\n- Identifies and frees unreachable objects\n- Runs periodically in background\n\n**GC Types (V8/Node.js):**\n1. **Scavenge**: Fast, minor generation\n2. **Mark-Sweep-Compact**: Major generation\n3. **Mark-Compact**: Full GC (slowest)\n4. **Incremental**: Breaks GC into smaller chunks\n\n**GC Pause Impact:**\n- **< 10ms**: Negligible\n- **10-50ms**: Noticeable but acceptable\n- **50-100ms**: Latency spikes\n- **> 100ms**: Timeout errors\n- **> 500ms**: Service disruption\n\n**GC Pause Causes:**\n- Large heap size\n- Many object allocations\n- Memory pressure\n- Fragmented heap\n- Full GC triggered\n\n**Monitoring GC:**\n- Node.js: `--trace-gc` flag\n- `node --trace-gc app.js`\n- Parse GC logs for pause duration\n- Prometheus: `nodejs_gc_duration_seconds`\n\n**Optimization Strategies:**\n- Reduce object allocations\n- Use object pools\n- Limit heap size\n- Use streams for large data\n- Avoid synchronous operations',
    examples: [
      {
        title: 'Monitoring GC Pauses',
        code: `// Enable GC tracing: node --trace-gc app.js

// Parse GC logs
const { PerformanceObserver } = require('perf_hooks');

// Method 1: Using performance hooks (Node.js 8.5+)
const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((item) => {
    if (item.kind === 'gc') {
      const durationMs = item.duration;
      const gcType = getGcType(item.flags);
      
      console.log(\`GC (\${gcType}): \${durationMs.toFixed(2)}ms\`);
      
      if (durationMs > 100) {
        console.warn(\`🔴 Long GC pause: \${durationMs.toFixed(2)}ms\`);
      }
    }
  });
});

obs.observe({ entryTypes: ['gc'] });

function getGcType(flags) {
  // GC type flags from V8
  if (flags & (1 << 1)) return 'Scavenge';
  if (flags & (1 << 2)) return 'Mark-Sweep-Compact';
  if (flags & (1 << 3)) return 'Incremental';
  return 'Unknown';
}

// Method 2: Manual GC tracking
let gcPauseTotal = 0;
let gcCount = 0;
let maxGcPause = 0;

// Parse --trace-gc output
function parseGcLogs(logs) {
  const gcLogs = [];
  const lines = logs.split('\\n');
  
  for (const line of lines) {
    const match = line.match(
      /\\[GC\\].*?([\\d.]+) ms\\.?/
    );
    if (match) {
      const pauseMs = parseFloat(match[1]);
      gcLogs.push({
        timestamp: Date.now(),
        pauseMs: pauseMs,
        isLong: pauseMs > 50
      });
      
      gcPauseTotal += pauseMs;
      gcCount++;
      maxGcPause = Math.max(maxGcPause, pauseMs);
    }
  }
  
  return {
    totalPauses: gcCount,
    totalPauseMs: gcPauseTotal,
    avgPauseMs: gcPauseTotal / gcCount,
    maxPauseMs: maxGcPause,
    longPauses: gcLogs.filter(g => g.isLong).length
  };
}

// Reduce GC pressure:

// BAD: Create many short-lived objects
function processDataBad(data) {
  return data.map(item => ({
    ...item,
    processed: true,
    timestamp: Date.now(),
    metadata: { ...item.meta }
  }));
}

// BETTER: Reuse objects or use streams
function processDataBetter(data) {
  for (const item of data) {
    item.processed = true;
    item.timestamp = Date.now();
  }
  return data;
}

// For large datasets: Use streams
const fs = require('fs');
const readStream = fs.createReadStream('large-file.json');
readStream.on('data', chunk => {
  // Process chunk-by-chunk
  // Avoid loading entire file into memory
});`,
        explanation:
          'GC pauses cause latency spikes. Monitor GC duration and frequency. Reduce object allocations and use streams to minimize GC pressure. >100ms pauses cause timeouts.',
      },
    ],
    relatedTerms: ['Memory Usage', 'Memory Leaks', 'V8 Engine', 'Performance'],
    tags: ['garbage-collection', 'gc', 'memory', 'performance', 'nodejs'],
  },
]
