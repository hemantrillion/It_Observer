import { getAllTestSuiteAdapters } from '../test_suite_adapters/registry_of_test_suite_adapters';
import { updateServiceStatusQuery } from '../database/update_service_status_query';
import { insertMetricSampleQuery } from '../database/insert_metric_sample_query';
import { evaluateIncidentThresholds } from './incident_threshold_evaluator';

export async function executeAllServiceChecks() {
  const adapters = getAllTestSuiteAdapters();
  const results = await Promise.all(adapters.map((adapter) => adapter.checkHealth()));

  for (const res of results) {
    const isFailure = res.status !== 'HEALTHY';
    // Clamp response time to realistic probe bounds (max 6000ms) to avoid OS sleep/hibernation skew
    const safeResponseTimeMs = Math.max(1, Math.min(6000, res.responseTimeMs));
    res.responseTimeMs = safeResponseTimeMs;

    updateServiceStatusQuery(res.serviceId, res.status, safeResponseTimeMs, isFailure);
    insertMetricSampleQuery({
      serviceId: res.serviceId,
      responseTimeMs: safeResponseTimeMs,
      httpStatus: res.httpStatus,
      cpuPercentage: res.cpuPercentage,
      memoryMb: res.memoryMb,
      errorMessage: res.errorMessage,
    });
    evaluateIncidentThresholds(res);
  }

  return results;
}
