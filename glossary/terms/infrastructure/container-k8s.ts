import type { GlossaryTerm } from '../../types'

export const containerK8sTerms: GlossaryTerm[] = [
  {
    id: 'infra-cnt-1',
    term: 'Container CPU/Memory Limits',
    slug: 'container-cpu-memory-limits',
    category: 'Infrastructure',
    definition:
      'Container CPU/Memory Limits là resource boundaries được cấu hình trong Docker/Kubernetes để prevent container từ consuming quá nhiều resources, đảm bảo fair sharing và system stability.',
    details:
      '**CPU Limits:**\n- **Requests**: Guaranteed CPU (scheduler uses this)\n- **Limits**: Maximum CPU container can use\n- Measured in cores or millicores (1000m = 1 core)\n- Example: `500m` = 0.5 CPU core\n\n**Memory Limits:**\n- **Requests**: Guaranteed memory\n- **Limits**: Maximum memory before OOM kill\n- Measured in bytes (Mi, Gi)\n- Example: `512Mi` = 512 MiB\n\n**CPU vs Memory Behavior:**\n- **CPU**: Container throttled when exceeding limit (not killed)\n- **Memory**: Container OOM killed when exceeding limit\n\n**Setting Appropriate Limits:**\n1. Monitor actual usage over time\n2. Set requests = average usage\n3. Set limits = P95 usage + 20% buffer\n4. Test under load\n5. Adjust based on production metrics\n\n**Common Mistakes:**\n- Setting limits too low (throttling/OOM)\n- No limits set (noisy neighbor problem)\n- Requests = Limits (poor scheduling)\n- Ignoring memory limits (OOM kills)\n\n**Kubernetes QoS Classes:**\n- **Guaranteed**: requests = limits (highest priority)\n- **Burstable**: requests < limits (medium priority)\n- **BestEffort**: no requests/limits (lowest, killed first)',
    examples: [
      {
        title: 'Configuring Container Resource Limits',
        code: `// Kubernetes Pod spec với resource limits
const podSpec = {
  apiVersion: 'v1',
  kind: 'Pod',
  metadata: {
    name: 'my-app'
  },
  spec: {
    containers: [{
      name: 'app',
      image: 'my-app:1.0',
      resources: {
        requests: {
          cpu: '250m',        // 0.25 core guaranteed
          memory: '256Mi'     // 256 MiB guaranteed
        },
        limits: {
          cpu: '1000m',       // 1 core max
          memory: '512Mi'     // 512 MiB max (OOM if exceeded)
        }
      }
    }]
  }
};

// Docker: Set resource limits
// docker run --cpus="1.5" --memory="512m" my-app

// Monitor actual usage
const { execSync } = require('child_process');

function getContainerUsage(containerId) {
  // Docker stats
  const stats = execSync(\`docker stats \${containerId} --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}"\`, {
    encoding: 'utf8'
  });
  
  const [cpuPerc, memUsage] = stats.trim().split('|');
  const [memUsed, memLimit] = memUsage.split(' / ');
  
  return {
    cpuPercent: cpuPerc,
    memoryUsed: memUsed,
    memoryLimit: memLimit,
    memoryPercent: (parseFloat(memUsed) / parseFloat(memLimit) * 100).toFixed(2) + '%'
  };
}

// Calculate optimal limits from metrics
function calculateOptimalLimits(metrics) {
  const cpuAvg = metrics.cpuUsage.reduce((a, b) => a + b, 0) / metrics.cpuUsage.length;
  const cpuP95 = percentile(metrics.cpuUsage, 95);
  const memAvg = metrics.memoryUsage.reduce((a, b) => a + b, 0) / metrics.memoryUsage.length;
  const memP95 = percentile(metrics.memoryUsage, 95);
  
  return {
    requests: {
      cpu: Math.round(cpuAvg * 1000) + 'm',
      memory: Math.round(memAvg * 1.1 / 1024 / 1024) + 'Mi'
    },
    limits: {
      cpu: Math.round(cpuP95 * 1.2 * 1000) + 'm',
      memory: Math.round(memP95 * 1.2 / 1024 / 1024) + 'Mi'
    }
  };
}

function percentile(sorted, p) {
  const index = Math.ceil(sorted.length * p / 100);
  return sorted[index - 1];
}

// Alert on throttling/OOM
function checkContainerHealth(containerId) {
  const throttling = getCpuThrottling(containerId);
  const oomKills = getOomKills(containerId);
  
  if (throttling.throttlePercent > 10) {
    console.warn(\`⚠️  Container CPU throttled \${throttling.throttlePercent}%\`);
    console.log('Recommendation: Increase CPU limit');
  }
  
  if (oomKills > 0) {
    console.error(\`🔴 Container OOM killed \${oomKills} times\`);
    console.error('Recommendation: Increase memory limit or fix memory leaks');
  }
}`,
        explanation:
          'CPU limits cause throttling, memory limits cause OOM kills. Set limits based on P95 usage + buffer. Monitor actual usage to right-size limits.',
      },
    ],
    relatedTerms: ['CPU Throttling', 'OOM Killer', 'Kubernetes', 'Resource Management'],
    tags: ['containers', 'docker', 'kubernetes', 'resources', 'limits'],
  },
  {
    id: 'infra-cnt-2',
    term: 'Pod Restarts',
    slug: 'pod-restarts',
    category: 'Infrastructure',
    definition:
      'Pod Restarts đếm số lần Kubernetes Pod đã được restart. Frequent restarts indicate application crashes, OOM kills, liveness probe failures, hoặc configuration issues.',
    details:
      '**Pod Restart Causes:**\n- **OOM Killed**: Exceeded memory limit\n- **CrashLoopBackOff**: Application exits with error\n- **Liveness Probe Failed**: Health check failure\n- **Readiness Probe Failed**: Not ready for traffic\n- **Node Issues**: Node failure caused rescheduling\n- **Config Changes**: ConfigMap/Secret updates\n\n**Restart Policy:**\n- **Always**: Restart on any exit (default for Deployments)\n- **OnFailure**: Restart only on non-zero exit\n- **Never**: Never restart\n\n**Restart Count Interpretation:**\n- **0**: Healthy (no restarts)\n- **1-2**: Normal (deployment, minor issue)\n- **3-10**: Warning (investigate cause)\n- **> 10**: Critical (CrashLoopBackOff likely)\n\n**Backoff Progression:**\n- 1st restart: 10s delay\n- 2nd restart: 20s delay\n- 3rd restart: 40s delay\n- Max delay: 5 minutes\n- Status: CrashLoopBackOff\n\n**Debugging Pod Restarts:**\n1. `kubectl describe pod <pod>` (events)\n2. `kubectl logs <pod> --previous` (crash logs)\n3. Check resource limits (OOM)\n4. Review liveness/readiness probes\n5. Check node conditions',
    examples: [
      {
        title: 'Monitoring Pod Restarts',
        code: `const { execSync } = require('child_process');

function getPodRestarts(namespace = 'default') {
  const output = execSync(
    \`kubectl get pods -n \${namespace} -o json\`,
    { encoding: 'utf8' }
  );
  
  const pods = JSON.parse(output);
  const restartInfo = [];
  
  pods.items.forEach(pod => {
    const name = pod.metadata.name;
    const status = pod.status;
    
    status.containerStatuses?.forEach(container => {
      const restarts = container.restartCount;
      let reason = 'Unknown';
      let lastState = 'Running';
      
      if (container.state.waiting) {
        reason = container.state.waiting.reason;
        lastState = 'Waiting';
      } else if (container.state.terminated) {
        reason = container.state.terminated.reason;
        lastState = 'Terminated';
      }
      
      if (container.lastState.terminated) {
        const lastTerm = container.lastState.terminated;
        if (lastTerm.reason === 'OOMKilled') {
          reason = 'OOMKilled';
        }
      }
      
      restartInfo.push({
        pod: name,
        container: container.name,
        restarts: restarts,
        status: lastState,
        reason: reason,
        ready: container.ready,
        started: container.started,
        status: getRestartStatus(restarts, reason)
      });
    });
  });
  
  // Sort by restart count
  restartInfo.sort((a, b) => b.restarts - a.restarts);
  return restartInfo;
}

function getRestartStatus(restarts, reason) {
  if (restarts === 0) return '✅ Healthy';
  if (restarts <= 2) return '✅ Minor restarts';
  if (restarts <= 10) return '⚠️  Frequent restarts';
  if (reason === 'OOMKilled') return '🔴 OOM Killed - increase memory';
  if (reason === 'CrashLoopBackOff') return '🔴 CrashLoopBackOff - check logs';
  return '🔴 Critical - investigate';
}

// Get previous logs (before restart)
function getPreviousLogs(podName, containerName, namespace = 'default') {
  try {
    return execSync(
      \`kubectl logs \${podName} -c \${containerName} -n \${namespace} --previous\`,
      { encoding: 'utf8', timeout: 10000 }
    );
  } catch (e) {
    return 'No previous logs available';
  }
}

// Alert on high restart counts
const restarts = getPodRestarts('my-namespace');
restarts.forEach(info => {
  if (info.restarts > 10) {
    console.error(\`🔴 \${info.pod}/\${info.container}: \${info.restarts} restarts\`);
    console.error(\`   Reason: \${info.reason}\`);
    console.error('   Action: Check kubectl describe pod and logs');
  }
});

// Common fixes:

// 1. OOM Killed -> Increase memory limit
// resources:
//   limits:
//     memory: "1Gi"  # Was 512Mi

// 2. CrashLoopBackOff -> Check application logs
// kubectl logs <pod> --previous

// 3. Liveness probe too aggressive
// livenessProbe:
//   initialDelaySeconds: 60  # Give app time to start
//   periodSeconds: 10
//   failureThreshold: 3`,
        explanation:
          'Pod restarts indicate stability issues. OOMKilled = memory limit too low. CrashLoopBackOff = application errors. Monitor restart count trend.',
      },
    ],
    relatedTerms: ['Container CPU/Memory Limits', 'OOM Killer', 'Health Checks', 'CrashLoopBackOff'],
    tags: ['pods', 'restarts', 'kubernetes', 'infrastructure', 'monitoring'],
  },
  {
    id: 'infra-cnt-3',
    term: 'Node Utilization',
    slug: 'node-utilization',
    category: 'Infrastructure',
    definition:
      'Node Utilization đo lường resource usage (CPU, Memory, Disk) của Kubernetes nodes. Cho biết cluster efficiency, capacity planning needs, và cost optimization opportunities.',
    details:
      '**Node Resources to Monitor:**\n- **CPU Usage**: Node CPU utilization %\n- **Memory Usage**: Node memory utilization %\n- **Disk Usage**: Node disk space used %\n- **Pod Count**: Number of pods running\n- **Allocatable**: Resources available for pods\n\n**Utilization Targets:**\n- **< 30%**: Underutilized (waste of resources)\n- **30-60%**: Good efficiency\n- **60-80%**: Optimal range\n- **80-90%**: High but manageable\n- **> 90%**: Risk of resource pressure\n\n**Node Conditions:**\n- **Ready**: Node healthy and accepting pods\n- **MemoryPressure**: Node low on memory\n- **DiskPressure**: Node low on disk space\n- **PIDPressure**: Node running out of PIDs\n- **NetworkUnavailable**: Network issue\n\n**Capacity Planning:**\n- Track utilization trend over weeks/months\n- Plan scaling before reaching 80%\n- Consider seasonal traffic patterns\n- Right-size node types\n\n**Cost Optimization:**\n- Use spot/preemptible instances for fault-tolerant workloads\n- Autoscale based on utilization\n- Right-size nodes (avoid oversized)\n- Consolidate underutilized nodes',
    examples: [
      {
        title: 'Monitoring Node Utilization',
        code: `const { execSync } = require('child_process');

function getNodeUtilization() {
  const nodes = execSync('kubectl get nodes -o json', { encoding: 'utf8' });
  const nodeData = JSON.parse(nodes);
  
  const nodeMetrics = [];
  
  nodeData.items.forEach(node => {
    const name = node.metadata.name;
    const capacity = node.status.capacity;
    const allocatable = node.status.allocatable;
    const conditions = node.status.conditions;
    
    // Get actual usage from metrics API
    const metrics = execSync(
      \`kubectl top node \${name} --no-headers\`,
      { encoding: 'utf8' }
    );
    const parts = metrics.trim().split(/\\s+/);
    
    const cpuUsage = parts[1];
    const cpuPercent = parseCpuPercent(cpuUsage, allocatable.cpu);
    const memUsage = parts[2];
    const memPercent = parseMemoryPercent(memUsage, allocatable.memory);
    
    // Count pods on this node
    const pods = execSync(
      \`kubectl get pods --field-selector spec.nodeName=\${name} --no-headers | wc -l\`,
      { encoding: 'utf8' }
    );
    const podCount = parseInt(pods);
    
    // Check conditions
    const readyCondition = conditions.find(c => c.type === 'Ready');
    const memoryPressure = conditions.find(c => c.type === 'MemoryPressure');
    const diskPressure = conditions.find(c => c.type === 'DiskPressure');
    
    nodeMetrics.push({
      name: name,
      cpuUsage: cpuUsage,
      cpuPercent: cpuPercent,
      memoryUsage: memUsage,
      memoryPercent: memPercent,
      podCount: podCount,
      maxPods: capacity.pods,
      conditions: {\n        ready: readyCondition?.status === 'True',
        memoryPressure: memoryPressure?.status === 'True',
        diskPressure: diskPressure?.status === 'True'
      },
      status: getNodeStatus(cpuPercent, memPercent, conditions)
    });
  });
  
  return nodeMetrics;
}

function parseCpuPercent(usage, allocatable) {
  const used = parseFloat(usage.replace('m', ''));
  const alloc = parseFloat(allocatable.replace('m', ''));
  return (used / alloc * 100).toFixed(2) + '%';
}

function parseMemoryPercent(usage, allocatable) {
  const used = parseMemoryBytes(usage);
  const alloc = parseMemoryBytes(allocatable);
  return (used / alloc * 100).toFixed(2) + '%';
}

function parseMemoryBytes(memStr) {
  const match = memStr.match(/^([\\d.]+)(Ki|Mi|Gi|Ti)?$/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2];
  const multipliers = { Ki: 1024, Mi: 1024**2, Gi: 1024**3, Ti: 1024**4 };
  return value * (multipliers[unit] || 1);
}

function getNodeStatus(cpuPercent, memPercent, conditions) {
  const cpu = parseFloat(cpuPercent);
  const mem = parseFloat(memPercent);
  const memPressure = conditions.find(c => c.type === 'MemoryPressure')?.status === 'True';
  const diskPressure = conditions.find(c => c.type === 'DiskPressure')?.status === 'True';
  
  if (memPressure || diskPressure) return '🔴 Node under pressure';
  if (cpu > 90 || mem > 90) return '🔶 Node heavily utilized';
  if (cpu > 80 || mem > 80) return '⚠️  Node highly utilized';
  if (cpu < 30 && mem < 30) return '⚠️  Node underutilized';
  return '✅ Healthy utilization';
}

// Cluster summary
function getClusterSummary() {
  const nodes = getNodeUtilization();
  const totalPods = nodes.reduce((sum, n) => sum + n.podCount, 0);
  const avgCpu = nodes.reduce((sum, n) => sum + parseFloat(n.cpuPercent), 0) / nodes.length;
  const avgMem = nodes.reduce((sum, n) => sum + parseFloat(n.memPercent), 0) / nodes.length;
  
  return {
    nodeCount: nodes.length,
    totalPods: totalPods,
    avgCpuUtilization: avgCpu.toFixed(2) + '%',
    avgMemUtilization: avgMem.toFixed(2) + '%',
    status: avgCpu > 80 || avgMem > 80 ? '🔶 High utilization' : '✅ Healthy'
  };
}

// Right-sizing recommendation
function recommendNodeSizing(nodes) {
  const underutilized = nodes.filter(n => 
    parseFloat(n.cpuPercent) < 30 && parseFloat(n.memPercent) < 30
  );
  
  if (underutilized.length > nodes.length * 0.3) {
    console.log('💡 Recommendation: Consider downsizing or consolidating nodes');
    console.log(\`   \${underutilized.length} nodes are underutilized\`);
  }
}`,
        explanation:
          'Node utilization reveals cluster efficiency. Target 60-80% utilization. Underutilized nodes waste money, overutilized nodes risk stability.',
      },
    ],
    relatedTerms: ['Container CPU/Memory Limits', 'Pod Restarts', 'Cluster Autoscaler', 'Resource Quotas'],
    tags: ['nodes', 'utilization', 'kubernetes', 'infrastructure', 'capacity'],
  },
  {
    id: 'infra-cnt-4',
    term: 'Cluster Health',
    slug: 'cluster-health',
    category: 'Infrastructure',
    definition:
      'Cluster Health là tổng thể health assessment của Kubernetes cluster, bao gồm node status, pod status, control plane components, và resource availability. Cho biết cluster có thể serve workloads reliably hay không.',
    details:
      '**Control Plane Health:**\n- **API Server**: Responding to requests\n- **etcd**: Cluster database healthy\n- **Scheduler**: Scheduling pods\n- **Controller Manager**: Running controllers\n- **CoreDNS**: DNS resolution working\n\n**Worker Node Health:**\n- Nodes in Ready state\n- Kubelet running and healthy\n- Container runtime (Docker/containerd) running\n- Sufficient resources (CPU, memory, disk)\n\n**Pod Health:**\n- Pods in Running state\n- No CrashLoopBackOff\n- No OOMKills\n- Readiness checks passing\n- No pending pods (resource issues)\n\n**Resource Health:**\n- Sufficient allocatable resources\n- No resource pressure conditions\n- Storage classes available\n- Load balancers provisioning\n\n**Health Check Endpoints:**\n- API Server: `/healthz`\n- Kubelet: `/healthz`\n- etcd: `/health`\n- CoreDNS: `/health`\n\n**Automated Health Monitoring:**\n- Prometheus + Grafana\n- Kubernetes dashboard\n- Third-party: Datadog, New Relic\n- Custom health check scripts',
    examples: [
      {
        title: 'Kubernetes Cluster Health Check',
        code: `const { execSync } = require('child_process');

function checkClusterHealth() {
  const health = {\n    controlPlane: checkControlPlane(),
    nodes: checkNodes(),
    pods: checkPods(),
    resources: checkResources(),
    overall: '✅ Healthy'
  };
  
  // Determine overall health
  if (
    health.controlPlane.some(c => !c.healthy) ||
    health.nodes.issues.length > 0 ||
    health.pods.issues.length > 5
  ) {
    health.overall = '🔴 Unhealthy';
  } else if (health.pods.issues.length > 0) {
    health.overall = '⚠️  Degraded';
  }
  
  return health;
}

function checkControlPlane() {
  const components = [\n    { name: 'API Server', check: 'kubectl cluster-info' },
    { name: 'etcd', check: 'kubectl get pods -n kube-system -l component=etcd' },
    { name: 'Scheduler', check: 'kubectl get pods -n kube-system -l component=kube-scheduler' },
    { name: 'Controller Manager', check: 'kubectl get pods -n kube-system -l component=kube-controller-manager' },
    { name: 'CoreDNS', check: 'kubectl get pods -n kube-system -l k8s-app=kube-dns' }\n  ];
  
  return components.map(comp => {\n    try {
      execSync(comp.check, { encoding: 'utf8', stdio: 'pipe' });
      return { name: comp.name, healthy: true };
    } catch (e) {
      return { name: comp.name, healthy: false, error: e.message };
    }
  });
}

function checkNodes() {
  const nodes = execSync('kubectl get nodes -o json', { encoding: 'utf8' });
  const nodeData = JSON.parse(nodes);
  const issues = [];
  
  nodeData.items.forEach(node => {
    const name = node.metadata.name;
    const conditions = node.status.conditions;
    
    const ready = conditions.find(c => c.type === 'Ready');
    if (ready?.status !== 'True') {
      issues.push(\`\${name}: Not Ready\`);
    }
    
    const memPressure = conditions.find(c => c.type === 'MemoryPressure');
    if (memPressure?.status === 'True') {
      issues.push(\`\${name}: MemoryPressure\`);
    }
    
    const diskPressure = conditions.find(c => c.type === 'DiskPressure');
    if (diskPressure?.status === 'True') {
      issues.push(\`\${name}: DiskPressure\`);
    }
  });
  
  return { total: nodeData.items.length, issues };\n}

function checkPods() {
  const pods = execSync('kubectl get pods --all-namespaces -o json', {
    encoding: 'utf8'
  });
  const podData = JSON.parse(pods);
  const issues = [];
  
  podData.items.forEach(pod => {
    const name = \`\${pod.metadata.namespace}/\${pod.metadata.name}\`;\n    const status = pod.status.phase;
    
    if (status === 'Failed') {
      issues.push(\`\${name}: Failed\`);
    } else if (status === 'Pending') {
      issues.push(\`\${name}: Pending (resource issue?)\`);\n    }
    
    pod.status.containerStatuses?.forEach(container => {
      if (container.restartCount > 5) {
        issues.push(\`\${name}/\${container.name}: \${container.restartCount} restarts\`);\n      }
      if (container.state.waiting?.reason === 'CrashLoopBackOff') {
        issues.push(\`\${name}/\${container.name}: CrashLoopBackOff\`);
      }
    });
  });
  
  return { total: podData.items.length, issues };
}

function checkResources() {
  // Check if any nodes have resource pressure
  const nodes = execSync('kubectl get nodes -o json', { encoding: 'utf8' });\n  const nodeData = JSON.parse(nodes);
  
  return {\n    totalNodes: nodeData.items.length,
    issues: []
  };
}

// Run health check and report
const health = checkClusterHealth();
console.log('=== Cluster Health Report ===');
console.log(\`Overall: \${health.overall}\`);
console.log(\`Control Plane: \${health.controlPlane.filter(c => c.healthy).length}/\${health.controlPlane.length} healthy\`);\nconsole.log(\`Nodes: \${health.nodes.total} total, \${health.nodes.issues.length} issues\`);
console.log(\`Pods: \${health.pods.total} total, \${health.pods.issues.length} issues\`);

if (health.overall !== '✅ Healthy') {
  console.log('\\nIssues:');
  health.nodes.issues.forEach(issue => console.log(\`  Node: \${issue}\`));\n  health.pods.issues.forEach(issue => console.log(\`  Pod: \${issue}\`));
}`,
        explanation:
          'Cluster health combines control plane, node, and pod status. Automated health checks detect issues before they impact users. Run periodically.',
      },
    ],
    relatedTerms: ['Node Utilization', 'Pod Restarts', 'Control Plane', 'Monitoring'],
    tags: ['cluster', 'health', 'kubernetes', 'infrastructure', 'monitoring'],
  },
]
