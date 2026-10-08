import { BaseMonitorTargetAdapter } from './base_monitor_target_interface';
import { GitHubPublicApiAdapter } from './github_public_api_adapter';
import { HackerNewsPublicApiAdapter } from './hacker_news_public_api_adapter';
import { OpenMeteoPublicApiAdapter } from './open_meteo_public_api_adapter';
import { LocalControlledNodeServiceAdapter } from './local_controlled_node_service_adapter';
import { AwsCloudWatchAdapter } from './aws_cloudwatch_adapter';
import { CloudflareEdgeAdapter } from './cloudflare_edge_adapter';

export function getAllTestSuiteAdapters(): BaseMonitorTargetAdapter[] {
  return [
    new GitHubPublicApiAdapter(),
    new HackerNewsPublicApiAdapter(),
    new OpenMeteoPublicApiAdapter(),
    new LocalControlledNodeServiceAdapter(),
    new AwsCloudWatchAdapter(),
    new CloudflareEdgeAdapter(),
  ];
}
