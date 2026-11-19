const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbFilePath = path.join(__dirname, '../observatory_storage.db');
const db = new DatabaseSync(dbFilePath);

const catalogPath = path.join(__dirname, '../lib/catalog/excel_metrics_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Build list of all non-API mock metrics to disable
const defaultDisabledGraphs = [];
for (const catKey of Object.keys(catalog)) {
  for (const m of catalog[catKey]) {
    if (!m.is_api_endpoint) {
      defaultDisabledGraphs.push(m.metric);
    }
  }
}

const activeMetricCategories = [
  'Cloud',
  'Containers',
  'Service',
  'Synthetic',
  'Queues',
  'Database',
  'Security',
  'Infrastructure',
];

const now = new Date().toISOString();

const roles = ['Super Admin', 'Admin', 'Normal User'];

for (const role of roles) {
  let a1_tabs = ['chat', 'mail', 'metrics', 'inspect', 'delivery'];
  if (role === 'Super Admin' || role === 'Admin') {
    a1_tabs.push('users');
  }

  let a2_elements = {
    users: role === 'Super Admin' ? ['accounts', 'permissions', 'visibility', 'websites', 'roles', 'apikeys', 'audit'] : (role === 'Admin' ? ['accounts', 'permissions', 'websites', 'roles', 'apikeys', 'audit'] : []),
    console: ['dashboard', 'incidents', 'settings'],
    mail: ['inbox', 'starred', 'snoozed', 'sent', 'drafts'],
    inspect: ['traces', 'probes', 'latency', 'audits', 'payload'],
    delivery: ['pipelines', 'rules', 'channels', 'sla', 'dlq'],
    metrics: activeMetricCategories,
    disabled_graphs: defaultDisabledGraphs,
  };

  db.prepare(`
    INSERT INTO role_visibility_config (role, a1_tabs, a2_elements, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(role) DO UPDATE SET
      a1_tabs = excluded.a1_tabs,
      a2_elements = excluded.a2_elements,
      updated_at = excluded.updated_at
  `).run(role, JSON.stringify(a1_tabs), JSON.stringify(a2_elements), now);

  console.log(`Updated role visibility for ${role}: ${activeMetricCategories.length} categories, ${defaultDisabledGraphs.length} disabled mock graphs.`);
}

console.log('Database visibility configuration synchronized successfully!');
