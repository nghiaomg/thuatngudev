import type { GlossaryTerm } from '../../types'

export const diskIoTerms: GlossaryTerm[] = [
  {
    id: 'infra-disk-1',
    term: 'Disk Usage %',
    slug: 'disk-usage-percent',
    category: 'Infrastructure',
    definition:
      'Disk Usage % đo lường phần trăm dung lượng disk đã được sử dụng so với tổng dung lượng. Full disk gây application crashes, data loss, và system failures.',
    details:
      '**Disk Usage Components:**\n- **Total**: Total disk capacity\n- **Used**: Space consumed by data\n- **Available**: Free space for new data\n- **Reserved**: Space reserved for root (typically 5%)\n\n**Critical Thresholds:**\n- **< 70%**: Healthy\n- **70-80%**: Normal\n- **80-90%**: Warning - plan expansion\n- **90-95%**: Critical - immediate action needed\n- **> 95%**: Emergency - system at risk\n\n**Common Causes of High Disk Usage:**\n- Log files accumulation\n- Database growth\n- Temporary files not cleaned\n- Core dumps\n- Package cache (apt, yum)\n- Docker images/layers\n\n**Directories to Monitor:**\n- `/var/log` - System and application logs\n- `/var/lib` - Database files, Docker data\n- `/tmp` - Temporary files\n- `/var/cache` - Package caches\n- Home directories - User data\n\n**Prevention:**\n- Log rotation (logrotate)\n- Automated cleanup scripts\n- Monitor inode usage\n- Set disk quotas\n- Use LVM for flexible resizing',
    examples: [
      {
        title: 'Monitoring Disk Usage',
        code: `const { execSync } = require('child_process');
const fs = require('fs');

function getDiskUsage() {
  // Execute df command
  const output = execSync('df -h', { encoding: 'utf8' });
  const lines = output.trim().split('\\n');
  
  const disks = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/\\s+/);
    if (parts.length >= 6) {
      const usagePercent = parseInt(parts[4]);
      disks.push({
        filesystem: parts[0],
        size: parts[1],
        used: parts[2],
        available: parts[3],
        usagePercent: usagePercent + '%',
        mountPoint: parts[5],
        status: getDiskStatus(usagePercent)
      });
    }
  }
  
  return disks;
}

function getDiskStatus(usagePercent) {
  if (usagePercent < 70) return '✅ Healthy';
  if (usagePercent < 80) return '✅ Normal';
  if (usagePercent < 90) return '⚠️  Warning - plan expansion';
  if (usagePercent < 95) return '🔶 Critical - clean up now';
  return '🔴 Emergency - immediate action required';
}

// Check specific directory sizes
function getDirectorySize(dirPath) {
  try {
    const output = execSync(\`du -sh \${dirPath}\`, { encoding: 'utf8' });
    return output.split('\\t')[0];
  } catch (e) {
    return 'Unknown';
  }
}

// Find large files
function findLargeFiles(thresholdMB = 100) {
  const output = execSync(
    \`find / -type f -size +\${thresholdMB}M -exec ls -lh {} \\\\;\`,
    { encoding: 'utf8', timeout: 10000 }
  );
  return output.trim().split('\\n');
}

// Alert on high disk usage
const disks = getDiskUsage();
disks.forEach(disk => {
  const usage = parseInt(disk.usagePercent);
  if (usage > 95) {
    console.error(\`🔴 CRITICAL: \${disk.mountPoint} is \${disk.usagePercent}% full\`);
    console.error('Immediate action: Clean logs, temp files, or expand disk');
  } else if (usage > 90) {
    console.warn(\`⚠️  WARNING: \${disk.mountPoint} is \${disk.usagePercent}% full\`);
  }
});

// Quick cleanup commands:
// journalctl --vacuum-size=100M  # Clean old logs
// docker system prune -af         # Remove unused Docker data
// apt-get clean                   # Clear package cache
// rm -rf /tmp/*                   # Clear temp files`,
        explanation:
          'Disk usage monitored via df command. >90% requires immediate attention. Regular cleanup prevents out-of-space incidents. Monitor both space and inodes.',
      },
    ],
    relatedTerms: ['Disk IOPS', 'Disk Latency', 'File Descriptors', 'Log Rotation'],
    tags: ['disk', 'storage', 'infrastructure', 'monitoring'],
  },
  {
    id: 'infra-disk-2',
    term: 'Read/Write IOPS',
    slug: 'disk-iops',
    category: 'Infrastructure',
    definition:
      'IOPS (Input/Output Operations Per Second) đo lường số lượng read/write operations mà disk có thể thực hiện trong một giây. Metric quan trọng cho database và I/O-intensive applications.',
    details:
      '**IOPS Types:**\n- **Read IOPS**: Read operations per second\n- **Write IOPS**: Write operations per second\n- **Random IOPS**: Non-sequential access (databases)\n- **Sequential IOPS**: Sequential access (file transfers)\n- **Mixed IOPS**: Combination of read/write\n\n**Typical IOPS by Storage Type:**\n- **HDD (7200 RPM)**: 75-150 IOPS\n- **HDD (15000 RPM)**: 150-200 IOPS\n- **SATA SSD**: 5,000-10,000 IOPS\n- **NVMe SSD**: 100,000-500,000 IOPS\n- **AWS gp3**: 3,000-16,000 IOPS\n- **AWS io2**: Up to 256,000 IOPS\n\n**IOPS vs Throughput:**\n- **IOPS**: Number of operations (small random access)\n- **Throughput**: Data volume per second (large sequential)\n- Small files = IOPS bottleneck\n- Large files = Throughput bottleneck\n\n**Factors Affecting IOPS:**\n- Block size (4K vs 256K)\n- Random vs sequential access\n- Read vs write ratio\n- Queue depth\n- Storage technology\n\n**Monitoring:**\n- Linux: `iostat`, `iotop`\n- `iostat -x 1` for detailed metrics\n- `cat /proc/diskstats`',
    examples: [
      {
        title: 'Monitoring Disk IOPS',
        code: `const { execSync } = require('child_process');

function getDiskIOPS(device = 'sda', interval = 1) {
  // Run iostat command
  const output = execSync(
    \`iostat -dx \${device} \${interval} 2\`,
    { encoding: 'utf8' }
  );
  
  // Parse second output (first is since boot)
  const lines = output.trim().split('\\n');
  const lastLine = lines[lines.length - 1];
  const parts = lastLine.split(/\\s+/);
  
  if (parts.length < 14) return null;
  
  return {
    device: parts[0],
    readIOPS: parseFloat(parts[3]),
    writeIOPS: parseFloat(parts[4]),
    readKBPerSec: parseFloat(parts[5]),
    writeKBPerSec: parseFloat(parts[6]),
    avgReqSizeKB: parseFloat(parts[7]),
    avgQueueDepth: parseFloat(parts[8]),
    avgWaitTimeMs: parseFloat(parts[9]),
    avgServiceTimeMs: parseFloat(parts[10]),
    utilPercent: parseFloat(parts[11]),
    status: getIOPSStatus(
      parseFloat(parts[3]) + parseFloat(parts[4]),
      parseFloat(parts[9]),
      parseFloat(parts[11])
    )
  };
}

function getIOPSStatus(totalIOPS, avgWaitMs, utilPercent) {
  if (utilPercent < 50 && avgWaitMs < 10) {
    return '✅ Healthy';
  } else if (utilPercent < 80 && avgWaitMs < 20) {
    return '⚠️  Moderate load';
  } else if (utilPercent < 95) {
    return '🔶 High IOPS - consider SSD';
  } else {
    return '🔴 Disk saturated - performance impact';
  }
}

// Parse /proc/diskstats for raw metrics
function getRawDiskStats(device = 'sda') {
  const diskstats = fs.readFileSync('/proc/diskstats', 'utf8');
  const lines = diskstats.split('\\n');
  
  for (const line of lines) {
    const parts = line.trim().split(/\\s+/);
    if (parts[2] === device) {
      return {
        readsCompleted: parseInt(parts[3]),
        readsMerged: parseInt(parts[4]),
        sectorsRead: parseInt(parts[5]),
        timeReadingMs: parseInt(parts[6]),
        writesCompleted: parseInt(parts[7]),
        writesMerged: parseInt(parts[8]),
        sectorsWritten: parseInt(parts[9]),
        timeWritingMs: parseInt(parts[10]),
        iosInProgress: parseInt(parts[11]),
        timeIoMs: parseInt(parts[12])
      };
    }
  }
}

// Database IOPS requirements
const dbRequirements = {
  postgresql: {
    small: { readIOPS: 1000, writeIOPS: 500 },
    medium: { readIOPS: 5000, writeIOPS: 2000 },
    large: { readIOPS: 20000, writeIOPS: 10000 }
  },
  mongodb: {
    small: { readIOPS: 1500, writeIOPS: 1000 },
    medium: { readIOPS: 7000, writeIOPS: 3000 },
    large: { readIOPS: 25000, writeIOPS: 15000 }
  }
};

// Check if disk meets requirements
function checkIOPSRequirements(currentIOPS, requiredIOPS) {
  const ratio = currentIOPS / requiredIOPS;
  if (ratio > 1.5) return '✅ Exceeds requirements';
  if (ratio > 1.0) return '✅ Meets requirements';
  return '🔴 Below requirements - upgrade storage';
}`,
        explanation:
          'IOPS critical for database performance. SSD provides 50-100x more IOPS than HDD. Monitor IOPS saturation and latency together.',
      },
    ],
    relatedTerms: ['Disk Usage %', 'Disk Latency', 'Throughput', 'Storage Types'],
    tags: ['iops', 'disk', 'storage', 'infrastructure', 'performance'],
  },
  {
    id: 'infra-disk-3',
    term: 'Disk Latency',
    slug: 'disk-latency',
    category: 'Infrastructure',
    definition:
      'Disk Latency là thời gian từ khi I/O request được gửi đến khi hoàn thành. High disk latency gây slow queries, request timeouts, và poor user experience.',
    details:
      '**Disk Latency Components:**\n- **Queue Time**: Waiting in I/O queue\n- **Service Time**: Actual disk operation\n- **Total Latency**: Queue Time + Service Time\n\n**Typical Latency by Storage:**\n- **NVMe SSD**: 0.1-0.3 ms\n- **SATA SSD**: 0.5-2 ms\n- **HDD (15K RPM)**: 3-6 ms\n- **HDD (7200 RPM)**: 5-10 ms\n- **Network Storage (EBS)**: 1-10 ms\n\n**Latency Thresholds:**\n- **< 5ms**: Excellent (SSD range)\n- **5-10ms**: Good (HDD range)\n- **10-20ms**: Acceptable but monitor\n- **20-50ms**: Warning - performance impact\n- **> 50ms**: Critical - immediate investigation\n\n**Causes of High Latency:**\n- Disk saturation (IOPS limit)\n- High queue depth\n- Disk fragmentation\n- RAID rebuild\n- Network storage issues\n- Failing disk (increasing latency)\n\n**Latency vs IOPS:**\n- High IOPS + Low Latency = Healthy\n- High IOPS + High Latency = Saturated\n- Low IOPS + High Latency = Failing disk\n- Low IOPS + Low Latency = Idle\n\n**Monitoring:**\n- `iostat -x 1` (await column)\n- `ioping` for latency testing\n- `fio` for benchmarking',
    examples: [
      {
        title: 'Monitoring Disk Latency',
        code: `const { execSync } = require('child_process');

function getDiskLatency(device = 'sda') {
  const output = execSync(\`iostat -dx \${device} 1 2\`, {
    encoding: 'utf8'
  });
  
  const lines = output.trim().split('\\n');
  const lastLine = lines[lines.length - 1];
  const parts = lastLine.split(/\\s+/);
  
  if (parts.length < 14) return null;
  
  const awaitMs = parseFloat(parts[9]);  // Average wait time
  const svctmMs = parseFloat(parts[10]); // Average service time
  const utilPercent = parseFloat(parts[11]);
  
  return {
    device: parts[0],
    awaitMs: awaitMs,           // Total latency (queue + service)
    svctmMs: svctmMs,           // Service time only
    queueTimeMs: awaitMs - svctmMs,
    utilPercent: utilPercent,
    status: getLatencyStatus(awaitMs),
    bottleneck: getBottleneck(awaitMs, svctmMs, utilPercent)
  };
}

function getLatencyStatus(awaitMs) {
  if (awaitMs < 5) return '✅ Excellent (SSD performance)';
  if (awaitMs < 10) return '✅ Good (HDD performance)';
  if (awaitMs < 20) return '⚠️  Acceptable';
  if (awaitMs < 50) return '🔶 High latency - investigate';
  return '🔴 Critical latency - disk issue?';
}

function getBottleneck(awaitMs, svctmMs, utilPercent) {
  const queueTime = awaitMs - svctmMs;
  
  if (queueTime > svctmMs) {
    return 'Queue bottleneck: Too many I/O requests';
  } else if (utilPercent > 90) {
    return 'Disk saturated: Reached IOPS limit';
  } else if (awaitMs > 50) {
    return 'Possible disk failure: Very high latency';
  } else {
    return 'Healthy';
  }
}

// Test disk latency with ioping
function testDiskLatency(path = '/tmp', count = 10) {
  try {
    const output = execSync(
      \`ioping -c \${count} \${path}\`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    // Parse results
    const match = output.match(
      /([\\d.]+) requests completed in ([\\d.]+) s/
    );
    const latencyMatch = output.match(
      /min\\/avg\\/max\\/mdev = ([\\d.]+)\\/([\\d.]+)\\/([\\d.]+)\\/([\\d.]+) ms/
    );
    
    if (latencyMatch) {
      return {
        minMs: parseFloat(latencyMatch[1]),
        avgMs: parseFloat(latencyMatch[2]),
        maxMs: parseFloat(latencyMatch[3]),
        requests: parseInt(match?.[1] || '0')
      };
    }
  } catch (e) {
    return { error: 'ioping not installed or path invalid' };
  }
}

// Correlate latency with application performance
function correlateLatencyWithPerformance(latency, appMetrics) {
  if (latency.awaitMs > 20 && appMetrics.p95ResponseTime > 1000) {
    console.warn('High disk latency correlating with slow responses');
    console.log('Consider: SSD upgrade, query optimization, or caching');
  }
}

// Database query slow? Check disk latency:
// PostgreSQL: EXPLAIN ANALYZE <query>
// If most time is "I/O", disk is the bottleneck`,
        explanation:
          'Disk latency directly impacts application response times. >20ms latency causes noticeable slowdown. Correlate disk latency with application metrics.',
      },
    ],
    relatedTerms: ['Disk IOPS', 'Disk Usage %', 'Throughput', 'I/O Wait'],
    tags: ['disk-latency', 'disk', 'storage', 'infrastructure', 'performance'],
  },
  {
    id: 'infra-disk-4',
    term: 'File Descriptor Usage',
    slug: 'file-descriptor-usage',
    category: 'Infrastructure',
    definition:
      'File Descriptors (FDs) là integers đại diện cho open files, sockets, và pipes. Mỗi process có limit trên FDs. Exhausting file descriptors gây "Too many open files" errors.',
    details:
      '**What are File Descriptors:**\n- Integer handles for open resources\n- Files, directories, sockets, pipes\n- Assigned sequentially (0, 1, 2, 3...)\n- 0=stdin, 1=stdout, 2=stderr\n\n**FD Limits:**\n- **Per-process limit**: `ulimit -n` (default 1024)\n- **System-wide limit**: `/proc/sys/fs/file-max`\n- **Soft limit**: Can be increased by user\n- **Hard limit**: Maximum allowed (root only)\n\n**Common FD Consumers:**\n- Open files (logs, data files)\n- Network connections (sockets)\n- Database connections\n- HTTP client connections\n- Inotify watches\n- Pipes and FIFOs\n\n**"Too many open files" Causes:**\n- Connection leaks (not closing sockets)\n- File handle leaks (not closing files)\n- High concurrency without pooling\n- Event listener leaks\n\n**Monitoring:**\n- Per-process: `/proc/<pid>/fd`\n- System-wide: `cat /proc/sys/fs/file-nr`\n- `lsof -p <pid>` list open files\n- `ls -l /proc/<pid>/fd | wc -l`\n\n**Best Practices:**\n- Always close files/connections\n- Use connection pooling\n- Set appropriate limits\n- Monitor FD usage trend\n- Use `with` statements (auto-close)',
    examples: [
      {
        title: 'Monitoring File Descriptors',
        code: `const fs = require('fs');
const { execSync } = require('child_process');

// Get system-wide file descriptor usage
function getSystemFDUsage() {
  const fileNr = fs.readFileSync('/proc/sys/fs/file-nr', 'utf8');
  const [allocated, unused, max] = fileNr.split('\\t').map(Number);
  const used = allocated - unused;
  const percent = (used / max * 100).toFixed(2);
  
  return {
    allocated: allocated,
    unused: unused,
    used: used,
    max: max,
    usagePercent: percent + '%',
    status: getFDStatus(parseFloat(percent))
  };
}

// Get per-process file descriptor count
function getProcessFDs(pid) {
  try {
    const fdPath = \`/proc/\${pid}/fd\`;
    const fds = fs.readdirSync(fdPath);
    
    // Categorize FDs
    const categories = {
      files: 0,
      sockets: 0,
      pipes: 0,
      other: 0
    };
    
    fds.forEach(fd => {
      try {
        const link = fs.readlinkSync(\`\${fdPath}/\${fd}\`);
        if (link.startsWith('socket:')) categories.sockets++;
        else if (link.startsWith('pipe:')) categories.pipes++;
        else if (link.startsWith('/')) categories.files++;
        else categories.other++;
      } catch (e) {}
    });
    
    return {
      pid: pid,
      totalFDs: fds.length,
      ...categories,
      limit: getProcessFDLimit(pid)
    };
  } catch (e) {
    return { error: 'Process not found or no permission' };
  }
}

// Get process FD limit
function getProcessFDLimit(pid) {
  try {
    const limits = fs.readFileSync(
      \`/proc/\${pid}/limits\`,
      'utf8'
    );
    const match = limits.match(
      /Max open files\\s+(\\d+)\\s+(\\d+)/
    );
    if (match) {
      return {
        soft: parseInt(match[1]),
        hard: parseInt(match[2])
      };
    }
  } catch (e) {}
  return null;
}

// Detect FD leaks
class FDLeakDetector {
  constructor(pid) {
    this.pid = pid;
    this.samples = [];
  }

  sample() {
    const fds = getProcessFDs(this.pid);
    this.samples.push({
      timestamp: Date.now(),
      total: fds.totalFDs,
      sockets: fds.sockets,
      files: fds.files
    });
    
    // Keep last 100 samples
    if (this.samples.length > 100) {
      this.samples.shift();
    }
    
    this.checkForLeak();
  }

  checkForLeak() {
    if (this.samples.length < 10) return;
    
    const first = this.samples[0].total;
    const last = this.samples[this.samples.length - 1].total;
    const growth = last - first;
    
    if (growth > 50) {
      console.warn(\`⚠️  Possible FD leak: +\${growth} FDs in \${this.samples.length} samples\`);
      console.log('Check for unclosed files/connections');
    }
  }
}

// Fix: Always close resources

// BAD: File handle leak
function readFileBad(path) {
  const fd = fs.openSync(path, 'r');
  const data = fs.readFileSync(fd);
  // fd never closed!
  return data;
}

// GOOD: Properly close
function readFileGood(path) {
  const data = fs.readFileSync(path);
  // File automatically closed
  return data;
}

// GOOD: Use streams with cleanup
const stream = fs.createReadStream('large-file');
stream.on('end', () => {
  stream.destroy(); // Ensure cleanup
});`,
        explanation:
          'File descriptors are limited resources. Monitor FD usage per process and system-wide. FD leaks cause "Too many open files" errors. Always close resources.',
      },
    ],
    relatedTerms: ['Disk Usage %', 'Connection Pooling', 'Socket Limits', 'Resource Leaks'],
    tags: ['file-descriptors', 'disk', 'infrastructure', 'linux', 'monitoring'],
  },
]
