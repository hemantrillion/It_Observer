'use client';

import React from 'react';
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
  Info,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { MetricsCategory } from './gmail_left_sidebar';
import { DensityOption } from './gmail_quick_settings_panel';

interface ObservatoryMetricsDomainViewProps {
  activeCategory?: MetricsCategory;
  density?: DensityOption;
  hasWallpaper?: boolean;
}

interface DomainTelemetryMetadata {
  title: string;
  description: string;
  icon: React.ElementType;
  schemaTable: string;
  prometheusPrefix: string;
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
      'Aggregates multi-cloud metrics from AWS CloudWatch, Google Cloud Monitoring, and Azure Monitor across provisioned compute, serverless functions, and managed datastores.',
    icon: Cloud,
    schemaTable: 'cloud_provider_metrics_timeseries',
    prometheusPrefix: 'infratrace_cloud_*',
    sampleMetrics: [
      {
        name: 'cloud_aws_ec2_cpu_utilization_ratio',
        type: 'Gauge',
        unit: 'Percent (0.0-1.0)',
        description: 'Average CPU utilization across provisioned EC2 instances in us-east-1',
        sampleValue: '0.42 (42.0%)',
      },
      {
        name: 'cloud_aws_s3_bucket_byte_size_total',
        type: 'Gauge',
        unit: 'Bytes',
        description: 'Total storage consumed by telemetry artifact and cold-archive buckets',
        sampleValue: '14.8 GB',
      },
      {
        name: 'cloud_gcp_cloudrun_request_count_total',
        type: 'Counter',
        unit: 'Requests',
        description: 'Cumulative ingress invocations dispatched to serverless microservices',
        sampleValue: '184,291',
      },
      {
        name: 'cloud_api_rate_limit_quota_remaining',
        type: 'Gauge',
        unit: 'Requests Remaining',
        description: 'Remaining API calls permitted before provider throttling kicks in',
        sampleValue: '4,980 / 5,000',
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
  Frontend: {
    title: 'Frontend & Real User Monitoring (RUM)',
    description:
      'Tracks Core Web Vitals (Largest Contentful Paint, First Input Delay, Cumulative Layout Shift), JavaScript runtime exceptions, and client-side page load timings.',
    icon: Layers,
    schemaTable: 'frontend_rum_vitals_timeseries',
    prometheusPrefix: 'infratrace_frontend_*',
    sampleMetrics: [
      {
        name: 'frontend_lcp_duration_seconds',
        type: 'Histogram',
        unit: 'Seconds',
        description: 'Largest Contentful Paint render duration experienced by web clients',
        sampleValue: '0.48s (Good < 2.5s)',
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

export function ObservatoryMetricsDomainView({
  activeCategory = 'Infrastructure',
  density = 'compact',
  hasWallpaper = false,
}: ObservatoryMetricsDomainViewProps) {
  const meta = DOMAIN_METADATA[activeCategory] || DOMAIN_METADATA.Infrastructure;
  const IconComp = meta.icon;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white select-text">
      {/* ======================================================== */}
      {/* 1. DOMAIN HEADER                                         */}
      {/* ======================================================== */}
      <div className="p-5 border-b border-[#e0e2ec] shrink-0 flex items-start justify-between gap-4 bg-[#f8fafd]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#eaf1fb] flex items-center justify-center text-[#0b57d0]">
              <IconComp className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#1f1f1f] tracking-tight">
              {meta.title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#0b57d0] border border-[#0b57d0]/20">
              Telemetry Domain
            </span>
          </div>

          <p className="text-xs text-[#5e5e5e] max-w-2xl leading-relaxed">
            {meta.description}
          </p>
        </div>

        {/* Action button to scrape raw Prometheus endpoint */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/metrics"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#c4c7c5] hover:border-[#0b57d0] hover:text-[#0b57d0] text-xs font-semibold text-[#1f1f1f] shadow-xs transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#0b57d0]" />
            <span>Open Prometheus /metrics</span>
            <ExternalLink className="w-3 h-3 text-[#747775]" />
          </a>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DOMAIN CONTENT                                        */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Quick KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#e0e2ec] bg-[#f8fafd] space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e5e5e]">
              Metric Ingestion
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-base font-bold text-[#1f1f1f]">Live Streaming</span>
            </div>
            <p className="text-[11px] text-[#5e5e5e]">Scraping via OpenTelemetry daemon</p>
          </div>

          <div className="p-4 rounded-xl border border-[#e0e2ec] bg-[#f8fafd] space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e5e5e]">
              Prometheus Metric Filter
            </span>
            <p className="text-base font-mono font-bold text-[#0b57d0] truncate">
              {meta.prometheusPrefix}
            </p>
            <p className="text-[11px] text-[#5e5e5e]">Exported via Prometheus text format</p>
          </div>

          <div className="p-4 rounded-xl border border-[#e0e2ec] bg-[#f8fafd] space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e5e5e]">
              Database Schema Table
            </span>
            <p className="text-base font-mono font-bold text-[#1f1f1f] truncate">
              {meta.schemaTable}
            </p>
            <p className="text-[11px] text-[#5e5e5e]">SQLite indexed timeseries log</p>
          </div>

          <div className="p-4 rounded-xl border border-[#e0e2ec] bg-[#f8fafd] space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5e5e5e]">
              Scrape Interval
            </span>
            <p className="text-base font-bold text-[#1f1f1f]">10s polling cadence</p>
            <p className="text-[11px] text-[#5e5e5e]">Configurable via settings</p>
          </div>
        </div>

        {/* Telemetry Metrics Dictionary Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#e0e2ec]">
            <h3 className="text-sm font-bold text-[#1f1f1f] uppercase tracking-wider">
              {activeCategory} Metrics Dictionary & Sample Readings
            </h3>
            <span className="text-xs text-[#5e5e5e]">Prometheus / OpenTelemetry Standard</span>
          </div>

          <div className="border border-[#e0e2ec] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f4f9] text-[#444746] text-xs font-semibold border-b border-[#e0e2ec]">
                  <th className="py-3 px-4">Metric Identifier</th>
                  <th className="py-3 px-4">Metric Type</th>
                  <th className="py-3 px-4">Measurement Unit</th>
                  <th className="py-3 px-4">Telemetry Description</th>
                  <th className="py-3 px-4 text-right">Latest Sample</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e2ec] text-xs">
                {meta.sampleMetrics.map((m) => (
                  <tr key={m.name} className="hover:bg-[#f8fafd] transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#0b57d0]">
                      {m.name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
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
                    <td className="py-3 px-4 text-[#5e5e5e] font-medium">{m.unit}</td>
                    <td className="py-3 px-4 text-[#1f1f1f] max-w-md">{m.description}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#1f1f1f] text-right">
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
