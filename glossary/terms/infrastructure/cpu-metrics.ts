import type { GlossaryTerm } from '../../types'

export const cpuMetricsTerms: GlossaryTerm[] = [
  {
    id: 'infra-cpu-1',
    term: 'CPU Usage %',
    slug: 'cpu-usage-percent',
    category: 'Infrastructure',
    definition:
      'CPU Usage % đo lường phần trăm thời gian CPU đang thực thi công việc so với tổng thời gian có sẵn. Metric quan trọng nhất để đánh giá CPU utilization và performance.',
    details:
      '**CPU Usage Types:**\n- **User CPU Time**: Time spent running user processes\n- **System CPU Time**: Time spent running kernel/system code\n- **Idle Time**: CPU doing nothing\n- **I/O Wait Time**: CPU waiting for I/O operations\n\n**Calculation:**\n```\nCPU Usage % = (Total Time - Idle Time) / Total Time × 100\n```\n\n**Thresholds:**\n- **0-50%**: Healthy, plenty of capacity\n- **50-70%**: Normal operation\n- **70-85%**: Warning - monitor closely\n- **85-95%**: Critical - consider scaling\n- **95-100%**: Emergency - performance degradation\n\n**Per-core vs Total:**\n- Per-core shows individual CPU utilization\n- Total shows average across all cores\n- Multi-core systems: 100% = all cores fully utilized\n\n**Common Issues:**\n- High CPU with low throughput = inefficient code\n- Spiky CPU = batch jobs or traffic spikes\n- Consistently high = need more resources',
    examples: [
      {
        title: 'Monitoring CPU Usage',
        code: `// Node.js CPU Usage
const os = require('os');

// Get CPU usage over time interval
function getCpuUsage(interval = 1000) {
  const startUsage = process.cpuUsage();
  const startCpu = os.cpus();

  return new Promise((resolve) => {
    setTimeout(() => {
      const endUsage = process.cpuUsage(startUsage);
      const endCpu = os.cpus();

      // Calculate CPU usage percentage
      const totalIdle = endCpu.reduce((sum, cpu) => sum + cpu.times.idle, 0);
      const totalTicks = endCpu.reduce((sum, cpu) => {
        return sum + cpu.times.user + cpu.times.nice + 
               cpu.times.sys + cpu.times.irq + cpu.times.idle;
      }, 0);

      const cpuUsage = ((totalTicks - totalIdle) / totalTicks) * 100;

      // Process-specific usage
      const userMs = endUsage.user / 1000;
      const systemMs = endUsage.system / 1000;

      resolve({
        cpuUsage: cpuUsage.toFixed(2) + '%',
        userTime: userMs.toFixed(2) + 'ms',
        systemTime: systemMs.toFixed(2) + 'ms',
        cores: endCpu.length,
        perCore: endCpu.map(cpu => ({
          model: cpu.model,
          speed: cpu.speed,
          usage: (1 - cpu.times.idle / 
            (cpu.times.user + cpu.times.nice + cpu.times.sys + 
             cpu.times.irq + cpu.times.idle)) * 100
        }))
      });
    }, interval);
  });
}

// Prometheus metrics
const prometheus = require('prom-client');
const cpuGauge = new prometheus.Gauge({
  name: 'cpu_usage_percent',
  help: 'Current CPU usage percentage',
  labelNames: ['core']
});

// Update every 5 seconds
setInterval(async () => {
  const usage = await getCpuUsage();
  cpuGauge.set({ core: 'total' }, parseFloat(usage.cpuUsage));
  usage.perCore.forEach((core, idx) => {
    cpuGauge.set({ core: idx.toString() }, core.usage);
  });
}, 5000);`,
        explanation:
          'CPU usage calculated by measuring idle vs active time. Per-core metrics help identify uneven load distribution. Process.cpuUsage() gives Node.js specific usage.',
      },
      {
        title: 'Load Average vs CPU Usage',
        code: `// Load Average (Linux/Unix)
const os = require('os');

const loadAvg = os.loadavg();
console.log({
  '1min': loadAvg[0],
  '5min': loadAvg[1],
  '15min': loadAvg[2]
});

// Interpret load average
const numCpus = os.cpus().length;
const load15 = loadAvg[2];

if (load15 < numCpus * 0.7) {
  console.log('✅ CPU capacity sufficient');
} else if (load15 < numCpus) {
  console.log('⚠️ CPU utilization moderate');
} else if (load15 < numCpus * 1.5) {
  console.log('🔶 CPU utilization high');
} else {
  console.log('🔴 CPU overloaded - performance impact');
}

// Container CPU throttling (Docker/K8s)
// When container exceeds CPU limit, kernel throttles it
// Check throttling in /sys/fs/cgroup/cpu/
function getContainerCpuThrottling() {
  const fs = require('fs');
  try {
    const throttled = fs.readFileSync(
      '/sys/fs/cgroup/cpu/cpu.stat', 'utf8'
    );
    const lines = throttled.split('\\n');
    const result = {};
    lines.forEach(line => {
      const [key, value] = line.split(' ');
      result[key] = parseInt(value);
    });
    return {
      periods: result.nr_periods,
      throttledPeriods: result.nr_throttled,
      throttledTime: result.throttled_time
    };
  } catch (e) {
    return null; // Not in container
  }
}`,
        explanation:
          'Load average shows processes waiting for CPU. Load > number of cores = bottleneck. Containers get throttled when exceeding CPU limits.',
      },
    ],
    relatedTerms: ['Load Average', 'CPU Throttling', 'Context Switches', 'Infrastructure Monitoring'],
    tags: ['cpu', 'metrics', 'infrastructure', 'monitoring', 'performance'],
  },
  {
    id: 'infra-cpu-2',
    term: 'Load Average',
    slug: 'load-average',
    category: 'Infrastructure',
    definition:
      'Load Average là số lượng processes đang chạy hoặc waiting for CPU trong khoảng thời gian 1 phút, 5 phút, và 15 phút. Cho biết system load trend và CPU capacity.',
    details:
      '**Load Average Intervals:**\n- **1-minute**: Recent load, short-term spikes\n- **5-minute**: Medium-term trend\n- **15-minute**: Long-term baseline\n\n**Interpretation (per CPU core):**\n- **< 0.7**: System underutilized\n- **0.7 - 1.0**: Optimal utilization\n- **1.0 - 1.5**: High but manageable\n- **> 1.5**: Overloaded, performance degradation\n\n**For multi-core systems:**\n- Divide load average by number of cores\n- 4 cores: load 4.0 = 100% utilization\n- 8 cores: load 8.0 = 100% utilization\n\n**Load Average includes:**\n- Running processes (on CPU)\n- Runnable processes (waiting for CPU)\n- Uninterruptible sleep (usually disk I/O)\n\n**Difference from CPU Usage %:**\n- Load Average = queue length (processes waiting)\n- CPU Usage % = utilization rate (CPU busy time)\n- High CPU + Low Load = efficient\n- Low CPU + High Load = I/O bottleneck',
    examples: [
      {
        title: 'Load Average Analysis',
        code: `// Linux: Read from /proc/loadavg
const fs = require('fs');

function getLoadAverage() {
  const loadavg = fs.readFileSync('/proc/loadavg', 'utf8');
  const [load1, load5, load15, processes] = loadavg.split(' ');
  
  const numCpus = require('os').cpus().length;
  
  return {
    load1: parseFloat(load1),
    load5: parseFloat(load5),
    load15: parseFloat(load15),
    totalProcesses: parseInt(processes.split('/')[1]),
    runningProcesses: parseInt(processes.split('/')[0]),
    perCore: {
      load1: parseFloat(load1) / numCpus,
      load5: parseFloat(load5) / numCpus,
      load15: parseFloat(load15) / numCpus
    },
    status: getLoadStatus(parseFloat(load15), numCpus)
  };
}

function getLoadStatus(load15, numCpus) {
  const ratio = load15 / numCpus;
  if (ratio < 0.7) return 'underutilized';
  if (ratio < 1.0) return 'optimal';
  if (ratio < 1.5) return 'high';
  return 'overloaded';
}

// Alert logic
const load = getLoadAverage();
if (load.perCore.load15 > 1.5) {
  console.error('🔴 CRITICAL: Load average exceeds 1.5 per core');
  console.error('Recommendation: Scale horizontally or optimize processes');
} else if (load.perCore.load15 > 1.0) {
  console.warn('⚠️  WARNING: Load average above 1.0 per core');
}

// Compare with CPU usage
function analyzeLoadVsCpu() {
  const load = getLoadAverage();
  const cpuUsage = getCpuUsageSync(); // from previous term
  
  if (load.perCore.load15 > 1.0 && cpuUsage < 70) {
    console.log('High load + low CPU = I/O bottleneck');
    console.log('Check disk latency and network');
  } else if (load.perCore.load15 < 0.5 && cpuUsage > 80) {
    console.log('Low load + high CPU = CPU-intensive tasks');
    console.log('Consider CPU optimization');
  }
}`,
        explanation:
          'Load average reveals process queue depth. Compare with CPU usage to identify I/O vs CPU bottlenecks. 15-minute average best for capacity planning.',
      },
    ],
    relatedTerms: ['CPU Usage %', 'CPU Throttling', 'Context Switches', 'Process Management'],
    tags: ['load-average', 'cpu', 'infrastructure', 'monitoring', 'linux'],
  },
  {
    id: 'infra-cpu-3',
    term: 'CPU Throttling (Containers)',
    slug: 'cpu-throttling-containers',
    category: 'Infrastructure',
    definition:
      'CPU Throttling xảy ra khi container vượt quá CPU limit được cấu hình trong Docker/Kubernetes. Kernel sẽ giới hạn CPU time, gây performance degradation cho ứng dụng.',
    details:
      '**Container CPU Limits:**\n- Set via Docker: `--cpus=1.5` (1.5 CPU cores)\n- Kubernetes: `resources.limits.cpu: "1500m"`\n- Enforced by CFS (Completely Fair Scheduler)\n\n**How Throttling Works:**\n1. Container gets CPU quota per period\n2. When quota exhausted, processes throttled\n3. Throttled processes wait for next period\n4. Period typically 100ms\n\n**Throttling Metrics (from cpu.stat):**\n- `nr_periods`: Total scheduling periods\n- `nr_throttled`: Periods where container was throttled\n- `throttled_time`: Total time spent throttled (nanoseconds)\n\n**Throttling Impact:**\n- Increased latency\n- Request timeouts\n- Poor user experience\n- False health check failures\n\n**When to Adjust Limits:**\n- Throttling > 10% of periods\n- Application latency spikes correlate with throttling\n- Consistent high CPU usage pattern\n\n**Best Practices:**\n- Set limits based on actual usage + 20% buffer\n- Monitor throttling metrics alongside CPU usage\n- Use requests for scheduling, limits for protection\n- Avoid setting limits too low (causes throttling)',
    examples: [
      {
        title: 'Detecting CPU Throttling',
        code: `// Monitor container CPU throttling
const fs = require('fs');
const path = '/sys/fs/cgroup/cpu/cpu.stat';

function getCpuThrottling() {
  try {
    const stat = fs.readFileSync(path, 'utf8');
    const lines = stat.trim().split('\\n');
    const metrics = {};
    
    lines.forEach(line => {
      const [key, value] = line.split(' ');
      metrics[key] = parseInt(value);
    });
    
    const throttlePercent = metrics.nr_periods > 0
      ? (metrics.nr_throttled / metrics.nr_periods * 100).toFixed(2)
      : 0;
    
    return {
      periods: metrics.nr_periods,
      throttledPeriods: metrics.nr_throttled,
      throttledTimeNs: metrics.throttled_time,
      throttledTimeMs: metrics.throttled_time / 1000000,
      throttlePercent: parseFloat(throttlePercent),
      status: getThrottleStatus(parseFloat(throttlePercent))
    };
  } catch (e) {
    return { error: 'Not in container or file not accessible' };
  }
}

function getThrottleStatus(percent) {
  if (percent < 5) return '✅ Healthy';
  if (percent < 10) return '⚠️  Minor throttling';
  if (percent < 25) return '🔶 Moderate throttling';
  return '🔴 Severe throttling - increase limits';
}

// Kubernetes: Get pod CPU throttling via kubectl
// kubectl exec <pod> -- cat /sys/fs/cgroup/cpu/cpu.stat

// Docker: Inspect container
// docker inspect <container> | grep -A 10 CpuQuota

// Prometheus metrics for containers
const client = require('prom-client');

const throttleGauge = new client.Gauge({
  name: 'container_cpu_throttle_percent',
  help: 'Percentage of time container is throttled',
  labelNames: ['container_id', 'namespace']
});

// Alert on throttling
const throttling = getCpuThrottling();
if (throttling.throttlePercent > 10) {
  console.warn(\`Container throttled \${throttling.throttlePercent}% of time\`);
  console.log('Recommendation: Increase CPU limit by 20-30%');
}

// Calculate optimal CPU limit
function calculateOptimalCpuLimit(currentLimit, avgUsage, p95Usage) {
  // Add 20% buffer to P95 usage
  const recommended = p95Usage * 1.2;
  return Math.max(currentLimit, recommended);
}`,
        explanation:
          'Throttling metrics show when container hits CPU limits. >10% throttling indicates limit too low. Set limits based on P95 usage + buffer, not average.',
      },
    ],
    relatedTerms: ['CPU Usage %', 'Container Metrics', 'Kubernetes', 'Resource Limits'],
    tags: ['cpu-throttling', 'containers', 'docker', 'kubernetes', 'infrastructure'],
  },
  {
    id: 'infra-cpu-4',
    term: 'Context Switches',
    slug: 'context-switches',
    category: 'Infrastructure',
    definition:
      'Context Switches là số lần CPU chuyển đổi giữa các processes/threads. Mỗi switch lưu state của process hiện tại và load state của process mới. High context switching overhead giảm performance.',
    details:
      '**What is a Context Switch:**\n1. Save current process state (registers, program counter)\n2. Load next process state\n3. Update memory management units\n4. Flush CPU caches (performance impact)\n\n**Types of Context Switches:**\n- **Voluntary**: Process yields CPU (waiting for I/O, sleep)\n- **Involuntary**: Scheduler preempts process (time slice expired)\n\n**Cost of Context Switch:**\n- 1-10 microseconds per switch\n- Cache/TLB flush overhead\n- Pipeline stall\n- Memory access latency increase\n\n**When Context Switches are High:**\n- Many threads competing for few cores\n- Thread count >> core count\n- Excessive I/O operations\n- Lock contention causing thread switching\n\n**Optimal Configuration:**\n- Thread count ≈ core count (for CPU-bound)\n- Thread count = 2-4x core count (for I/O-bound)\n- Use async I/O to reduce thread count\n- Avoid busy-waiting loops\n\n**Monitoring:**\n- Linux: `/proc/stat` (ctxt field)\n- `vmstat 1` (cs column)\n- `pidstat -w 1` (per-process)',
    examples: [
      {
        title: 'Monitoring Context Switches',
        code: `// Read context switches from /proc/stat
const fs = require('fs');

function getContextSwitches() {
  const stat = fs.readFileSync('/proc/stat', 'utf8');
  const lines = stat.split('\\n');
  
  for (const line of lines) {
    if (line.startsWith('ctxt ')) {
      const parts = line.split(/\\s+/);
      return {
        totalContextSwitches: parseInt(parts[1]),
        perSecond: null // Need to calculate over time
      };
    }
  }
}

// Calculate context switches per second
async function getContextSwitchRate(interval = 1000) {
  const start = getContextSwitches();
  await new Promise(resolve => setTimeout(resolve, interval));
  const end = getContextSwitches();
  
  const rate = (end.totalContextSwitches - start.totalContextSwitches) / 
               (interval / 1000);
  
  return {
    total: end.totalContextSwitches,
    perSecond: rate,
    perMinute: rate * 60,
    status: getContextSwitchStatus(rate)
  };
}

function getContextSwitchStatus(ratePerSec) {
  const numCpus = require('os').cpus().length;
  const perCore = ratePerSec / numCpus;
  
  if (perCore < 1000) return '✅ Low overhead';
  if (perCore < 5000) return '⚠️  Moderate';
  if (perCore < 10000) return '🔶 High - optimize thread count';
  return '🔴 Very high - performance impact';
}

// Node.js: Monitor with async hooks
const { PerformanceObserver } = require('perf_hooks');

// Optimize: Use worker threads wisely
const { Worker, isMainThread, workerData } = require('worker_threads');

if (isMainThread) {
  // Don't create more workers than CPU cores
  const numWorkers = require('os').cpus().length;
  console.log(\`Creating \${numWorkers} workers for \${numWorkers} cores\`);
  
  for (let i = 0; i < numWorkers; i++) {
    new Worker(__filename, { workerData: { id: i } });
  }
} else {
  // Worker logic
  console.log(\`Worker \${workerData.id} running\`);
}

// High context switches? Reduce threads:
// Before: 100 threads for 4 cores
// After: 4-8 threads or async I/O`,
        explanation:
          'Context switches add latency. Keep threads ≈ cores for CPU-bound workloads. Async I/O reduces thread count and context switches dramatically.',
      },
    ],
    relatedTerms: ['CPU Usage %', 'Load Average', 'Threading', 'Async I/O'],
    tags: ['context-switches', 'cpu', 'threads', 'infrastructure', 'performance'],
  },
]
