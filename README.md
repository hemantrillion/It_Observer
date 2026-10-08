# Infrastructure Observatory // 30-A Baseline

> **A Lightweight Telemetry, Health Monitoring & Controlled Chaos Engine**  
> Built with strict **Monochrome Neo-Brutalism** and a **hyper-modular atomic architecture**.

---

## ⚡ Quickstart (Clone & Run)

### Prerequisites
* **Node.js**: v22.5.0 or higher (v24.x recommended).  
  * *Note: Uses Node.js native `node:sqlite` (`DatabaseSync`), requiring zero external database installations or C++ compilation.*
* **npm**: v10.x or higher.

### 1. Clone the Repository
```bash
git clone https://github.com/hemantrillion/It_Observer.git
cd It_Observer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Everything with One Command
```bash
npm run dev:all
```
This single command boots both:
1. **Controlled Companion Service** on `http://localhost:5001` (CPU/RAM telemetry & Chaos injection).
2. **Observatory Web Console** on `http://localhost:3000` (Next.js App Router).

---

## 🖥️ Navigation & Access

Open your browser to:
* **Observatory Cockpit**: [http://localhost:3000](http://localhost:3000)
* **Incident Audit Trail**: [http://localhost:3000/incidents](http://localhost:3000/incidents)
* **Settings & Cloud Keys**: [http://localhost:3000/settings](http://localhost:3000/settings)
* **Companion Service Health**: [http://localhost:5001/metrics](http://localhost:5001/metrics)

---

## 🧪 Live Chaos Injection Demonstration

On the main dashboard, you will find the **Interactive Chaos Testing Panel**:

1. **Crash Simulation**: Click `[ 💥 CRASH SERVICE (503) ]`.
   * The local companion service begins returning HTTP 503.
   * Within the next polling cycle, the status flips to 🔴 `[ DOWN ]`.
   * A **Critical Incident Alert** is automatically created and logged in the database.
2. **Lag Simulation**: Click `[ 🐢 INJECT 2500MS LAG ]`.
   * Artificial 2.5-second latency is introduced on the internal event loop.
   * Status updates to `[ DEGRADED ]`, warning of latency threshold violation.
3. **Recovery**: Click `[ ✓ RECOVER SERVICE ]`.
   * Service returns to normal 🟢 `[ HEALTHY ]` response.
   * The active incident is automatically resolved, calculating and recording the exact duration of the downtime in seconds.

---

## 🎯 Test Suite Architecture

The platform monitors a curated, multi-tier test suite:

| Target | Type | Endpoint | Capabilities Tested |
| :--- | :--- | :--- | :--- |
| **GitHub REST API** | Public API | `api.github.com/users/octocat` | Real user activity, HTTP status, rate-limit headers |
| **Hacker News Firebase API** | Public API | `hacker-news.firebaseio.com/v0/maxitem.json` | High-traffic live production platform uptime |
| **Open-Meteo API** | Public API | `api.open-meteo.com` | High-frequency latency tracking (< 100ms) |
| **Local Companion Service** | System Process | `localhost:5001/metrics` | Real process CPU (`process.cpuUsage()`), Memory RSS/Heap, deliberate failure |
| **AWS CloudWatch** | Cloud Provider | `status.aws.amazon.com` (or IAM keys) | Cloud infrastructure availability and metrics |
| **Cloudflare Edge** | Cloud Provider | `cloudflarestatus.com` (or API token) | Global edge network status & performance |

---

## 🎨 Design Philosophy: Monochrome Neo-Brutalism

* **Strict Palette**: Pure Black (`#000000`) and Pure White (`#ffffff`). No decorative accent colors or soft grays.
* **Rigid Geometry**: **0px border-radius** across all elements (buttons, cards, inputs, tables).
* **Borders & Shadows**: 2px to 4px solid black borders with hard offset shadows (`4px 4px 0 #000000`). Zero blur.
* **Typography**: Clean, bold uppercase headings and monospace telemetry metrics.
* **Interactions**: Direct physical states via color inversion (white-on-black ↔ black-on-white).

---

## 📁 Hyper-Modular Atomic File Structure

Every component, button, card, query, and adapter is kept in its own small, single-purpose file (< 60 lines each):

```
├── controlled_service/
│   └── server.js                                    # Port 5001 companion service (CPU, RAM, Chaos)
├── components/
│   ├── buttons/
│   │   ├── refresh_metrics_button_on_header.tsx     # [ ⟳ POLL NOW ] button
│   │   ├── view_service_detail_button_on_card.tsx   # [ INSPECT SERVICE → ] button
│   │   ├── trigger_chaos_down_button_on_panel.tsx   # [ 💥 CRASH SERVICE (503) ] button
│   │   ├── trigger_chaos_lag_button_on_panel.tsx    # [ 🐢 INJECT 2500MS LAG ] button
│   │   ├── trigger_chaos_recover_button_on_panel.tsx# [ ✓ RECOVER SERVICE ] button
│   │   ├── navigation_tab_button_on_nav_bar.tsx     # Navigation links
│   │   ├── back_to_dashboard_button_on_detail_page.tsx
│   │   └── save_cloud_credentials_button_on_settings.tsx
│   ├── cards/
│   │   ├── system_health_metric_summary_card.tsx    # Health counter blocks
│   │   ├── monitored_service_status_block_card.tsx  # Service status blocks
│   │   ├── active_incident_alert_notification_card.tsx # High-contrast alert banners
│   │   ├── latency_metric_timeseries_graph_card.tsx # Neo-brutalist bar graph
│   │   └── service_detail_info_block_card.tsx       # Detailed telemetry stats
│   └── containers/
│       ├── top_header_navigation_bar_container.tsx  # Header nav bar
│       ├── system_overview_metrics_bar_container.tsx# 5-column health metrics row
│       ├── monitored_services_grid_container.tsx    # Target grid
│       ├── chaos_testing_control_panel_container.tsx# Interactive chaos toolbar
│       └── incident_history_table_container.tsx     # Incident audit log table
├── lib/
│   ├── database/                                    # Native SQLite queries (node:sqlite)
│   │   ├── sqlite_database_connection_manager.ts
│   │   ├── initialize_observatory_tables.ts
│   │   ├── get_all_monitored_services_query.ts
│   │   ├── get_single_service_by_id_query.ts
│   │   ├── update_service_status_query.ts
│   │   ├── insert_metric_sample_query.ts
│   │   ├── get_metric_samples_by_service_query.ts
│   │   ├── insert_incident_alert_query.ts
│   │   ├── resolve_active_incident_alert_query.ts
│   │   ├── get_all_incidents_history_query.ts
│   │   └── get_active_incidents_count_query.ts
│   ├── test_suite_adapters/                         # Unified Test Suite Adapters
│   │   ├── base_monitor_target_interface.ts
│   │   ├── github_public_api_adapter.ts
│   │   ├── hacker_news_public_api_adapter.ts
│   │   ├── open_meteo_public_api_adapter.ts
│   │   ├── local_controlled_node_service_adapter.ts
│   │   ├── aws_cloudwatch_adapter.ts
│   │   ├── cloudflare_edge_adapter.ts
│   │   └── registry_of_test_suite_adapters.ts
│   └── monitoring_engine/
│       ├── execute_all_service_checks.ts
│       └── incident_threshold_evaluator.ts
├── scripts/
│   └── run-all.js                                   # Single-command runner
└── app/
    ├── page.tsx                                     # Main Observatory Cockpit
    ├── services/[id]/page.tsx                       # Service Detail View
    ├── incidents/page.tsx                           # Incidents Audit Trail
    └── settings/page.tsx                            # Cloud & Key Configuration
```

---

## 📜 Development Log
See [`PROJECT_LOG.md`](./PROJECT_LOG.md) for the complete record of the Phase 1 build, design decisions, and verification results.
