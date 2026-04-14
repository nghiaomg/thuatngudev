import type { GlossaryTerm } from '../../types'

export const networkMetricsTerms: GlossaryTerm[] = [
  {
    id: 'infra-net-1',
    term: 'Network Throughput (Bytes/sec)',
    slug: 'network-throughput',
    category: 'Infrastructure',
    definition:
      'Network Throughput đo lường lượng data được truyền qua network trong một đơn vị thời gian (bytes/sec). Cho biết network bandwidth utilization và potential bottlenecks.',
    details:
      '**Throughput Metrics:**\n- **Receive (RX)**: Incoming traffic bytes/sec\n- **Transmit (TX)**: Outgoing traffic bytes/sec\n- **Total**: RX + TX combined\n- **Peak**: Maximum throughput in time window\n- **Average**: Mean throughput over time\n\n**Network Speed Standards:**\n- **100 Mbps (Fast Ethernet)**: 12.5 MB/s\n- **1 Gbps (Gigabit)**: 125 MB/s\n- **10 Gbps**: 1,250 MB/s\n- **25 Gbps**: 3,125 MB/s\n- **40 Gbps**: 5,000 MB/s\n- **100 Gbps**: 12,500 MB/s\n\n**Throughput vs Bandwidth:**\n- **Bandwidth**: Maximum theoretical capacity\n- **Throughput**: Actual data transfer rate\n- Throughput typically 70-90% of bandwidth\n- Overhead: TCP/IP headers, retransmissions\n\n**Common Causes of Low Throughput:**\n- Network congestion\n- Packet loss (retransmissions)\n- TCP window size too small\n- MTU mismatches\n- CPU bottleneck (encryption)\n- Disk I/O bottleneck\n\n**Monitoring:**\n- Linux: `cat /proc/net/dev`\n- `ifconfig` or `ip -s link`\n- `nload` for real-time monitoring\n- `iftop` for per-connection throughput\n- `sar -n DEV 1` for historical data',
    examples: [
      {
        title: 'Monitoring Network Throughput',
        code: `const fs = require('fs');
const os = require('os');

function getNetworkThroughput() {
  const netDev = fs.readFileSync('/proc/net/dev', 'utf8');
  const lines = netDev.trim().split('\\n').slice(2);
  
  const interfaces = {};
  
  lines.forEach(line => {
    const parts = line.trim().split(/\\s+/);
    const name = parts[0].replace(':', '');
    
    interfaces[name] = {
      rxBytes: parseInt(parts[1]),
      rxPackets: parseInt(parts[2]),
      rxErrors: parseInt(parts[3]),
      rxDropped: parseInt(parts[4]),
      txBytes: parseInt(parts[9]),
      txPackets: parseInt(parts[10]),
      txErrors: parseInt(parts[11]),
      txDropped: parseInt(parts[12])
    };
  });
  
  return interfaces;
}

// Calculate throughput over time interval
async function getThroughputRate(interval = 1000) {
  const start = getNetworkThroughput();
  await new Promise(resolve => setTimeout(resolve, interval));
  const end = getNetworkThroughput();
  
  const intervalSec = interval / 1000;
  const results = {};
  
  for (const [name, endStats] of Object.entries(end)) {
    const startStats = start[name];
    if (!startStats) continue;
    
    const rxBytesPerSec = (endStats.rxBytes - startStats.rxBytes) / intervalSec;
    const txBytesPerSec = (endStats.txBytes - startStats.txBytes) / intervalSec;
    
    results[name] = {
      rxMBps: (rxBytesPerSec / 1024 / 1024).toFixed(2),
      txMBps: (txBytesPerSec / 1024 / 1024).toFixed(2),
      totalMBps: ((rxBytesPerSec + txBytesPerSec) / 1024 / 1024).toFixed(2),
      rxMbps: (rxBytesPerSec * 8 / 1000000).toFixed(2),
      txMbps: (txBytesPerSec * 8 / 1000000).toFixed(2),
      utilization: getUtilization(rxBytesPerSec + txBytesPerSec, name),
      status: getThroughputStatus(rxBytesPerSec + txBytesPerSec)
    };
  }
  
  return results;
}

function getThroughputStatus(bytesPerSec) {
  const mbps = bytesPerSec * 8 / 1000000;
  
  if (mbps < 100) return '✅ Low traffic';
  if (mbps < 500) return '✅ Moderate traffic';
  if (mbps < 800) return '⚠️  High traffic';
  return '🔶 Near saturation';
}

// Get interface speed from ethtool
function getInterfaceSpeed(iface = 'eth0') {
  try {
    const { execSync } = require('child_process');
    const output = execSync(\`ethtool \${iface}\`, { encoding: 'utf8' });
    const match = output.match(/Speed:\\s+(\\d+)/);
    return match ? parseInt(match[1]) + ' Mb/s' : 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
}

// Alert on high network utilization
async function monitorNetwork() {
  const throughput = await getThroughputRate(1000);
  
  for (const [iface, stats] of Object.entries(throughput)) {
    if (parseFloat(stats.rxMbps) > 800 || parseFloat(stats.txMbps) > 800) {
      console.warn(\`⚠️  High network traffic on \${iface}: \${stats.totalMBps} MB/s\`);
    }
  }
}`,
        explanation:
          'Network throughput shows actual data transfer rate. Compare with interface capacity to calculate utilization. Monitor both RX and TX separately.',
      },
    ],
    relatedTerms: ['Connection Counts', 'Packet Loss', 'DNS Resolution Time', 'Network Latency'],
    tags: ['network', 'throughput', 'bandwidth', 'infrastructure', 'monitoring'],
  },
  {
    id: 'infra-net-2',
    term: 'Connection Counts (ESTABLISHED, TIME_WAIT)',
    slug: 'connection-counts',
    category: 'Infrastructure',
    definition:
      'Connection Counts đo lường số lượng network connections ở các trạng thái khác nhau (ESTABLISHED, TIME_WAIT, CLOSE_WAIT, v.v.). Cho biết connection health và potential resource exhaustion.',
    details:
      '**TCP Connection States:**\n- **ESTABLISHED**: Active data transfer\n- **TIME_WAIT**: Connection closing (2x MSL wait)\n- **CLOSE_WAIT**: Remote closed, local needs to close\n- **FIN_WAIT_1/2**: Local closing connection\n- **SYN_SENT/RECV**: Connection establishing\n- **LISTEN**: Waiting for connections\n\n**Connection Count Thresholds:**\n- **ESTABLISHED**: Monitor trend (normal varies)\n- **TIME_WAIT**: < 10,000 (can cause port exhaustion)\n- **CLOSE_WAIT**: < 100 (indicates connection leak)\n- **SYN_SENT**: < 100 (connection issues if higher)\n\n**Common Issues:**\n- **High TIME_WAIT**: Ephemeral port exhaustion\n- **High CLOSE_WAIT**: Application not closing connections\n- **High SYN_SENT**: Connection timeouts (firewall, down service)\n- **Too many ESTABLISHED**: Connection pool misconfiguration\n\n**Linux Connection Limits:**\n- **Ephemeral ports**: 32768-60999 (~28K connections)\n- **file-max**: System-wide FD limit\n- **nofile**: Per-process FD limit\n- **tcp_max_syn_backlog**: SYN queue size\n\n**Optimization:**\n- Enable `tcp_tw_reuse` (reuse TIME_WAIT sockets)\n- Connection pooling (reuse connections)\n- Close connections properly (no leaks)\n- Load balance across multiple servers',
    examples: [
      {
        title: 'Monitoring Connection States',
        code: `const { execSync } = require('child_process');

function getConnectionCounts() {
  const output = execSync('ss -tan | awk \'NR>1 {print $1}\' | sort | uniq -c', {
    encoding: 'utf8'
  });
  
  const counts = {
    ESTABLISHED: 0,
    TIME_WAIT: 0,
    CLOSE_WAIT: 0,
    FIN_WAIT1: 0,
    FIN_WAIT2: 0,
    SYN_SENT: 0,
    SYN_RECV: 0,
    LISTEN: 0,
    CLOSING: 0,
    LAST_ACK: 0
  };
  
  output.trim().split('\\n').forEach(line => {
    const match = line.match(/\\s*(\\d+)\\s+(\\S+)/);
    if (match) {
      const count = parseInt(match[1]);
      const state = match[2];
      if (counts[state] !== undefined) {
        counts[state] = count;
      }
    }
  });
  
  return {\n    ...counts,
    total: Object.values(counts).reduce((a, b) => a + b, 0),
    status: getConnectionStatus(counts)
  };
}

function getConnectionStatus(counts) {
  const issues = [];
  
  if (counts.TIME_WAIT > 10000) {
    issues.push('🔶 High TIME_WAIT - risk of port exhaustion');
  }
  if (counts.CLOSE_WAIT > 100) {
    issues.push('🔴 High CLOSE_WAIT - connection leak!');
  }
  if (counts.SYN_SENT > 100) {
    issues.push('🔶 High SYN_SENT - connection issues');
  }
  if (counts.ESTABLISHED > 10000) {
    issues.push('⚠️  Very high ESTABLISHED - check connection pool');
  }
  
  return issues.length > 0 ? issues.join('\\n') : '✅ Healthy';
}

// Alternative: Parse /proc/net/tcp
function getConnectionCountsFromProc() {
  const tcp = fs.readFileSync('/proc/net/tcp', 'utf8');
  const lines = tcp.trim().split('\\n').slice(1);
  
  const stateMap = {
    '01': 'ESTABLISHED',
    '02': 'SYN_SENT',
    '03': 'SYN_RECV',
    '04': 'FIN_WAIT1',
    '05': 'FIN_WAIT2',
    '06': 'TIME_WAIT',
    '07': 'CLOSE',
    '08': 'CLOSE_WAIT',
    '09': 'LAST_ACK',
    '0A': 'LISTEN',
    '0B': 'CLOSING'
  };
  
  const counts = {};
  lines.forEach(line => {
    const parts = line.trim().split(/\\s+/);
    const stateHex = parts[3];
    const state = stateMap[stateHex] || 'UNKNOWN';
    counts[state] = (counts[state] || 0) + 1;
  });
  
  return counts;
}

// Fix connection leak

// BAD: Not closing connections
async function fetchBad(url) {
  const response = await fetch(url);
  const data = await response.json();
  // Response body not consumed!
  return data;
}

// GOOD: Properly consume response
async function fetchGood(url) {
  const response = await fetch(url);
  const data = await response.json();
  // Or: await response.text(); then response.body?.cancel();
  return data;
}

// Connection pooling example
const http = require('http');
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,      // Limit concurrent connections
  maxFreeSockets: 10,  // Keep some ready
  timeout: 30000
});

// Use agent for all requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, { agent }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}`,
        explanation:
          'Connection states reveal connection health. High CLOSE_WAIT = leak. High TIME_WAIT = port exhaustion risk. Always close connections properly.',
      },
    ],
    relatedTerms: ['Network Throughput', 'TCP States', 'Connection Pooling', 'Ephemeral Ports'],
    tags: ['connections', 'tcp', 'network', 'infrastructure', 'monitoring'],
  },
  {
    id: 'infra-net-3',
    term: 'Packet Loss',
    slug: 'packet-loss',
    category: 'Infrastructure',
    definition:
      'Packet Loss là phần trăm packets bị mất trong quá trình truyền qua network. Gây retransmissions, tăng latency, giảm throughput, và poor user experience.',
    details:
      '**Packet Loss Causes:**\n- Network congestion (queue overflow)\n- Faulty hardware (cables, switches)\n- WiFi interference\n- MTU mismatches (fragmentation)\n- Buffer bloat (oversized queues)\n- DDoS attacks\n\n**Packet Loss Impact:**\n- **TCP**: Retransmissions, reduced throughput\n- **UDP**: Data loss (no retransmission)\n- **VoIP/Video**: Quality degradation\n- **Gaming**: Lag, rubber-banding\n- **SSH/Terminal**: Input delays\n\n**Acceptable Packet Loss:**\n- **0%**: Ideal (LAN)\n- **< 0.1%**: Excellent (datacenter)\n- **0.1-1%**: Good (broadband)\n- **1-3%**: Fair (noticeable impact)\n- **> 3%**: Poor (severe degradation)\n- **> 5%**: Unusable\n\n**Detection:**\n- `ping -c 100 <host>` (count losses)\n- `mtr <host>` (per-hop loss)\n- `tcpdump` (analyze retransmissions)\n- `netstat -s | grep retrans` (TCP retransmits)\n\n**Troubleshooting:**\n- Trace route to find problematic hop\n- Check interface errors (`ifconfig`)\n- Monitor switch/router CPU\n- Verify duplex settings\n- Check for broadcast storms',
    examples: [
      {
        title: 'Monitoring Packet Loss',
        code: `const { execSync } = require('child_process');

function testPacketLoss(host = '8.8.8.8', count = 100) {
  try {
    const output = execSync(
      \`ping -c \${count} -W 1 \${host}\`,
      { encoding: 'utf8', timeout: count * 2000 }
    );
    
    // Parse results
    const packetMatch = output.match(
      /(\\d+) packets transmitted, (\\d+) (?:packets )?received, ([\\d.]+)% packet loss/
    );
    const rttMatch = output.match(
      /rtt min\\/avg\\/max\\/mdev = ([\\d.]+)\\/([\\d.]+)\\/([\\d.]+)\\/([\\d.]+)/
    );
    
    if (packetMatch) {
      const transmitted = parseInt(packetMatch[1]);
      const received = parseInt(packetMatch[2]);
      const lossPercent = parseFloat(packetMatch[3]);
      
      return {
        host: host,
        transmitted: transmitted,
        received: received,
        lost: transmitted - received,
        lossPercent: lossPercent + '%',
        status: getPacketLossStatus(lossPercent),
        rtt: rttMatch ? {
          min: parseFloat(rttMatch[1]),
          avg: parseFloat(rttMatch[2]),
          max: parseFloat(rttMatch[3])
        } : null
      };
    }
  } catch (e) {
    return { error: 'Ping failed or timeout' };
  }
}

function getPacketLossStatus(lossPercent) {
  if (lossPercent === 0) return '✅ No packet loss';
  if (lossPercent < 0.1) return '✅ Excellent';
  if (lossPercent < 1) return '✅ Good';
  if (lossPercent < 3) return '⚠️  Fair - noticeable';
  if (lossPercent < 5) return '🔶 Poor - investigate';
  return '🔴 Critical - network issue';
}

// Check TCP retransmissions
function getTcpRetransmissions() {
  const netstat = execSync('netstat -s', { encoding: 'utf8' });
  const lines = netstat.split('\\n');
  
  for (const line of lines) {
    if (line.includes('retrans') || line.includes('retransmit')) {
      const match = line.match(/(\\d+).*retrans/);
      if (match) {
        return {
          totalRetransmissions: parseInt(match[1]),
          status: parseInt(match[1]) > 1000 ? '🔶 High' : '✅ Normal'
        };
      }
    }
  }
  return null;
}

// Monitor per-interface errors
function getInterfaceErrors() {
  const netDev = fs.readFileSync('/proc/net/dev', 'utf8');
  const lines = netDev.trim().split('\\n').slice(2);
  
  const errors = {};
  lines.forEach(line => {
    const parts = line.trim().split(/\\s+/);
    const name = parts[0].replace(':', '');
    
    errors[name] = {
      rxErrors: parseInt(parts[3]),
      rxDropped: parseInt(parts[4]),
      txErrors: parseInt(parts[11]),
      txDropped: parseInt(parts[12])
    };
  });
  
  return errors;
}

// Alert on packet loss
const loss = testPacketLoss('8.8.8.8', 50);
if (loss.lossPercent && parseFloat(loss.lossPercent) > 1) {
  console.warn(\`⚠️  Packet loss detected: \${loss.lossPercent}\`);
  console.log('Investigate network path with mtr or traceroute');
}`,
        explanation:
          'Packet loss detected via ping tests. >1% loss impacts performance. TCP retransmissions indicate network issues. Monitor interface errors.',
      },
    ],
    relatedTerms: ['Network Throughput', 'Network Latency', 'TCP Retransmissions', 'MTU'],
    tags: ['packet-loss', 'network', 'infrastructure', 'monitoring', 'tcp'],
  },
  {
    id: 'infra-net-4',
    term: 'DNS Resolution Time',
    slug: 'dns-resolution-time',
    category: 'Infrastructure',
    definition:
      'DNS Resolution Time là thời gian cần thiết để resolve hostname thành IP address. Slow DNS gây connection delays, timeouts, và poor application performance.',
    details:
      '**DNS Resolution Process:**\n1. Check local DNS cache\n2. Query configured DNS servers\n3. Recursive resolution (root → TLD → authoritative)\n4. Return IP address to client\n\n**Typical DNS Resolution Times:**\n- **Cached**: < 1ms\n- **Local DNS server**: 10-50ms\n- **Public DNS (8.8.8.8)**: 20-100ms\n- **Recursive (cold)**: 100-500ms\n- **Slow/broken DNS**: > 1000ms\n\n**DNS Caching:**\n- **Browser cache**: 1-60 seconds\n- **OS cache (nscd)**: Based on TTL\n- **Resolver cache**: Based on TTL\n- **Application cache**: Varies by implementation\n\n**DNS Impact on Performance:**\n- First connection requires DNS lookup\n- Subsequent connections use cache\n- Each new hostname adds DNS latency\n- DNS failures cause connection timeouts\n\n**Optimization:**\n- Use local DNS cache (nscd, systemd-resolved)\n- Set appropriate TTL values\n- Use fast DNS servers (1.1.1.1, 8.8.8.8)\n- Implement application-level DNS cache\n- Use IP addresses for critical paths\n\n**Monitoring:**\n- `dig +stats example.com`\n- `time nslookup example.com`\n- `drill example.com`\n- Application: Measure DNS phase separately',
    examples: [
      {
        title: 'Monitoring DNS Resolution Time',
        code: `const { execSync } = require('child_process');

function testDnsResolution(domain = 'google.com', dnsServer = null) {
  try {
    const serverArg = dnsServer ? \`@\${dnsServer}\` : '';
    const output = execSync(
      \`dig +stats \${serverArg} \${domain}\`,
      { encoding: 'utf8', timeout: 5000 }
    );
    
    // Parse query time
    const queryTimeMatch = output.match(/Query time:\\s+(\\d+)\\s+msec/);
    const serverMatch = output.match(/SERVER:\\s+(\\S+)/);
    
    // Parse answer
    const answerMatch = output.match(/ANSWER SECTION:[\\s\\S]*?\\n\\S+\\s+\\d+\\s+IN\\s+A\\s+(\\S+)/);
    
    if (queryTimeMatch) {
      const queryTimeMs = parseInt(queryTimeMatch[1]);
      return {
        domain: domain,
        queryTimeMs: queryTimeMs,
        dnsServer: serverMatch?.[1] || 'default',
        answer: answerMatch?.[1] || 'no answer',
        status: getDnsStatus(queryTimeMs)
      };
    }
  } catch (e) {
    return { error: 'DNS query failed or timeout' };
  }
}

function getDnsStatus(queryTimeMs) {
  if (queryTimeMs < 10) return '✅ Cached or very fast';
  if (queryTimeMs < 50) return '✅ Fast';
  if (queryTimeMs < 100) return '✅ Acceptable';
  if (queryTimeMs < 500) return '⚠️  Slow DNS';
  return '🔴 Very slow - DNS issue?';
}

// Test multiple DNS servers
function compareDnsServers(domain = 'google.com') {
  const servers = [
    '8.8.8.8',      // Google
    '1.1.1.1',      // Cloudflare
    '9.9.9.9',      // Quad9
    '208.67.222.222' // OpenDNS
  ];
  
  const results = servers.map(server => {
    const result = testDnsResolution(domain, server);
    return {
      server: server,
      ...result
    };
  });
  
  results.sort((a, b) => a.queryTimeMs - b.queryTimeMs);
  console.log('DNS Server Performance:');
  results.forEach(r => {
    console.log(\`  \${r.server}: \${r.queryTimeMs}ms \${r.status}\`);
  });
  
  return results;
}

// Application-level DNS caching
class DnsCache {
  constructor(ttlMs = 60000) { // 1 minute default TTL
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  async resolve(hostname) {
    const cached = this.cache.get(hostname);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return { ip: cached.ip, fromCache: true };
    }

    const start = Date.now();
    const dns = require('dns').promises;
    const addresses = await dns.lookup(hostname);
    const resolutionTime = Date.now() - start;

    this.cache.set(hostname, {
      ip: addresses.address,
      timestamp: Date.now()
    });

    return { ip: addresses.address, fromCache: false, resolutionTime };
  }

  clear() {
    this.cache.clear();
  }
}

// Usage
const dnsCache = new DnsCache(30000); // 30 second cache

async function makeRequest(hostname) {
  const resolved = await dnsCache.resolve(hostname);
  console.log(\`Resolved \${hostname}: \${resolved.ip} (cache: \${resolved.fromCache})\`);
  
  if (!resolved.fromCache) {
    console.log(\`DNS resolution took: \${resolved.resolutionTime}ms\`);
  }
  
  // Use resolved IP for connection
  // ...
}`,
        explanation:
          'DNS resolution adds latency to first connection. Cache DNS results to avoid repeated lookups. >100ms indicates slow DNS server.',
      },
    ],
    relatedTerms: ['Network Latency', 'Connection Counts', 'DNS Caching', 'Network Throughput'],
    tags: ['dns', 'network', 'latency', 'infrastructure', 'monitoring'],
  },
]
