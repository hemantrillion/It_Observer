# Project Development Log — Session 1
**Date:** October 7, 2026  
**Scope:** Phase 1 (Initial Vertical Slice of 30-A)  

---

### Precise Title of What Was Built:
> **"Standalone Service Observatory & Controlled Chaos Engine (30-A Baseline)"**

---

### 1. The Context & Architectural Shift
Earlier, the plan was to build an entire mock e-commerce store just to have something to monitor. Today, we corrected that approach:
* Dropped the disposable demo store to avoid wasting time building an artificial app.
* Shifted to a **Test-Suite-Driven Architecture**: The Observatory monitors a hybrid suite of real public APIs, local system processes, and cloud endpoints.
* Locked in the **30 + 30 + 30** sizing model:
  * **30-A (Current Focus):** Infrastructure Observatory (Monitoring, Metrics, Detection, Alerts).
  * **30-B (Future):** Incident Intelligence (Log ingestion, event correlation, root cause).
  * **30-C (Future):** Infrastructure Optimization & Embeddable Developer Widget.

---

### 2. What We Actually Built (The Concrete Deliverables)

#### A. Design System: Strict Monochrome Neo-Brutalism
* Pure black (`#000000`) and pure white (`#ffffff`) palette.
* Absolute **0px border-radius** across all buttons, cards, containers, inputs, and tables.
* Heavy 2px to 4px solid black borders with hard offset brutalist shadows (`4px 4px 0 #000000`).
* High-contrast monospace and sans-serif typography.

#### B. Hyper-Modular Atomic Codebase
Every element is strictly isolated in its own single-purpose, descriptively-named file (< 60 lines per file):
* **Buttons:** `refresh_metrics_button_on_header.tsx`, `trigger_chaos_down_button_on_panel.tsx`, `trigger_chaos_lag_button_on_panel.tsx`, `trigger_chaos_recover_button_on_panel.tsx`, `view_service_detail_button_on_card.tsx`, etc.
* **Cards & Displays:** `system_health_metric_summary_card.tsx`, `monitored_service_status_block_card.tsx`, `active_incident_alert_notification_card.tsx`, `latency_metric_timeseries_graph_card.tsx`.
* **Containers:** `top_header_navigation_bar_container.tsx`, `system_overview_metrics_bar_container.tsx`, `monitored_services_grid_container.tsx`, `chaos_testing_control_panel_container.tsx`, `incident_history_table_container.tsx`.
* **Database Queries:** Native SQLite (`node:sqlite`) with separate files for each query (`insert_metric_sample_query.ts`, `insert_incident_alert_query.ts`, etc.).

#### C. The Unified Test Suite
* **GitHub REST API (`api.github.com`):** Live public target tracking HTTP response times, status codes, and rate-limit headers.
* **Hacker News Firebase API:** Live high-traffic production endpoint.
* **Open-Meteo Weather API:** High-frequency public API.
* **Local Controlled Companion Service (`localhost:5001`):** Independent Node.js process exposing real process CPU (`process.cpuUsage()`), memory heap metrics, and deliberate chaos endpoints.
* **AWS CloudWatch & Cloudflare Adapters:** Plug-and-play cloud adapters ready to query live credentials entered via the Settings page.

#### D. The Polling, Alerting & Incident Lifecycle Engine
* Background scheduler polling targets every 8 seconds.
* Evaluates threshold rules (HTTP status != 200 or latency > 1200ms).
* Automatically opens incidents when failures occur and resolves them when services recover, logging exact downtime duration (in seconds) to SQLite.

---

### 3. What Was Verified Working Live (The Proof)
1. **Normal State:** All test suite services polled and displaying 🟢 `HEALTHY` with real live latencies (15ms to 1047ms).
2. **Chaos Injection:** Triggered deliberate HTTP 503 crash on the companion service.
3. **Detection & Alert:** Observatory poller detected the failure within one cycle, flipped status to 🔴 `[ DOWN ]`, and raised Critical Incident `#8`.
4. **Recovery & Resolution:** Dispatched recover action. Poller detected recovery, flipped status back to 🟢 `[ HEALTHY ]`, and resolved Incident `#8`, recording an exact downtime of 38 seconds in the audit trail.

---

### 4. What Is NOT Done Yet (Honest Boundaries)
* **30-B (Incident Intelligence):** We have incident recording and duration tracking, but not yet automated event correlation across multiple service logs or root-cause dependency trees.
* **30-C (Optimization & Embed Widget):** We track process memory and CPU, but have not yet built the cloud cost-waste calculator or the standalone NPM-style embeddable script.
* **Live Cloud IAM Credentials:** AWS and Cloudflare connectors exist in code, but live authenticated CloudWatch metrics require user IAM keys.

---

### 5. Summary Status
**Grade:** Solid, functional baseline slice for 30-A. The core telemetry pipeline (Poll → Detect → Record → Alert → Recover) is complete, running locally, and fully demonstrable.
