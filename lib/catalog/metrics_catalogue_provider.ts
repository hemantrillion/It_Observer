import rawCatalog from './excel_metrics_catalog.json';

export interface RawMetricItem {
  metric: string;
  description: string;
  parent_path: string;
  api_info: string;
  requirements: string;
  unit?: string;
  target_type?: string;
  is_api_endpoint?: boolean;
}

export interface MetricCardData {
  id: string;
  title: string;
  description: string;
  parentPath: string;
  sampleApi: string;
  requirements: string;
  hasData: boolean;
  curveType: 'spike' | 'wave' | 'dual' | 'flat' | 'empty';
  color: string;
  dualColor?: string;
  series1Name?: string;
  series2Name?: string;
  points: number[];
  dualPoints?: number[];
  unit?: string;
  targetType?: string;
  targetUrl?: string;
  isApiEndpoint?: boolean;
}

export interface MetricGroup {
  id: string;
  title: string;
  metrics: MetricCardData[];
}

export interface CategoryTab {
  id: string;
  label: string;
}

export interface CategoryMeta {
  id: string;
  title: string;
  subtitle: string;
  tabs: CategoryTab[];
}

const typedCatalog = rawCatalog as Record<string, RawMetricItem[]>;

// Helper to generate deterministic realistic curve points based on metric name
function generatePoints(name: string, type: 'spike' | 'wave' | 'dual' | 'flat' | 'empty'): { p1: number[]; p2?: number[] } {
  if (type === 'empty') {
    return { p1: [] };
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) % 100;

  const pointsCount = 40;
  const p1: number[] = [];
  const p2: number[] = [];

  const baseline = 0.08 + (seed % 10) * 0.01;
  const spikeIndex = 18 + (seed % 12);
  const spikeHeight = 0.55 + (seed % 35) * 0.01;

  for (let i = 0; i < pointsCount; i++) {
    const distToSpike = Math.abs(i - spikeIndex);
    let val1 = baseline + Math.sin(i * 0.35 + seed) * 0.02 + ((i * 13) % 7) * 0.003;
    let val2 = baseline * 0.8 + Math.cos(i * 0.3 + seed) * 0.015 + ((i * 17) % 5) * 0.002;

    if (type === 'spike' || type === 'dual') {
      if (distToSpike === 0) {
        val1 = spikeHeight;
        val2 = spikeHeight * 0.75;
      } else if (distToSpike === 1) {
        val1 = spikeHeight * 0.45;
        val2 = spikeHeight * 0.35;
      } else if (distToSpike === 2) {
        val1 = spikeHeight * 0.2;
        val2 = spikeHeight * 0.15;
      }
    } else if (type === 'wave') {
      val1 = baseline + 0.15 * Math.sin(i * 0.2 + seed) + 0.05 * Math.cos(i * 0.4);
    }

    p1.push(Math.max(0, Math.min(1, val1)));
    p2.push(Math.max(0, Math.min(1, val2)));
  }

  return { p1, p2: type === 'dual' ? p2 : undefined };
}

export function getCategoryMetadata(category: string): CategoryMeta {
  switch (category) {
    case 'Service':
      return {
        id: 'Service',
        title: 'Service & Application Telemetry',
        subtitle: 'Core application endpoints, slot allocation, and transaction APIs.',
        tabs: [
          { id: 'all', label: 'All Services' },
          { id: 'oq-ops', label: 'OQ Operations' },
          { id: 'slots', label: 'Slot Engine' },
          { id: 'bookings', label: 'Booking Engine' },
          { id: 'integrations', label: 'Two-Way Integration' },
        ],
      };
    case 'Queues':
      return {
        id: 'Queues',
        title: 'Queue & Notification Telemetry',
        subtitle: 'Live ticket generation, queue depth, station dispatch, and bilingual delay dispatch.',
        tabs: [
          { id: 'all', label: 'All Queues' },
          { id: 'tokens', label: 'Ticket Generation' },
          { id: 'stats', label: 'Queue Depth & Backlog' },
          { id: 'station', label: 'Station Operator' },
          { id: 'notices', label: 'Client Notices' },
        ],
      };
    case 'Database':
      return {
        id: 'Database',
        title: 'Database & Storage Telemetry',
        subtitle: 'Connection pool saturation, sub-millisecond query execution, and Atlas/Prisma DDL schema migrations.',
        tabs: [
          { id: 'all', label: 'All Database' },
          { id: 'pool', label: 'Connection Pool' },
          { id: 'migrations', label: 'Schema Migrations' },
        ],
      };
    case 'Cloud':
      return {
        id: 'Cloud',
        title: 'Cloud Provider Telemetry',
        subtitle: 'AWS compute, storage, CloudWatch telemetry, cost explorer, and infrastructure APIs.',
        tabs: [
          { id: 'all', label: 'All Cloud' },
          { id: 'aws', label: 'AWS' },
        ],
      };
    case 'Containers':
      return {
        id: 'Containers',
        title: 'Container & Docker Telemetry',
        subtitle: 'Docker daemon container runtime, memory constraints, and Kubernetes cluster metrics.',
        tabs: [
          { id: 'all', label: 'All Containers' },
          { id: 'docker', label: 'Docker' },
          { id: 'kubernetes', label: 'Kubernetes' },
        ],
      };
    case 'Service':
      return {
        id: 'Service',
        title: 'Service & Application Telemetry',
        subtitle: 'Core OQ application endpoints, bilingual onboarding, slot allocation, and two-way integration APIs.',
        tabs: [
          { id: 'all', label: 'All Services' },
          { id: 'oq-ops', label: 'OQ Operations' },
          { id: 'ai-schema', label: 'AI & Schema' },
          { id: 'integrations', label: 'Two-Way Integration' },
        ],
      };
    case 'Synthetic':
      return {
        id: 'Synthetic',
        title: 'Synthetic Probes & Map Infrastructure',
        subtitle: 'OpenStreetMap Nominatim geocoding, tile server probes, and public benchmark endpoints.',
        tabs: [
          { id: 'all', label: 'All Synthetic' },
          { id: 'maps', label: 'OpenStreetMap' },
          { id: 'benchmarks', label: 'Public Benchmarks' },
        ],
      };
    case 'Queues':
      return {
        id: 'Queues',
        title: 'Queue & Notification Telemetry',
        subtitle: 'Automated bilingual delay notice queue, cancellation dispatches, and delivery status.',
        tabs: [
          { id: 'all', label: 'All Queues' },
          { id: 'notices', label: 'Client Notices & Backlog' },
        ],
      };
    case 'Database':
      return {
        id: 'Database',
        title: 'Database & Storage Telemetry',
        subtitle: 'Database query execution time, connection pool saturation, and read/write error telemetry.',
        tabs: [
          { id: 'all', label: 'All Database' },
          { id: 'db', label: 'Connection Pool & Queries' },
        ],
      };
    case 'Security':
      return {
        id: 'Security',
        title: 'Security, TLS & Authentication Telemetry',
        subtitle: 'Direct SSL/TLS certificate expiry, 1.1.1.1 public DNS latency, Cloudflare edge, and CI/CD runs.',
        tabs: [
          { id: 'all', label: 'All Security' },
          { id: 'edge', label: 'Edge, TLS & DNS' },
        ],
      };
    case 'Infrastructure':
      return {
        id: 'Infrastructure',
        title: 'Host & Infrastructure Telemetry',
        subtitle: 'Port 5001 host OS telemetry, simulated health states, deliberate outage injection, latency lag, and recovery.',
        tabs: [
          { id: 'all', label: 'All Infrastructure' },
          { id: 'daemon', label: 'Host Daemon & Chaos' },
        ],
      };
    default:
      return {
        id: category,
        title: `${category} Telemetry`,
        subtitle: `Real-time timeseries metrics and telemetry inspection for ${category}.`,
        tabs: [{ id: 'all', label: 'All Metrics' }],
      };
  }
}

export function getCategoryMetricGroups(category: string, activeTabId: string = 'all'): MetricGroup[] {
  const items = typedCatalog[category] || [];
  const sep = String.fromCharCode(8250); // ›

  // Filter items by active tab
  let filteredItems = items;
  const tabLower = activeTabId.toLowerCase();

  if (category === 'Cloud') {
    filteredItems = items.filter((item) => {
      const p = item.parent_path.toLowerCase();
      if (tabLower === 'aws') return p.includes('aws');
      return true;
    });
  } else if (category === 'Containers' && tabLower !== 'all') {
    if (tabLower === 'docker') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('docker'));
    } else if (tabLower === 'kubernetes') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('kubernetes'));
    }
  } else if (category === 'Service' && tabLower !== 'all') {
    if (tabLower === 'oq-ops') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('oq operations'));
    } else if (tabLower === 'ai-schema') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('ai & schema'));
    } else if (tabLower === 'integrations') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('two-way integration'));
    }
  } else if (category === 'Synthetic' && tabLower !== 'all') {
    if (tabLower === 'maps') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('openstreetmap'));
    } else if (tabLower === 'benchmarks') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('public benchmarks'));
    }
  } else if (category === 'Queues' && tabLower !== 'all') {
    filteredItems = items;
  } else if (category === 'Database' && tabLower !== 'all') {
    filteredItems = items;
  } else if (category === 'Security' && tabLower !== 'all') {
    filteredItems = items;
  } else if (category === 'Infrastructure' && tabLower !== 'all') {
    filteredItems = items;
  }

  // Group items by sub-group
  const groupMap = new Map<string, MetricCardData[]>();

  filteredItems.forEach((raw, idx) => {
    const parts = raw.parent_path.split(sep).map((p) => p.trim());
    let groupTitle = 'General Purpose Telemetry';

    if (raw.is_api_endpoint) {
      if (category === 'Cloud') {
        groupTitle = 'AWS Cloud Compute, Storage & Infrastructure APIs';
      } else if (category === 'Containers') {
        groupTitle = 'Container & Cluster Orchestration APIs';
      } else if (category === 'Service') {
        groupTitle = 'OQ Business, Operational & Schema APIs';
      } else if (category === 'Queues') {
        groupTitle = 'Client Notice & Delay Notification APIs';
      } else if (category === 'Database') {
        groupTitle = 'OQ Database Telemetry APIs';
      } else if (category === 'Security') {
        groupTitle = 'Edge, Network & Security Verification APIs';
      } else if (category === 'Synthetic') {
        groupTitle = 'Free Online Maps & Public Benchmark APIs';
      } else if (category === 'Infrastructure') {
        groupTitle = 'Controlled Service & Chaos Simulation APIs';
      } else {
        groupTitle = parts[1] || parts[0] || 'API Endpoints';
      }
    } else if (category === 'Cloud') {
      const rawSub = parts[2] || parts[1] || 'General';
      const lowerSub = rawSub.toLowerCase();
      if (lowerSub.includes('ec2') || lowerSub.includes('compute') || lowerSub.includes('vm') || lowerSub.includes('virtual')) {
        groupTitle = 'Compute & Utilization';
      } else if (lowerSub.includes('s3') || lowerSub.includes('storage') || lowerSub.includes('ebs') || lowerSub.includes('blob')) {
        groupTitle = 'Storage & I/O';
      } else if (lowerSub.includes('lambda') || lowerSub.includes('api gateway') || lowerSub.includes('rds') || lowerSub.includes('sql') || lowerSub.includes('app service')) {
        groupTitle = 'Requests & Latency';
      } else if (lowerSub.includes('cost') || lowerSub.includes('health') || lowerSub.includes('quota') || lowerSub.includes('error')) {
        groupTitle = 'Errors & Cost';
      } else if (lowerSub.includes('cdn') || lowerSub.includes('network') || lowerSub.includes('gateway') || lowerSub.includes('front door')) {
        groupTitle = 'Networking & CDN';
      } else if (lowerSub.includes('queue') || lowerSub.includes('sqs') || lowerSub.includes('sns') || lowerSub.includes('bus')) {
        groupTitle = 'Queues & Messaging';
      } else {
        groupTitle = rawSub;
      }
    } else {
      groupTitle = parts[1] || parts[0] || 'General Telemetry';
    }

    if (!groupMap.has(groupTitle)) {
      groupMap.set(groupTitle, []);
    }

    const isApi = !!raw.is_api_endpoint;
    const isDual = !isApi && (raw.metric.toLowerCase().includes('in/out') || raw.metric.toLowerCase().includes('read/write') || raw.metric.toLowerCase().includes('received/sent'));

    // Critical Requirement: For the 34 API endpoints, until suite configuration occurs, hasData MUST be false (no fake sine waves)
    const hasData = isApi ? false : (idx % 2 === 0 || idx < 3 || isDual);
    const curveType = !hasData ? 'empty' : isDual ? 'dual' : idx % 3 === 0 ? 'spike' : 'wave';
    const color = isDual ? '#2563eb' : idx % 4 === 0 ? '#0284c7' : idx % 4 === 1 ? '#10b981' : idx % 4 === 2 ? '#6366f1' : '#0ea5e9';

    const { p1, p2 } = generatePoints(raw.metric, curveType);

    const cleanId = isApi
      ? `api-${raw.metric.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      : `${category}-${idx}-${raw.metric.replace(/[^a-zA-Z0-9]/g, '_')}`;

    groupMap.get(groupTitle)!.push({
      id: cleanId,
      title: raw.metric,
      description: raw.description,
      parentPath: raw.parent_path,
      sampleApi: raw.api_info,
      requirements: raw.requirements,
      hasData,
      curveType,
      color,
      dualColor: isDual ? '#22d3ee' : undefined,
      series1Name: isDual ? 'Network In' : undefined,
      series2Name: isDual ? 'Network Out' : undefined,
      points: p1,
      dualPoints: p2,
      unit: raw.unit || 'ms',
      targetType: raw.target_type,
      targetUrl: raw.api_info,
      isApiEndpoint: isApi,
    });
  });

  const result: MetricGroup[] = [];
  groupMap.forEach((metrics, title) => {
    result.push({
      id: title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
      title,
      metrics,
    });
  });

  return result;
}
