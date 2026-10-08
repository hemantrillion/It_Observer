import { getAllTestSuiteAdapters } from '../test_suite_adapters/registry_of_test_suite_adapters';
import { updateServiceStatusQuery } from '../database/update_service_status_query';
import { insertMetricSampleQuery } from '../database/insert_metric_sample_query';
import { evaluateIncidentThresholds } from './incident_threshold_evaluator';

export async function executeAllServiceChecks() {
  const adapters = getAllTestSuiteAdapters();
  const results = await Promise.all(adapters.map((adapter) => adapter.checkHealth()));

  for (const res of results) {
    const isFailure = res.status !== 'HEALTHY';
    updateServiceStatusQuery(res.serviceId, res.status, res.responseTimeMs, isFailure);
    insertMetricSampleQuery({
      serviceId: res.serviceId,
      responseTimeMs: res.responseTimeMs,
      httpStatus: res.httpStatus,
      cpuPercentage: res.cpuPercentage,
      memoryMb: res.memoryMb,
      errorMessage: res.errorMessage,
    });
    evaluateIncidentThresholds(res);
  }

  return results;
}
