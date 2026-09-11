const sigmaCommit = '5c9b21756f4e3ba137c1773ac9ba5a8332188961';
const sigmaBase = `https://github.com/SigmaHQ/sigma/blob/${sigmaCommit}/rules/cloud/aws/cloudtrail/`;

export const detectionLibraryUrl = 'https://detections.ai/detections?q=AWS';
export const detectionReviewDate = '2026-09-11';

const sigma = (id, title, services, file, status, level, summary, signals, telemetry, tune, mitre = [], applicability = '') => ({
  id, title, services, language: 'Sigma', contributor: '@sigmaHQ', collection: 'SigmaHQ', status, level,
  basis: 'Exact upstream selection', summary, signals, telemetry, tune, mitre, applicability,
  source: `https://detections.ai/detections/${id}`,
  upstream: sigmaBase + file
});

const community = (id, title, services, language, contributor, collection, summary, signals, telemetry, tune, mitre = [], applicability = '', basis = 'Publisher summary') => ({
  id, title, services, language, contributor, collection, status: 'community', level: 'publisher-defined',
  basis, summary, signals, telemetry, tune, mitre, applicability,
  source: `https://detections.ai/detections/${id}`
});

export const communityDetections = [
  sigma(
    '019f6e57-8780-7011-b878-5f926386af9b', 'AWS IAM Backdoor Users Keys', ['iam'],
    'aws_iam_backdoor_users_keys.yml', 'test', 'medium',
    'Surfaces an access key created for an IAM user by a different identity, a persistence pattern that can survive rotation of the attacker’s original credential.',
    ['eventSource is iam.amazonaws.com', 'eventName is CreateAccessKey', 'Exclude creation where the caller ARN contains the target user name'],
    'CloudTrail IAM management events with userIdentity.arn and responseElements.accessKey.userName.',
    'Self-service key rotation and approved credential-exchange workflows are expected noise. Compare the caller and target as structured identities; the upstream string filter cannot cover every naming pattern.',
    ['T1098']
  ),
  sigma(
    '019f6e57-ebb8-71ca-9920-3c87e5ac54b5', 'AWS STS GetSessionToken Misuse', ['sts'],
    'aws_sts_getsessiontoken_misuse.yml', 'test', 'low',
    'Highlights IAM users requesting temporary STS credentials so responders can distinguish expected administration from unfamiliar credential use.',
    ['eventSource is sts.amazonaws.com', 'eventName is GetSessionToken', 'userIdentity.type is IAMUser'],
    'CloudTrail STS management events with caller, source IP, user agent, and request context.',
    'GetSessionToken is legitimate for some administrators and tools. Baseline approved users and hosts, then investigate unfamiliar combinations instead of treating every match as compromise.',
    ['T1548', 'T1550', 'T1550.001']
  ),
  sigma(
    '019f6e57-ddaa-7297-a6a8-2a317f14a1a0', 'AWS Identity Center Identity Provider Change', ['identity-center'],
    'aws_sso_idp_change.yml', 'test', 'high',
    'Detects association, disassociation, enablement, or disablement of an external identity provider—the trust boundary that decides who can authenticate through Identity Center.',
    ['eventSource is sso-directory.amazonaws.com or sso.amazonaws.com', 'eventName is AssociateDirectory, DisassociateDirectory, EnableExternalIdPConfigurationForDirectory, or DisableExternalIdPConfigurationForDirectory'],
    'CloudTrail IAM Identity Center management events in every Region where the service is administered.',
    'Validate against an approved identity-provider migration or break-glass change. Preserve the previous IdP configuration and the modifying principal before rollback.',
    ['T1556']
  ),
  sigma(
    '019f6e57-995b-7408-896a-5c5a62384855', 'AWS KMS Imported Key Material Usage', ['kms'],
    'aws_kms_import_key_material.yml', 'experimental', 'high',
    'Flags import or deletion of externally supplied KMS key material, an uncommon lifecycle action with direct availability and cryptographic-control consequences.',
    ['eventSource is kms.amazonaws.com', 'eventName is ImportKeyMaterial or DeleteImportedKeyMaterial'],
    'CloudTrail KMS management events plus the affected key ARN, key policy, grants, and import-token lifecycle.',
    'Imported material can be valid in hybrid, compliance, development, or test environments. Tune to keys with an approved external-key-material owner and maintenance window.',
    ['T1486', 'T1608.003']
  ),
  sigma(
    '019f6e57-d909-762e-8ecf-fd39bc12f3a2', 'AWS Snapshot Backup Exfiltration', ['ec2', 'backup'],
    'aws_snapshot_backup_exfiltration.yml', 'test', 'medium',
    'Detects an EBS snapshot permission change, which can expose a copy of workload data to another account without touching the running instance.',
    ['eventSource is ec2.amazonaws.com', 'eventName is ModifySnapshotAttribute'],
    'CloudTrail EC2 management events and the snapshot createVolumePermission state; join the snapshot to its source volume and workload owner.',
    'Cross-account disaster recovery and migration can be legitimate. Confirm the destination account, encryption constraints, change record, and whether a copy was made.',
    ['T1537'],
    'This is an EC2 snapshot rule. It is shown on AWS Backup because snapshots can be recovery evidence, but it does not detect deletion of an AWS Backup plan or vault.'
  ),
  sigma(
    '019f6e57-9cd8-7748-a885-969edacccfe4', 'New AWS Lambda Function URL Configuration Created', ['lambda'],
    'aws_lambda_function_url.yml', 'experimental', 'medium',
    'Surfaces creation of a Lambda Function URL so its authentication mode, resource policy, and intended owner can be reviewed before it becomes an alternate invocation path.',
    ['eventSource is lambda.amazonaws.com', 'eventName is CreateFunctionUrlConfig'],
    'CloudTrail Lambda management events plus the resulting Function URL auth type, resource policy, qualifier, and function version.',
    'Function URLs are a supported feature. Investigate unfamiliar creators and unreviewed NONE authentication; creation alone does not prove public reachability or exploitation.',
    []
  ),
  sigma(
    '019f6e57-7280-723f-844d-8fa08ab896fe', 'AWS ECS Task Definition That Queries The Credential Endpoint', ['ecs', 'fargate'],
    'aws_ecs_task_definition_cred_endpoint_query.yml', 'test', 'medium',
    'Looks for a task command that references the ECS container-credential URI, a pattern worth reviewing when it appears in a newly registered or executed task definition.',
    ['eventSource is ecs.amazonaws.com', 'eventName is DescribeTaskDefinition, RegisterTaskDefinition, or RunTask', 'requestParameters.containerDefinitions.command contains $AWS_CONTAINER_CREDENTIALS_RELATIVE_URI'],
    'CloudTrail ECS management events containing untruncated task-definition command data, plus task, image digest, task role, and execution role state.',
    'Some applications legitimately call the task metadata service. Baseline approved images and commands; investigate new revisions, shells, outbound destinations, and role-permission changes.',
    ['T1525'],
    'Applies to Fargate only when the matching task definition is used with the Fargate launch type.'
  ),
  sigma(
    '019f6e57-7979-70cc-955c-4643dc809952', 'AWS EKS Cluster Created or Deleted', ['eks'],
    'aws_eks_cluster_created_or_deleted.yml', 'test', 'low',
    'Surfaces EKS cluster lifecycle operations that can introduce a new control plane or destroy one and its immediately available evidence.',
    ['eventSource is eks.amazonaws.com', 'eventName is CreateCluster or DeleteCluster'],
    'CloudTrail EKS management events plus cluster configuration, access entries, control-plane logs, and infrastructure change records.',
    'Cluster lifecycle is normal for platform teams and ephemeral environments. Alert on production clusters, unfamiliar principals, unusual Regions, or activity outside provisioning workflows.',
    ['T1485']
  ),
  sigma(
    '019f6e57-c77a-7798-9e46-358caa8b9f15', 'AWS S3 Data Management Tampering', ['s3'],
    'aws_s3_data_management_tampering.yml', 'test', 'low',
    'Collects S3 logging, website, encryption, lifecycle, replication, restore, and object-replication changes that can alter visibility, retention, exposure, or data movement.',
    ['eventSource is s3.amazonaws.com', 'eventName is PutBucketLogging, PutBucketWebsite, PutEncryptionConfiguration, PutLifecycleConfiguration, PutReplicationConfiguration, ReplicateObject, or RestoreObject'],
    'CloudTrail S3 management events; ReplicateObject and object use require the applicable S3 data-event coverage. Preserve bucket policy, Block Public Access, versioning, and replication state.',
    'These are common administrative operations. Tune by bucket criticality, approved automation roles, expected destination accounts, and change windows; do not infer data theft from configuration alone.',
    ['T1537']
  ),
  sigma(
    '019f6e57-b081-74c4-8f83-996a1fb665f7', 'Restore Public AWS RDS Instance', ['rds'],
    'aws_rds_public_db_restore.yml', 'test', 'high',
    'Detects a database restored from snapshot with publiclyAccessible set to true, creating a high-risk network posture that still depends on routing and security-group reachability.',
    ['eventSource is rds.amazonaws.com', 'eventName is RestoreDBInstanceFromDBSnapshot', 'responseElements.publiclyAccessible is true'],
    'CloudTrail RDS management events plus the restored instance subnet group, VPC route, security groups, endpoint, engine logs, and database authentication evidence.',
    'The upstream rule lists false positives as unknown. Validate intended public workloads and test effective reachability; publiclyAccessible alone does not prove Internet access.',
    ['T1020']
  ),
  sigma(
    '019f6e57-4e7e-758e-a6ca-72a175c77ac5', 'AWS Config Disabling Channel/Recorder', ['config'],
    'aws_config_disable_recording.yml', 'test', 'high',
    'Detects deletion of the delivery channel or stoppage of the configuration recorder, both of which create configuration-history and compliance gaps.',
    ['eventSource is config.amazonaws.com', 'eventName is DeleteDeliveryChannel or StopConfigurationRecorder'],
    'CloudTrail AWS Config management events plus recorder status, delivery-channel state, last delivery, aggregator coverage, and configuration history.',
    'Planned recorder or delivery changes are legitimate. Require a change owner and verify recording and delivery resume with a fresh configuration item.',
    ['T1685.002']
  ),
  sigma(
    '019f6e57-4b41-709c-92c3-b9d423c79879', 'AWS VPC Flow Logs Deleted', ['vpc'],
    'aws_cloudtrail_vpc_flow_logs_deleted.yml', 'experimental', 'high',
    'Surfaces successful VPC Flow Log deletion, which removes future network-flow visibility but does not remove records already delivered to their destination.',
    ['eventName is DeleteFlowLogs', 'errorCode is Success or absent'],
    'CloudTrail EC2/VPC management events plus the affected flow-log IDs, resources, destination, delivery status, and retained destination records.',
    'Authorized maintenance and cleanup can delete flow logs. Confirm the resource was decommissioned or replacement coverage exists before suppressing the alert.',
    []
  ),
  sigma(
    '019f6e57-389b-751c-8f01-6cd25c69d3d7', 'AWS CloudTrail Important Change', ['cloudtrail'],
    'aws_cloudtrail_disable_logging.yml', 'test', 'medium',
    'Detects logging stoppage, trail update, or trail deletion—control-plane actions that can change the future evidence available to responders.',
    ['eventSource is cloudtrail.amazonaws.com', 'eventName is StopLogging, UpdateTrail, or DeleteTrail'],
    'Independent CloudTrail event delivery, trail status, event selectors, organization/multi-Region coverage, destination bucket, digest, KMS, and CloudWatch delivery state.',
    'Approved trail maintenance is expected. Diff the complete trail configuration and verify delivery with fresh events; a setting restored later does not fill the historical gap.',
    ['T1685.002']
  ),
  sigma(
    '019f6e57-8659-72ae-a744-748f960f5d51', 'AWS GuardDuty Important Change', ['guardduty'],
    'aws_guardduty_disruption.yml', 'test', 'high',
    'The current upstream rule specifically detects creation of a GuardDuty IP set, which can change how trusted-IP findings are generated.',
    ['eventSource is guardduty.amazonaws.com', 'eventName is CreateIPSet'],
    'CloudTrail GuardDuty management events plus the detector, IP-set URI/content, activation state, members, Regions, and protection-plan coverage.',
    'Trusted IP lists are valid for known internal scanners. Review the actual list content and owner. Despite its broad title, this selection does not cover every GuardDuty disruption action.',
    ['T1685']
  ),
  sigma(
    '019f6e57-cee7-756d-a1dd-3a6c3b8bea2a', 'AWS SecurityHub Findings Evasion', ['securityhub'],
    'aws_securityhub_finding_evasion.yml', 'stable', 'high',
    'Detects finding or insight mutation that can change workflow state, severity, visibility, or an analyst’s view of the underlying security signal.',
    ['eventSource is securityhub.amazonaws.com', 'eventName is BatchUpdateFindings, UpdateFindings, DeleteInsight, or UpdateInsight'],
    'CloudTrail Security Hub management events plus the original finding provider record, finding history, workflow/status changes, insights, and aggregation state.',
    'Administrators and ticketing automations legitimately update findings. Scope high-confidence alerting to production and distinguish workflow handling from suppression or material field changes.',
    ['T1685']
  ),
  sigma(
    '019f6e57-7584-7739-86a9-da61d816de2d', 'AWS EFS Fileshare Modified or Deleted', ['efs'],
    'aws_efs_fileshare_modified_or_deleted.yml', 'test', 'medium',
    'Despite the broad title, the current upstream selection detects deletion of an EFS file system, a destructive lifecycle action with recovery implications.',
    ['eventSource is elasticfilesystem.amazonaws.com', 'eventName is DeleteFileSystem'],
    'CloudTrail EFS management events plus file-system ID, mount targets, access points, backup/recovery state, clients, and workload ownership.',
    'The upstream rule lists false positives as unknown. Validate decommissioning records and preserve backup/recovery metadata; this selection does not detect every EFS modification.',
    []
  ),

  community(
    '01a03e4e-64b9-732c-b40a-4471ec1ba430', 'AWS Route 53 DNS Record Modification', ['route53'],
    'Cortex XDR XQL', '@DanCortex', 'Detections.ai Community',
    'Surfaces successful Route 53 resource-record changes so responders can review the actor and the exact DNS mutation.',
    ['dataset is cloud_audit_logs', 'operation_name_orig is ChangeResourceRecordSets', 'Keep successful events and extract actor and raw event context'],
    'Ingested AWS cloud audit logs containing Route 53 ChangeResourceRecordSets events and the full request change batch.',
    'DNS deployment tools generate frequent expected changes. Baseline managed zones and automation identities; prioritize new targets, routing-policy changes, and security-sensitive records.',
    ['T1584.002', 'T1484'], '', 'Public matched content'
  ),
  community(
    '019f6e52-612e-73d8-88ac-55e4ca9219fb', 'AWS Account Leaving Or Removed From The Organization', ['organizations'],
    'YARA-L', '@GoogleSecOps', 'Google SecOps',
    'Detects an AWS account leaving or being removed from its organization, which can break centrally inherited policy, logging, and delegated-administrator coverage.',
    ['An AWS account leaves the organization or is removed from it', 'Correlate the actor, management account, affected account, and organization ID'],
    'Normalized AWS CloudTrail organization-administration events in Google SecOps.',
    'Account moves can be planned during mergers, divestitures, or organization redesign. Require an approved destination and verify SCP, trail, GuardDuty, Config, and Security Hub continuity.',
    ['T1562']
  ),
  community(
    '019f6e52-6bee-747e-b20d-3ecf38aa46a0', 'AWS API Gateway Keys Accessed', ['apigateway'],
    'YARA-L', '@GoogleSecOps', 'Google SecOps',
    'Surfaces access to API Gateway API-key material, which should be investigated separately from API invocation and authorization evidence.',
    ['API Gateway key information is accessed', 'Review caller identity, source, key owner, stage usage plan, and subsequent configuration or API activity'],
    'Normalized AWS CloudTrail API Gateway management activity in Google SecOps.',
    'Key inventory and deployment automation can read key metadata. Baseline approved operators and distinguish metadata listing from retrieval of key values.',
    ['T1555']
  ),
  community(
    '0199f9fa-1860-711c-a313-2bfc64897a32', 'AWS CloudWatch Log Group Deletion', ['cloudwatch'],
    'YARA-L', '@GoogleSecOps', 'Google SecOps',
    'Detects deletion of a CloudWatch Logs log group, an action that can remove retained workload or security evidence.',
    ['A CloudWatch Logs log group is deleted', 'Review the actor, Region, log group, retention/export state, and workload lifecycle'],
    'Normalized AWS CloudTrail CloudWatch Logs management events in Google SecOps.',
    'Infrastructure teardown can delete log groups. Require a matching decommission record and confirm evidence was retained or exported before suppression.',
    ['T1562.008']
  ),
  community(
    '019f6e52-7018-756d-b18b-2f6a501d1205', 'AWS Backup Plan Deleted', ['backup'],
    'YARA-L', '@GoogleSecOps', 'Google SecOps',
    'Detects deletion of an AWS Backup plan, which changes future protection schedules but does not by itself delete existing recovery points.',
    ['An AWS Backup plan is deleted', 'Review the actor, plan, selections, replacement plan, vaults, and retained recovery points'],
    'Normalized AWS CloudTrail AWS Backup management events in Google SecOps.',
    'Planned policy replacement can delete obsolete plans. Verify equivalent coverage is active and separately check vault and recovery-point deletion activity.',
    ['T1490']
  ),
  community(
    '0199f9fa-02f5-732b-854c-caaedae45b41', 'AWS ALB Insecure SSL Policy Configuration', ['elb'],
    'YARA-L', '@GoogleSecOps', 'Google SecOps',
    'Surfaces an Application Load Balancer listener configured with an insecure TLS security policy.',
    ['An ALB listener is created or changed with a security policy classified as insecure', 'Review listener protocol, policy name, certificates, target application, and change owner'],
    'Normalized AWS CloudTrail Elastic Load Balancing management events in Google SecOps.',
    'Legacy client support can drive approved exceptions. Maintain an explicit policy allowlist and expiration date rather than suppressing all listener changes.',
    ['T1600.001'],
    'This rule is specific to Application Load Balancers; it does not cover every Elastic Load Balancing product.'
  ),
  community(
    '0199f9fa-0439-728c-b0d1-6b480bd6b289', 'AWS CloudFront Insecure SSL Policy Configuration', ['cloudfront'],
    'YARA-L', '@GoogleSecOps', 'Google SecOps',
    'Surfaces a CloudFront distribution configured with a viewer TLS policy classified as insecure.',
    ['A CloudFront distribution is created or updated with an insecure viewer TLS policy', 'Review the distribution, aliases, viewer certificate, minimum protocol version, and change owner'],
    'Normalized AWS CloudTrail CloudFront management events in Google SecOps.',
    'Legacy-client exceptions need an owned, time-bounded risk decision. Compare the observed policy to the organization’s current approved minimum.',
    ['T1600.001']
  ),
  community(
    '0199fb22-d149-737e-9840-7151375c2e8d', 'AWS ECR Container Upload by Unknown User', ['ecr'],
    'Splunk SPL', '@SplunkSecurity', 'Splunk Security Content',
    'Detects ECR image publication by an identity outside the environment’s known publisher list, helping connect an unexpected artifact to its uploader.',
    ['CloudTrail eventName is PutImage', 'Exclude environment-specific known publisher identities', 'Retain repository, tag, digest, caller, source IP, and user agent'],
    'AWS CloudTrail ECR API activity ingested through the Splunk Add-on for AWS, plus a maintained allowlist of approved publishers.',
    'The known-user list is environment-specific. CI role changes, new build systems, and emergency releases need prompt allowlist maintenance; verify the digest was actually deployed.',
    ['T1204.003']
  ),
  community(
    '019ed28c-f3be-720a-a7f6-1f401daa9480', 'AWS Secrets Manager Secret Accessed', ['secretsmanager'],
    'Microsoft Sentinel KQL', '@Mighty', 'Detections.ai Community',
    'Surfaces access to a Secrets Manager secret so the retrieval identity can be correlated with later use of the underlying credential.',
    ['Secrets Manager secret-access activity is observed', 'Review secret ARN, caller session, source, user agent, Region, and subsequent use'],
    'AWS CloudTrail Secrets Manager API activity normalized in Microsoft Sentinel.',
    'Applications legitimately retrieve secrets at high volume. Baseline workload roles and deployment patterns; prioritize human identities, new sessions, new Regions, and retrieval followed by unusual downstream access.',
    ['T1555.006']
  ),
  community(
    '019cf787-8abb-74ec-8350-94974a496fec', 'AWS SNS Subscription to External HTTP | HTTPS Endpoint', ['sns'],
    'Cortex XDR XQL', '@NullVectorX', 'Detections.ai Community',
    'Detects an SNS subscription created for an external HTTP or HTTPS endpoint, a configuration that can redirect messages outside expected boundaries.',
    ['eventSource is sns.amazonaws.com', 'eventName is Subscribe', 'request protocol is http or https and the endpoint is external'],
    'Ingested CloudTrail SNS Subscribe events with requestParameters.protocol and requestParameters.endpoint.',
    'Webhooks are a normal SNS integration. Maintain approved endpoint domains/accounts, verify subscription confirmation, and review the topic policy and message sensitivity.',
    ['T1071.001']
  ),
  community(
    '01a01014-8966-7420-9498-80a0b1b8496a', 'AWS Systems Manager Session Manager Session Started', ['systemsmanager'],
    'Cortex XDR XQL', '@lucaslapinho', 'Detections.ai Community',
    'Detects initiation of a Systems Manager Session Manager session, a privileged access event that should be joined to its target and session transcript.',
    ['Restrict to AWS Systems Manager activity', 'eventName is StartSession', 'Retain initiator, target, reason, source, time, and session identifiers'],
    'CloudTrail Systems Manager StartSession events plus configured Session Manager log destinations and target-node telemetry.',
    'Interactive sessions are legitimate for approved operators. Baseline identities, targets, hours, and ticket reasons; missing transcript delivery is a separate high-value signal.',
    ['T1059']
  ),
  community(
    '019d430c-91a6-7506-9134-15736db349b5', 'AWS WAF Bypass Success After Multiple Blocks', ['waf'],
    'YARA-L', '@itzsanjayverma', 'Detections.ai Community',
    'Correlates repeated WAF blocks from a source with a later allowed request, a useful lead for rule-evasion review that still needs application evidence.',
    ['The same source produces multiple BLOCK decisions', 'A later request from that source receives ALLOW', 'Correlate within the rule’s defined time window'],
    'AWS WAF access logs with action, source, request, rule, web ACL, and timestamp fields; application and origin logs are required to assess impact.',
    'Shared proxies, NAT, scanners, changed paths, and legitimate retries can match. Compare normalized request features and the allowing rule; ALLOW does not prove application compromise.',
    ['T1190', 'T1562']
  )
];

export const detectionsForService = serviceId => communityDetections.filter(rule => rule.services.includes(serviceId));
export const detectionSearchText = serviceId => detectionsForService(serviceId)
  .flatMap(rule => [rule.title, rule.summary, rule.language, rule.contributor, rule.collection, ...rule.signals, ...rule.mitre])
  .join(' ');
export const detectionCoverage = serviceIds => {
  const ids = new Set(serviceIds);
  return communityDetections.filter(rule => rule.services.some(serviceId => ids.has(serviceId)));
};
