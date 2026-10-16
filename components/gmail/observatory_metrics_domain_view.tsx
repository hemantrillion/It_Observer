'use client';

import React, { useEffect, useRef } from 'react';
import {
  Cloud,
  Box,
  Layers,
  Cpu,
  Server,
  Activity,
  CreditCard,
  Gauge,
  ExternalLink,
  CheckCircle2,
  BarChart3,
  Radio,
  Smartphone,
  Globe2,
} from 'lucide-react';
import { MetricsCategory } from './gmail_left_sidebar';
import { DensityOption } from './gmail_quick_settings_panel';

interface SuboptionDetail {
  id: string;
  label: string;
  title: string;
  description: string;
  keyMetrics: { label: string; value: string; status: 'ok' | 'warn' }[];
  graphPlaceholderTitle: string;
  graphPlaceholderSubtitle: string;
}

interface DomainTelemetryMetadata {
  title: string;
  description: string;
  icon: React.ElementType;
  schemaTable: string;
  prometheusPrefix: string;
  suboptions?: SuboptionDetail[];
  sampleMetrics: {
    name: string;
    type: 'Gauge' | 'Counter' | 'Histogram';
    unit: string;
    description: string;
    sampleValue: string;
  }[];
}

const DOMAIN_METADATA: Record<MetricsCategory, DomainTelemetryMetadata> = {
  Cloud: {
    title: 'Cloud Provider Telemetry',
    description:
      'Aggregates multi-cloud metrics from AWS CloudWatch, Azure Monitor, Cloud Foundry Diego cells, and Google Cloud Platform (GCP) across compute, storage, and serverless infrastructure.',
    icon: Cloud,
    schemaTable: 'cloud_provider_metrics_timeseries',
    prometheusPrefix: 'infratrace_cloud_*',
    suboptions: [
      {
        id: 'aws',
        label: 'AWS',
        title: 'AWS (Amazon Web Services) Telemetry',
        description:
          'Real-time ingestion of Amazon EC2 instance utilization, S3 bucket storage sizes, RDS database query latencies, Lambda invocation concurrency, and CloudWatch alarm metrics in global AWS availability zones.',
        keyMetrics: [
          { label: 'EC2 CPU Average', value: '42.0%', status: 'ok' },
          { label: 'S3 Cold Storage', value: '14.8 GB', status: 'ok' },
          { label: 'CloudWatch Quota Remaining', value: '4,980 reqs', status: 'ok' },
          { label: 'Lambda Error Rate', value: '0.00%', status: 'ok' },
        ],
        graphPlaceholderTitle: 'AWS Telemetry & Latency Graph Space',
        graphPlaceholderSubtitle:
          'Real-time timeseries canvas placeholder (EC2 CPU, RDS IOPS, and CloudWatch latency SLA tracking)',
      },
      {
        id: 'azure',
        label: 'Azure',
        title: 'Microsoft Azure Cloud Telemetry',
        description:
          'Monitors Azure Virtual Machines (VM), Azure Blob Storage throughput, Cosmos DB latency percentiles, and Azure Kubernetes Service (AKS) node telemetry.',
        keyMetrics: [
          { label: 'VM Core Load', value: '38.4%', status: 'ok' },
          { label: 'Blob Read IOPS', value: '1,240 IOPS', status: 'ok' },
          { label: 'Cosmos P99 Latency', value: '8.4 ms', status: 'ok' },
          { label: 'AKS Node Health', value: '100% Ready', status: 'ok' },
        ],
        graphPlaceholderTitle: 'Azure Cloud Infrastructure Graph Space',
        graphPlaceholderSubtitle:
          'Real-time timeseries canvas placeholder (Azure Monitor VM throughput and Cosmos DB latency curves)',
      },
      {
        id: 'cloud-foundry',
        label: 'Cloud Foundry',
        title: 'Cloud Foundry Platform Telemetry',
        description:
          'Ingests Cloud Foundry Diego cell capacity, Gorouter HTTP ingress traffic distribution, app droplet memory allocation cgroups, and Cloud Controller API response times.',
        keyMetrics: [
          { label: 'Diego Cell Memory Pressure', value: '31.2%', status: 'ok' },
          { label: 'Gorouter Ingress Rate', value: '890 req/s', status: 'ok' },
          { label: 'Droplet Containers', value: '24 / 24 Healthy', status: 'ok' },
          { label: 'Router P99 Latency', value: '12.4 ms', status: 'ok' },
        ],
        graphPlaceholderTitle: 'Cloud Foundry Diego & Gorouter Graph Space',
        graphPlaceholderSubtitle:
          'Real-time timeseries canvas placeholder (Gorouter HTTP traffic volume and Diego cell CPU/memory distribution)',
      },
      {
        id: 'cloud-gcp',
        label: 'Cloud GCP',
        title: 'Google Cloud Platform (GCP) Telemetry',
        description:
          'Monitors Google Cloud Compute Engine, Cloud Run serverless concurrency, BigQuery query execution durations, Cloud Spanner transactions, and Google Cloud Storage (GCS) bandwidth.',
        keyMetrics: [
          { label: 'Cloud Run Invocations', value: '2,450 req/s', status: 'ok' },
          { label: 'GCS Outbound Bandwidth', value: '450 MB/s', status: 'ok' },
          { label: 'Spanner Latency P95', value: '6.8 ms', status: 'ok' },
          { label: 'GKE Cluster Nodes', value: '6 / 6 Ready', status: 'ok' },
        ],
        graphPlaceholderTitle: 'Google Cloud Platform (GCP) Telemetry Graph Space',
        graphPlaceholderSubtitle:
          'Real-time timeseries canvas placeholder (Cloud Run request rate, GCS throughput, and Spanner P95 latency)',
      },
    ],
    sampleMetrics: [
      {
        name: 'cloud_aws_ec2_cpu_utilization_ratio',
        type: 'Gauge',
        unit: 'Percent (0.0-1.0)',
        description: 'Average CPU utilization across provisioned EC2 instances in us-east-1',
        sampleValue: '0.42 (42.0%)',
      },
      {
        name: 'cloud_azure_blob_throughput_bytes_total',
        type: 'Counter',
        unit: 'Bytes',
        description: 'Total storage consumed by Azure blob storage telemetry endpoints',
        sampleValue: '18.4 GB',
      },
      {
        name: 'cloud_cf_gorouter_requests_total',
        type: 'Counter',
        unit: 'Requests',
        description: 'Gorouter ingress HTTP requests routed across Diego cell droplets',
        sampleValue: '482,190',
      },
      {
        name: 'cloud_gcp_cloudrun_request_count_total',
        type: 'Counter',
        unit: 'Requests',
        description: 'Cumulative ingress invocations dispatched to serverless microservices',
        sampleValue: '184,291',
      },
    ],
  },
  Frontend: {
    title: 'Frontend & Real User Monitoring (RUM)',
    description:
      'Captures client-side web and native mobile application telemetry: Core Web Vitals, page render times, JavaScript runtime exceptions, and mobile crash diagnostics.',
    icon: Layers,
    schemaTable: 'frontend_rum_vitals_timeseries',
    prometheusPrefix: 'infratrace_frontend_*',
    suboptions: [
      {
        id: 'mobile',
        label: 'Mobile',
        title: 'Mobile Application Telemetry (iOS & Android)',
        description:
          'Captures native iOS and Android application performance metrics: cold app startup latency, frame rendering freeze rates (UI jank), crash-free user sessions, and mobile API latency over cellular networks.',
        keyMetrics: [
          { label: 'Cold App Launch', value: '1.14 s', status: 'ok' },
          { label: 'Crash-Free Session Rate', value: '99.96%', status: 'ok' },
          { label: 'Frozen Frames (UI Jank)', value: '0.08%', status: 'ok' },
          { label: 'Mobile API Latency', value: '62 ms', status: 'ok' },
        ],
        graphPlaceholderTitle: 'Mobile App Performance & Crash Graph Space',
        graphPlaceholderSubtitle:
          'Real-time timeseries canvas placeholder (Cold launch times, crash-free rates, and mobile HTTP response latencies)',
      },
      {
        id: 'web',
        label: 'Web',
        title: 'Web Application & Core Web Vitals (RUM)',
        description:
          'Real User Monitoring (RUM) capturing browser Core Web Vitals: Largest Contentful Paint (LCP), Interaction to Next Paint (INP), Cumulative Layout Shift (CLS), Time to First Byte (TTFB), and unhandled JavaScript exceptions.',
        keyMetrics: [
          { label: 'Largest Contentful Paint (LCP)', value: '0.52 s (Good < 2.5s)', status: 'ok' },
          { label: 'Interaction to Next Paint (INP)', value: '22 ms (Good < 200ms)', status: 'ok' },
          { label: 'Cumulative Layout Shift (CLS)', value: '0.002 (Good < 0.1)', status: 'ok' },
          { label: 'Uncaught JS Exceptions', value: '0 Errors', status: 'ok' },
        ],
        graphPlaceholderTitle: 'Web Core Web Vitals & Page Load Graph Space',
        graphPlaceholderSubtitle:
          'Real-time timeseries canvas placeholder (LCP, INP, CLS distributions and real user browser page rendering curves)',
      },
    ],
    sampleMetrics: [
      {
        name: 'frontend_lcp_duration_seconds',
        type: 'Histogram',
        unit: 'Seconds',
        description: 'Largest Contentful Paint render duration experienced by web clients',
        sampleValue: '0.52s (Good < 2.5s)',
      },
      {
        name: 'frontend_cls_score_ratio',
        type: 'Gauge',
        unit: 'Score (0.0-1.0)',
        description: 'Cumulative Layout Shift score measuring visual stability during load',
        sampleValue: '0.002 (Good < 0.1)',
      },
      {
        name: 'frontend_ttfb_latency_seconds',
        type: 'Histogram',
        unit: 'Seconds',
        description: 'Time to First Byte between browser HTTP request and initial server packet',
        sampleValue: '0.045s (45ms)',
      },
      {
        name: 'frontend_client_uncaught_errors_total',
        type: 'Counter',
        unit: 'Errors',
        description: 'Uncaught window.onerror or unhandled Promise rejections logged in browser',
        sampleValue: '0',
      },
    ],
  },
  Infrastructure: {
    title: 'Host & Bare-Metal Infrastructure Telemetry',
    description:
      'Monitors low-level operating system telemetry including physical CPU core utilization, memory page faults, disk NVMe I/O operations, and hardware temperature.',
    icon: Cpu,
    schemaTable: 'infrastructure_host_metrics_timeseries',
    prometheusPrefix: 'infratrace_node_*',
    sampleMetrics: [
      {
        name: 'node_cpu_seconds_total',
        type: 'Counter',
        unit: 'Seconds',
        description: 'Cumulative CPU core execution time split across user, system, and iowait states',
        sampleValue: '1,429.3s',
      },
      {
        name: 'node_memory_MemAvailable_bytes',
        type: 'Gauge',
        unit: 'Bytes',
        description: 'Amount of physical RAM estimate available for starting new applications without swapping',
        sampleValue: '11.8 GB / 16.0 GB',
      },
      {
        name: 'node_disk_read_bytes_total',
        type: 'Counter',
        unit: 'Bytes',
        description: 'Total disk bytes read from root NVMe filesystem storage device',
        sampleValue: '8.4 GB',
      },
      {
        name: 'node_network_transmit_packets_total',
        type: 'Counter',
        unit: 'Packets',
        description: 'Outbound network packet traffic dispatched across physical NIC interfaces',
        sampleValue: '4,102,940',
      },
    ],
  },
  Containers: {
    title: 'Container & Docker Telemetry',
    description:
      'Gathers OCI runtime metrics, cgroup v2 memory thresholds, CPU throttling quotas, and restart loop diagnostics across containerized microservices.',
    icon: Box,
    schemaTable: 'container_cgroup_metrics_timeseries',
    prometheusPrefix: 'infratrace_container_*',
    sampleMetrics: [
      {
        name: 'container_memory_usage_bytes',
        type: 'Gauge',
        unit: 'Bytes',
        description: 'Working set memory allocated to active container namespaces',
        sampleValue: '512.4 MB',
      },
      {
        name: 'container_cpu_cfs_throttled_periods_total',
        type: 'Counter',
        unit: 'Periods',
        description: 'CFS scheduler periods where container tasks exceeded quota and were throttled',
        sampleValue: '0 (Optimal)',
      },
      {
        name: 'container_restart_count_total',
        type: 'Counter',
        unit: 'Restarts',
        description: 'Total process crash restarts recorded by Docker or containerd daemon',
        sampleValue: '0',
      },
      {
        name: 'container_network_receive_bytes_total',
        type: 'Counter',
        unit: 'Bytes',
        description: 'Ingress network payload received over virtual eth0 interface',
        sampleValue: '182.1 MB',
      },
    ],
  },
  Kubernetes: {
    title: 'Kubernetes Cluster Telemetry',
    description:
      'Tracks control plane API server health, Kubelet node pressure metrics, Pod phase transitions (CrashLoopBackOff, Pending, Running), and HPA auto-scaling.',
    icon: Server,
    schemaTable: 'k8s_cluster_metrics_timeseries',
    prometheusPrefix: 'infratrace_kube_*',
    sampleMetrics: [
      {
        name: 'kube_pod_status_phase',
        type: 'Gauge',
        unit: 'Status Code',
        description: 'Current lifecycle phase of cluster pods (Running=1, Failed=2, Pending=3)',
        sampleValue: '100% Running',
      },
      {
        name: 'kube_node_status_condition',
        type: 'Gauge',
        unit: 'Boolean',
        description: 'Node readiness state reported by Kubelet heartbeats (Ready=1, MemoryPressure=0)',
        sampleValue: 'Ready (Healthy)',
      },
      {
        name: 'kube_deployment_status_replicas_available',
        type: 'Gauge',
        unit: 'Replicas',
        description: 'Number of ready pods serving traffic under production deployment manifests',
        sampleValue: '3 / 3 Replicas',
      },
      {
        name: 'kube_hpa_target_cpu_utilization_ratio',
        type: 'Gauge',
        unit: 'Percent',
        description: 'Horizontal Pod Autoscaler target threshold tracking auto-scale triggers',
        sampleValue: '38% (Threshold: 75%)',
      },
    ],
  },
  Process: {
    title: 'Process Table & Thread Pool Telemetry',
    description:
      'Monitors OS thread pool distribution, open file descriptors, active sockets, resident set size (RSS), and context switches for critical background daemons.',
    icon: Activity,
    schemaTable: 'process_telemetry_timeseries',
    prometheusPrefix: 'infratrace_process_*',
    sampleMetrics: [
      {
        name: 'process_resident_memory_bytes',
        type: 'Gauge',
        unit: 'Bytes',
        description: 'Resident set size (RSS) memory currently held in physical RAM by process',
        sampleValue: '86.4 MB',
      },
      {
        name: 'process_open_fds',
        type: 'Gauge',
        unit: 'File Descriptors',
        description: 'Number of open file descriptors and active network sockets held by daemon',
        sampleValue: '28 / 1024',
      },
      {
        name: 'process_cpu_user_seconds_total',
        type: 'Counter',
        unit: 'Seconds',
        description: 'Total user space CPU execution time consumed by the main process thread',
        sampleValue: '14.2s',
      },
      {
        name: 'process_context_switches_total',
        type: 'Counter',
        unit: 'Context Switches',
        description: 'Voluntary and involuntary CPU context switches incurred by task scheduler',
        sampleValue: '24,190',
      },
    ],
  },
  Runtime: {
    title: 'Runtime & Virtual Machine (Node.js / V8) Telemetry',
    description:
      'Gathers V8 engine garbage collection frequency, mark-sweep pause durations, heap allocation breakdown, and event loop lag latency.',
    icon: Gauge,
    schemaTable: 'runtime_v8_telemetry_timeseries',
    prometheusPrefix: 'infratrace_runtime_*',
    sampleMetrics: [
      {
        name: 'nodejs_eventloop_lag_seconds',
        type: 'Histogram',
        unit: 'Seconds',
        description: 'Lag time between libuv event loop iterations indicating synchronous blockages',
        sampleValue: '0.0012s (1.2ms)',
      },
      {
        name: 'nodejs_heap_size_used_bytes',
        type: 'Gauge',
        unit: 'Bytes',
        description: 'Amount of V8 heap memory actively storing live application objects and closures',
        sampleValue: '68.2 MB / 128 MB',
      },
      {
        name: 'nodejs_gc_duration_seconds_total',
        type: 'Counter',
        unit: 'Seconds',
        description: 'Cumulative wall-clock execution spent inside V8 garbage collector phases',
        sampleValue: '0.042s',
      },
      {
        name: 'nodejs_active_handles_total',
        type: 'Gauge',
        unit: 'Handles',
        description: 'Number of active libuv handles keeping the runtime process alive',
        sampleValue: '18 Handles',
      },
    ],
  },
  Service: {
    title: 'Microservices & Ingress API Telemetry',
    description:
      'Measures inbound HTTP and gRPC request rates, 5xx server error ratios, P50/P90/P99 latency distribution, and circuit-breaker trip frequency.',
    icon: Radio,
    schemaTable: 'service_http_request_timeseries',
    prometheusPrefix: 'infratrace_http_*',
    sampleMetrics: [
      {
        name: 'http_requests_total',
        type: 'Counter',
        unit: 'Requests',
        description: 'Cumulative count of incoming HTTP requests partitioned by route and status code',
        sampleValue: '1,248 reqs',
      },
      {
        name: 'http_request_duration_seconds_p99',
        type: 'Histogram',
        unit: 'Seconds',
        description: '99th percentile response latency SLA observed across microservice endpoints',
        sampleValue: '0.065s (65ms)',
      },
      {
        name: 'http_server_error_rate_ratio',
        type: 'Gauge',
        unit: 'Ratio (0.0-1.0)',
        description: 'Fraction of HTTP transactions yielding 5xx server status codes over 5m window',
        sampleValue: '0.000 (0.0% Errors)',
      },
      {
        name: 'service_active_in_flight_requests',
        type: 'Gauge',
        unit: 'Requests',
        description: 'Current simultaneous requests undergoing asynchronous execution',
        sampleValue: '3 in-flight',
      },
    ],
  },
  Synthetic: {
    title: 'Synthetic Probes & Health Check Telemetry',
    description:
      'Executes periodic synthetic HTTP GET/HEAD checks, validates TLS/SSL certificate chains, records DNS lookup latency, and detects network packet loss.',
    icon: CheckCircle2,
    schemaTable: 'synthetic_probe_history_timeseries',
    prometheusPrefix: 'infratrace_synthetic_*',
    sampleMetrics: [
      {
        name: 'probe_success_bool',
        type: 'Gauge',
        unit: 'Boolean (1/0)',
        description: 'Binary result of last scheduled health check probe (1=Success, 0=Failure)',
        sampleValue: '1 (Passing)',
      },
      {
        name: 'probe_http_duration_seconds',
        type: 'Gauge',
        unit: 'Seconds',
        description: 'Total roundtrip HTTP request-response duration for synthetic target',
        sampleValue: '0.124s (124ms)',
      },
      {
        name: 'probe_ssl_earliest_cert_expiry_days',
        type: 'Gauge',
        unit: 'Days',
        description: 'Remaining calendar days until target host TLS/SSL certificate expires',
        sampleValue: '184 days',
      },
      {
        name: 'probe_dns_lookup_time_seconds',
        type: 'Gauge',
        unit: 'Seconds',
        description: 'Time taken to resolve target hostname via upstream authoritative DNS nameservers',
        sampleValue: '0.008s (8ms)',
      },
    ],
  },
  Billing: {
    title: 'Cloud Cost & Resource Billing Telemetry',
    description:
      'Correlates infrastructure resource consumption with cloud billing APIs (AWS Cost Explorer, GCP Billing Export) to detect unexpected spend spikes.',
    icon: CreditCard,
    schemaTable: 'cloud_cost_telemetry_timeseries',
    prometheusPrefix: 'infratrace_billing_*',
    sampleMetrics: [
      {
        name: 'billing_current_day_burn_usd',
        type: 'Gauge',
        unit: 'USD ($)',
        description: 'Total cloud infrastructure charges accrued since 00:00 UTC',
        sampleValue: '$3.42',
      },
      {
        name: 'billing_monthly_forecast_burn_usd',
        type: 'Gauge',
        unit: 'USD ($)',
        description: 'Machine-learning projected monthly expenditure based on trailing 7-day usage',
        sampleValue: '$104.50',
      },
      {
        name: 'billing_cost_per_thousand_requests_usd',
        type: 'Gauge',
        unit: 'USD / 1k reqs',
        description: 'Marginal infrastructure compute cost incurred per thousand served transactions',
        sampleValue: '$0.0014',
      },
      {
        name: 'billing_unused_idle_provisioning_waste_usd',
        type: 'Gauge',
        unit: 'USD ($)',
        description: 'Estimated financial waste from idle unattached EBS volumes or over-provisioned pods',
        sampleValue: '$0.00 (Optimized)',
      },
    ],
  },
};

interface ObservatoryMetricsDomainViewProps {
  activeCategory?: MetricsCategory;
  activeSuboption?: string | null;
  density?: DensityOption;
  hasWallpaper?: boolean;
}

export function ObservatoryMetricsDomainView({
  activeCategory = 'Cloud',
  activeSuboption,
  density = 'compact',
  hasWallpaper = false,
}: ObservatoryMetricsDomainViewProps) {
  const meta = DOMAIN_METADATA[activeCategory] || DOMAIN_METADATA.Cloud;
  const IconComp = meta.icon;
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected suboption heading when clicked
  useEffect(() => {
    if (activeSuboption) {
      const targetElement = document.getElementById(activeSuboption);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeSuboption, activeCategory]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col h-full overflow-y-auto bg-white select-text"
    >
      {/* ======================================================== */}
      {/* 1. DOMAIN HERO HEADER (BIG, SHARP, HIGH-CONTRAST)        */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 border-b border-[#e0e2ec] shrink-0 bg-[#f8fafd]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3 max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#eaf1fb] flex items-center justify-center text-[#0b57d0] shadow-xs">
                <IconComp className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1f1f1f] tracking-tight">
                {meta.title}
              </h1>

            </div>

            <p className="text-base sm:text-xl text-[#3c4043] font-medium leading-relaxed">
              {meta.description}
            </p>
          </div>

          {/* Quick status badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c4c7c5] text-xs sm:text-sm font-bold text-[#1f1f1f] shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Ingestion Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SUBOPTIONS SECTIONS (AWS, AZURE, GCP, MOBILE, WEB...)  */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 space-y-12">
        {meta.suboptions && meta.suboptions.length > 0 ? (
          meta.suboptions.map((sub) => {
            const isTargeted = activeSuboption === sub.id;

            return (
              <section
                key={sub.id}
                id={sub.id}
                className={`scroll-mt-8 p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
                  isTargeted
                    ? 'border-[#0b57d0] bg-[#f8fafd] shadow-lg ring-2 ring-[#0b57d0]/20'
                    : 'border-[#e0e2ec] bg-[#fbfcfe] shadow-xs hover:border-[#c4c7c5]'
                }`}
              >
                {/* Heading & Small Detail */}
                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#1f1f1f] tracking-tight flex items-center gap-3">
                      <span>{sub.title}</span>
                      {isTargeted && (
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0b57d0] text-white">
                          Selected
                        </span>
                      )}
                    </h2>
                    <span className="text-xs sm:text-sm font-mono font-bold text-[#0b57d0] px-3 py-1 rounded-lg bg-blue-50 border border-blue-200">
                      #{sub.id}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg text-[#3c4043] font-medium leading-relaxed max-w-5xl">
                    {sub.description}
                  </p>

                  {/* Key Metrics Chips */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {sub.keyMetrics.map((km, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#e0e2ec] text-xs sm:text-sm font-semibold shadow-2xs"
                      >
                        <span className="text-[#5e5e5e]">{km.label}:</span>
                        <span className="text-[#1f1f1f] font-mono font-bold">{km.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EMPTY WHITE BOX (As space left for graph - User Requested) */}
                <div className="w-full h-72 sm:h-80 bg-white border-2 border-dashed border-[#c4c7c5] hover:border-[#0b57d0] rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-xs transition-colors group">
                  <div className="w-14 h-14 rounded-full bg-[#f0f4f9] group-hover:bg-[#e8f0fe] flex items-center justify-center text-[#0b57d0] mb-3 transition-colors">
                    <Activity className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-[#1f1f1f] tracking-tight">
                    {sub.graphPlaceholderTitle}
                  </h4>
                  <p className="text-sm sm:text-base text-[#5e5e5e] font-medium max-w-lg mt-2 leading-relaxed">
                    {sub.graphPlaceholderSubtitle}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0b57d0] bg-[#e8f0fe] px-3.5 py-1 rounded-full">
                    Canvas Graph Rendering Area
                  </span>
                </div>
              </section>
            );
          })
        ) : (
          /* Default category view for categories without suboptions (with big fonts & graph placeholder) */
          <section className="p-6 sm:p-8 rounded-3xl border border-[#e0e2ec] bg-[#fbfcfe] shadow-xs space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1f1f1f] tracking-tight">
                {meta.title} Timeseries Analytics
              </h2>
              <p className="text-base sm:text-lg text-[#3c4043] font-medium leading-relaxed max-w-5xl">
                {meta.description}
              </p>
            </div>

            {/* EMPTY WHITE BOX FOR GRAPH */}
            <div className="w-full h-80 sm:h-96 bg-white border-2 border-dashed border-[#c4c7c5] hover:border-[#0b57d0] rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-xs transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#f0f4f9] flex items-center justify-center text-[#0b57d0] mb-3">
                <Activity className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-[#1f1f1f] tracking-tight">
                {meta.title} Telemetry Graph Space
              </h4>
              <p className="text-sm sm:text-base text-[#5e5e5e] font-medium max-w-lg mt-2 leading-relaxed">
                Real-time timeseries canvas placeholder for {meta.prometheusPrefix} metric streams
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0b57d0] bg-[#e8f0fe] px-3.5 py-1 rounded-full">
                Canvas Graph Rendering Area
              </span>
            </div>
          </section>
        )}

        {/* Telemetry Dictionary Table with sharp, big fonts */}
        <div className="space-y-4 pt-4 border-t border-[#e0e2ec]">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-[#1f1f1f] tracking-tight">
              {activeCategory} Metrics Dictionary & Schema Spec
            </h3>
            <span className="text-xs sm:text-sm font-semibold text-[#5e5e5e]">
              OpenTelemetry Standard
            </span>
          </div>

          <div className="border border-[#e0e2ec] rounded-2xl overflow-hidden shadow-xs bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f4f9] text-[#444746] text-xs sm:text-sm font-bold border-b border-[#e0e2ec]">
                  <th className="py-3.5 px-5">Metric Name</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Unit</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5 text-right">Latest Sample</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e2ec] text-xs sm:text-sm">
                {meta.sampleMetrics.map((m) => (
                  <tr key={m.name} className="hover:bg-[#f8fafd] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#0b57d0]">
                      {m.name}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          m.type === 'Gauge'
                            ? 'bg-[#e8f0fe] text-[#0b57d0]'
                            : m.type === 'Counter'
                            ? 'bg-[#e6f4ea] text-[#137333]'
                            : 'bg-[#fef7e0] text-[#b06000]'
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[#5e5e5e] font-semibold">{m.unit}</td>
                    <td className="py-3.5 px-5 text-[#2d3135] font-medium max-w-md">{m.description}</td>
                    <td className="py-3.5 px-5 font-mono font-black text-[#1f1f1f] text-right">
                      {m.sampleValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
