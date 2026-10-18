import rawCatalog from './excel_metrics_catalog.json';

export interface RawMetricItem {
  metric: string;
  description: string;
  parent_path: string;
  api_info: string;
  requirements: string;
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
    case 'Cloud':
      return {
        id: 'Cloud',
        title: 'Cloud Provider Telemetry',
        subtitle: 'View metrics for the selected cloud provider. Metrics are ingested from native monitoring services.',
        tabs: [
          { id: 'aws', label: 'AWS' },
          { id: 'azure', label: 'Azure' },
          { id: 'cloud-foundry', label: 'Cloud Foundry' },
          { id: 'gcp', label: 'GCP' },
          { id: 'vmware', label: 'VMware' },
          { id: 'openstack', label: 'OpenStack' },
        ],
      };
    case 'Containers':
      return {
        id: 'Containers',
        title: 'Container & Docker Telemetry',
        subtitle: 'Docker daemon container runtime, memory constraints, and namespace metrics.',
        tabs: [
          { id: 'all', label: 'All Containers' },
          { id: 'state', label: 'Lifecycle' },
          { id: 'resources', label: 'CPU & Memory' },
          { id: 'io', label: 'Network & I/O' },
        ],
      };
    case 'Frontend':
      return {
        id: 'Frontend',
        title: 'Frontend & Real User Monitoring (RUM)',
        subtitle: 'Core Web Vitals, page load latency, network waterfalls, and client-side error telemetry.',
        tabs: [
          { id: 'all', label: 'All Frontend' },
          { id: 'vitals', label: 'Core Web Vitals' },
          { id: 'web', label: 'Web Applications' },
          { id: 'mobile', label: 'Mobile Apps' },
        ],
      };
    case 'Infrastructure':
      return {
        id: 'Infrastructure',
        title: 'Host & Infrastructure Telemetry',
        subtitle: 'Bare-metal, virtualized OS hosts, storage pools, and network interface controller (NIC) statistics.',
        tabs: [
          { id: 'all', label: 'All Infrastructure' },
          { id: 'cpu', label: 'CPU & Load' },
          { id: 'memory', label: 'Memory' },
          { id: 'disk', label: 'Disk & Filesystem' },
          { id: 'network', label: 'Network' },
        ],
      };
    case 'Kubernetes':
      return {
        id: 'Kubernetes',
        title: 'Kubernetes Cluster Telemetry',
        subtitle: 'Control plane health, kubelet worker nodes, deployments, and horizontal pod autoscaling (HPA).',
        tabs: [
          { id: 'all', label: 'All Kubernetes' },
          { id: 'workloads', label: 'Workloads & Pods' },
          { id: 'nodes', label: 'Node Readiness' },
          { id: 'networking', label: 'Ingress & Service' },
        ],
      };
    case 'Billing':
      return {
        id: 'Billing',
        title: 'Cloud Cost & Resource Billing Telemetry',
        subtitle: 'Infrastructure cost attribution, monthly burn forecasting, and idle resource waste tracking.',
        tabs: [
          { id: 'all', label: 'All Cost & Billing' },
          { id: 'capacity', label: 'Capacity & Utilization' },
          { id: 'attribution', label: 'Cost by Service' },
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

export function getCategoryMetricGroups(category: string, activeTabId: string = 'aws'): MetricGroup[] {
  const items = typedCatalog[category] || [];
  const sep = String.fromCharCode(8250); // ›

  // Filter items by active tab if category is Cloud
  let filteredItems = items;
  if (category === 'Cloud') {
    const tabLower = activeTabId.toLowerCase();
    filteredItems = items.filter((item) => {
      const p = item.parent_path.toLowerCase();
      if (tabLower === 'aws') return p.includes('aws');
      if (tabLower === 'azure') return p.includes('azure');
      if (tabLower === 'cloud-foundry') return p.includes('cloud foundry');
      if (tabLower === 'gcp') return p.includes('cloud gcp') || p.includes('gcp');
      if (tabLower === 'vmware') return p.includes('vmware');
      if (tabLower === 'openstack') return p.includes('openstack');
      return true;
    });
  } else if (category === 'Frontend' && activeTabId !== 'all') {
    if (activeTabId === 'vitals') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('vitals') || i.metric.toLowerCase().includes('lcp') || i.metric.toLowerCase().includes('cls') || i.metric.toLowerCase().includes('fid'));
    } else if (activeTabId === 'mobile') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('mobile') || i.parent_path.toLowerCase().includes('custom'));
    } else if (activeTabId === 'web') {
      filteredItems = items.filter((i) => i.parent_path.toLowerCase().includes('web'));
    }
  }

  // Group items by sub-group
  const groupMap = new Map<string, MetricCardData[]>();

  filteredItems.forEach((raw, idx) => {
    const parts = raw.parent_path.split(sep).map((p) => p.trim());
    let groupTitle = 'General Purpose Telemetry';

    if (category === 'Cloud') {
      const rawSub = parts[2] || parts[1] || 'General';
      // Normalize group title to user's desired general purpose groups
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

    // Determine curve style: first few metrics in each group show active data, others show clean empty state as in Image 4
    const isDual = raw.metric.toLowerCase().includes('in/out') || raw.metric.toLowerCase().includes('read/write') || raw.metric.toLowerCase().includes('received/sent');
    const hasData = idx % 2 === 0 || idx < 3 || isDual;
    const curveType = !hasData ? 'empty' : isDual ? 'dual' : idx % 3 === 0 ? 'spike' : 'wave';
    const color = isDual ? '#2563eb' : idx % 4 === 0 ? '#0284c7' : idx % 4 === 1 ? '#10b981' : idx % 4 === 2 ? '#6366f1' : '#0ea5e9';

    const { p1, p2 } = generatePoints(raw.metric, curveType);

    groupMap.get(groupTitle)!.push({
      id: `${category}-${idx}-${raw.metric.replace(/[^a-zA-Z0-9]/g, '_')}`,
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
