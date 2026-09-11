export const lakeQuerySource = 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/lake-query-generator.html';
export const eventRecordSource = 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html';

const quoted = values => values.map(value => `'${value}'`).join(',\n    ');
const query = (eventSources, eventNames) => `SELECT
  eventTime,
  eventID,
  eventName,
  recipientAccountId,
  userIdentity.type AS identityType,
  userIdentity.arn AS actor,
  userIdentity.accessKeyId AS accessKeyId,
  sourceIPAddress,
  userAgent,
  awsRegion,
  readOnly,
  errorCode
FROM <EVENT_DATA_STORE_ID>
WHERE ${eventSources.length === 1 ? `eventSource = '${eventSources[0]}'` : `eventSource IN (\n    ${quoted(eventSources)}\n  )`}
  AND eventName IN (
    ${quoted(eventNames)}
  )
  AND eventTime >= timestamp '<START_TIME>'
  AND eventTime < timestamp '<END_TIME>'
ORDER BY eventTime DESC;`;

const management = 'Requires a CloudTrail Lake event data store that includes management events for the accounts and Regions in scope.';
const managementAndData = 'Requires a CloudTrail Lake event data store whose advanced event selectors include the relevant management and data events; data events are not implied by management-event coverage.';
const hunt = (title, eventSources, eventNames, coverage = management, note = '') => ({
  platform: 'CloudTrail Lake',
  title,
  eventSources,
  eventNames,
  coverage,
  note,
  query: query(eventSources, eventNames),
  source: lakeQuerySource
});

export const huntingQueries = {
  iam: hunt('Find credential, policy, and role-trust changes', ['iam.amazonaws.com'], ['CreateAccessKey','CreateLoginProfile','UpdateLoginProfile','UpdateAssumeRolePolicy','AttachUserPolicy','AttachRolePolicy','PutUserPolicy','PutRolePolicy','AddUserToGroup']),
  sts: hunt('Trace new temporary sessions and role chains', ['sts.amazonaws.com'], ['AssumeRole','AssumeRoleWithSAML','AssumeRoleWithWebIdentity','GetFederationToken','GetSessionToken'], management, 'Pivot from each session into downstream events using the assumed-role ARN, access key ID, source identity, and session issuer recorded in CloudTrail.'),
  'identity-center': hunt('Review permission-set and account-assignment changes', ['sso-admin.amazonaws.com','identitystore.amazonaws.com'], ['CreateAccountAssignment','DeleteAccountAssignment','CreatePermissionSet','UpdatePermissionSet','PutInlinePolicyToPermissionSet','AttachManagedPolicyToPermissionSet','CreateUser','CreateGroupMembership']),
  kms: hunt('Find key-policy, grant, deletion, and decrypt activity', ['kms.amazonaws.com'], ['PutKeyPolicy','CreateGrant','RevokeGrant','RetireGrant','DisableKey','ScheduleKeyDeletion','UpdateAlias','Decrypt']),
  ec2: hunt('Find instance-role, metadata, image, and exposure changes', ['ec2.amazonaws.com'], ['RunInstances','ModifyInstanceMetadataOptions','AssociateIamInstanceProfile','ReplaceIamInstanceProfileAssociation','ModifyInstanceAttribute','CreateImage','CreateSnapshot','ModifySnapshotAttribute','AuthorizeSecurityGroupIngress']),
  lambda: hunt('Find alternate invocation and code-persistence changes', ['lambda.amazonaws.com'], ['UpdateFunctionCode20150331v2','UpdateFunctionConfiguration20150331v2','AddPermission20150331v2','CreateFunctionUrlConfig','UpdateFunctionUrlConfig','PublishLayerVersion20181031','CreateEventSourceMapping20150331','UpdateAlias20150331']),
  ecs: hunt('Find task-definition, service, task, and ECS Exec activity', ['ecs.amazonaws.com'], ['RegisterTaskDefinition','CreateService','UpdateService','RunTask','StartTask','ExecuteCommand','UpdateCluster','PutClusterCapacityProviders']),
  eks: hunt('Find cluster-access and control-plane exposure changes', ['eks.amazonaws.com'], ['UpdateClusterConfig','CreateAccessEntry','UpdateAccessEntry','AssociateAccessPolicy','DisassociateAccessPolicy','CreateAddon','UpdateAddon','DeleteAccessEntry']),
  s3: hunt('Find public-access, replication, object access, and destructive changes', ['s3.amazonaws.com'], ['PutBucketPolicy','PutBucketAcl','DeleteBucketPublicAccessBlock','PutBucketReplication','PutBucketVersioning','GetObject','PutObject','DeleteObject'], managementAndData, 'GetObject, PutObject, and DeleteObject require S3 data-event coverage. Confirm version IDs and object keys before assessing impact.'),
  rds: hunt('Find snapshot sharing, export, restore, and database exposure changes', ['rds.amazonaws.com'], ['ModifyDBInstance','ModifyDBCluster','CreateDBSnapshot','CopyDBSnapshot','ModifyDBSnapshotAttribute','StartExportTask','RestoreDBInstanceFromDBSnapshot','DeleteDBInstance']),
  dynamodb: hunt('Find bulk reads, writes, exports, backups, and table changes', ['dynamodb.amazonaws.com'], ['Scan','Query','BatchGetItem','BatchWriteItem','ExportTableToPointInTime','UpdateTable','UpdateContinuousBackups','DeleteTable'], managementAndData, 'Scan, Query, BatchGetItem, and BatchWriteItem visibility depends on DynamoDB data-event selection.'),
  backup: hunt('Find recovery-point deletion, restore, copy, and vault-policy changes', ['backup.amazonaws.com'], ['DeleteRecoveryPoint','StartRestoreJob','StartCopyJob','PutBackupVaultAccessPolicy','DeleteBackupVaultAccessPolicy','PutBackupVaultLockConfiguration','DeleteBackupVaultLockConfiguration','UpdateRecoveryPointLifecycle']),
  vpc: hunt('Find reachability changes across routes, security groups, endpoints, and peers', ['ec2.amazonaws.com'], ['AuthorizeSecurityGroupIngress','AuthorizeSecurityGroupEgress','RevokeSecurityGroupIngress','CreateRoute','ReplaceRoute','CreateVpcPeeringConnection','AcceptVpcPeeringConnection','CreateVpcEndpoint','ModifyVpcEndpoint']),
  route53: hunt('Find DNS record, zone-association, and resolver-rule changes', ['route53.amazonaws.com','route53resolver.amazonaws.com'], ['ChangeResourceRecordSets','CreateHostedZone','DeleteHostedZone','AssociateVPCWithHostedZone','CreateVPCAssociationAuthorization','CreateResolverRule','AssociateResolverRule','UpdateResolverRule']),
  cloudfront: hunt('Find distribution, origin, edge-code, and trusted-key changes', ['cloudfront.amazonaws.com'], ['CreateDistribution','UpdateDistribution','PublishFunction','UpdateFunction','CreateKeyGroup','UpdateKeyGroup','CreateOriginAccessControl','UpdateOriginAccessControl']),
  waf: hunt('Find web-ACL coverage, rule, logging, and exception changes', ['wafv2.amazonaws.com'], ['UpdateWebACL','DeleteWebACL','AssociateWebACL','DisassociateWebACL','UpdateRuleGroup','PutLoggingConfiguration','DeleteLoggingConfiguration','UpdateIPSet']),
  guardduty: hunt('Find detector impairment and finding-workflow changes', ['guardduty.amazonaws.com'], ['UpdateDetector','DeleteDetector','StopMonitoringMembers','DisassociateMembers','DeleteMembers','CreateFilter','UpdateFilter','ArchiveFindings','DeletePublishingDestination']),
  cloudtrail: hunt('Find collection impairment and event-store changes', ['cloudtrail.amazonaws.com'], ['StopLogging','DeleteTrail','UpdateTrail','PutEventSelectors','PutInsightSelectors','UpdateEventDataStore','DeleteEventDataStore','DisableFederation','DeleteChannel']),
  securityhub: hunt('Find Security Hub disablement and finding-state tampering', ['securityhub.amazonaws.com'], ['DisableSecurityHub','BatchUpdateFindings','UpdateOrganizationConfiguration','DisassociateMembers','DeleteMembers','DeleteActionTarget','UpdateStandardsControl']),
  cloudwatch: hunt('Find log, subscription, retention, resource-policy, and alarm changes', ['logs.amazonaws.com','monitoring.amazonaws.com'], ['DeleteLogGroup','PutRetentionPolicy','DeleteRetentionPolicy','PutResourcePolicy','DeleteResourcePolicy','PutSubscriptionFilter','DeleteSubscriptionFilter','DisableAlarmActions','DeleteAlarms']),
  codepipeline: hunt('Find release-path, approval, webhook, and execution changes', ['codepipeline.amazonaws.com'], ['UpdatePipeline','PutWebhook','RegisterWebhookWithThirdParty','PutApprovalResult','StartPipelineExecution','StopPipelineExecution','DeletePipeline']),
  cloudformation: hunt('Find stack execution through service roles and mutable templates', ['cloudformation.amazonaws.com'], ['CreateStack','UpdateStack','ExecuteChangeSet','CreateChangeSet','SetStackPolicy','UpdateTerminationProtection','DeleteStack','ContinueUpdateRollback']),
  ecr: hunt('Find image replacement, deletion, repository-policy, and scanning changes', ['ecr.amazonaws.com'], ['PutImage','BatchDeleteImage','DeleteRepository','SetRepositoryPolicy','DeleteRepositoryPolicy','PutImageScanningConfiguration','PutLifecyclePolicy','StartImageScan'], management, 'Correlate image-push events and digests with ECS, EKS, or Lambda deployment evidence; a mutable tag by itself does not identify which digest ran.'),
  secretsmanager: hunt('Find secret reads, value changes, policy changes, and deletion', ['secretsmanager.amazonaws.com'], ['GetSecretValue','BatchGetSecretValue','PutSecretValue','UpdateSecret','UpdateSecretVersionStage','PutResourcePolicy','RotateSecret','DeleteSecret','ReplicateSecretToRegions']),
  organizations: hunt('Find guardrail, account, trusted-access, and delegated-admin changes', ['organizations.amazonaws.com'], ['AttachPolicy','DetachPolicy','UpdatePolicy','DeletePolicy','MoveAccount','RemoveAccountFromOrganization','LeaveOrganization','EnableAWSServiceAccess','RegisterDelegatedAdministrator','DeregisterDelegatedAdministrator']),
  cognito: hunt('Find app-client, federation, group, trigger, and role-mapping changes', ['cognito-idp.amazonaws.com','cognito-identity.amazonaws.com'], ['UpdateUserPool','CreateUserPoolClient','UpdateUserPoolClient','CreateIdentityProvider','UpdateIdentityProvider','AdminAddUserToGroup','SetUserPoolMfaConfig','SetIdentityPoolRoles','UpdateIdentityPool']),
  fargate: hunt('Review task launches and service changes for Fargate workloads', ['ecs.amazonaws.com'], ['RegisterTaskDefinition','CreateService','UpdateService','RunTask','ExecuteCommand'], management, 'ECS records also cover non-Fargate launch types. Confirm launchType or capacityProviderStrategy in the request parameters before attributing an event to Fargate.'),
  efs: hunt('Find access-point, mount-target, file-system-policy, and deletion changes', ['elasticfilesystem.amazonaws.com'], ['CreateAccessPoint','DeleteAccessPoint','CreateMountTarget','DeleteMountTarget','PutFileSystemPolicy','DeleteFileSystemPolicy','UpdateFileSystemProtection','DeleteFileSystem']),
  elb: hunt('Find listener-rule, authentication-order, certificate, and security-group changes', ['elasticloadbalancing.amazonaws.com'], ['CreateListener','ModifyListener','CreateRule','ModifyRule','SetRulePriorities','DeleteRule','SetSecurityGroups','ModifyLoadBalancerAttributes','AddListenerCertificates']),
  config: hunt('Find recorder, delivery, rule, aggregator, and remediation impairment', ['config.amazonaws.com'], ['StopConfigurationRecorder','DeleteConfigurationRecorder','DeleteDeliveryChannel','DeleteConfigRule','PutConfigRule','DeleteAggregationAuthorization','PutRemediationConfigurations','DeleteRemediationConfiguration']),
  systemsmanager: hunt('Find remote sessions, commands, automation, documents, and parameter changes', ['ssm.amazonaws.com'], ['SendCommand','StartSession','ResumeSession','TerminateSession','StartAutomationExecution','CreateDocument','UpdateDocument','ModifyDocumentPermission','PutParameter','DeleteParameter']),
  sns: hunt('Find topic-policy, subscription, delivery, and deletion changes', ['sns.amazonaws.com'], ['SetTopicAttributes','AddPermission','RemovePermission','Subscribe','ConfirmSubscription','Unsubscribe','DeleteTopic']),
  sqs: hunt('Find queue-policy, permission, purge, and deletion changes', ['sqs.amazonaws.com'], ['SetQueueAttributes','AddPermission','RemovePermission','CreateQueue','PurgeQueue','DeleteQueue','StartMessageMoveTask']),
  eventbridge: hunt('Find rule, target, event-bus policy, archive, and replay changes', ['events.amazonaws.com'], ['PutRule','PutTargets','RemoveTargets','DeleteRule','PutPermission','RemovePermission','CreateArchive','UpdateArchive','StartReplay']),
  stepfunctions: hunt('Find state-machine code, alias, version, and execution activity', ['states.amazonaws.com'], ['CreateStateMachine','UpdateStateMachine','PublishStateMachineVersion','UpdateStateMachineAlias','StartExecution','StartSyncExecution','StopExecution','DeleteStateMachine']),
  apigateway: hunt('Find API import, deployment, stage, authorizer, key, and policy changes', ['apigateway.amazonaws.com'], ['CreateRestApi','PutRestApi','CreateDeployment','UpdateStage','CreateAuthorizer','UpdateAuthorizer','CreateApiKey','CreateUsagePlanKey','UpdateRestApi']),
  appsync: hunt('Find alternate authorization, API-key, resolver, schema, and data-source changes', ['appsync.amazonaws.com'], ['UpdateGraphqlApi','CreateApiKey','UpdateApiKey','StartSchemaCreation','CreateResolver','UpdateResolver','CreateDataSource','UpdateDataSource']),
  athena: hunt('Find query execution, result-location, workgroup, and catalog changes', ['athena.amazonaws.com'], ['StartQueryExecution','GetQueryResults','CreateNamedQuery','CreateWorkGroup','UpdateWorkGroup','CreateDataCatalog','UpdateDataCatalog','StopQueryExecution'], management, 'CloudTrail omits the query string from StartQueryExecution. Use the recorded queryExecutionId with authorized Athena query-history access when the SQL text is required.'),
  kinesis: hunt('Find stream sharing, reads, writes, encryption, and retention changes', ['kinesis.amazonaws.com'], ['PutResourcePolicy','DeleteResourcePolicy','PutRecord','PutRecords','GetRecords','SubscribeToShard','StopStreamEncryption','DecreaseStreamRetentionPeriod','DeleteStream'], managementAndData, 'Confirm the event selector and service support for the data operations you expect. A resource policy and the external principal identity policy both participate in cross-account access.'),
  opensearch: hunt('Find domain-policy, network, authentication, and audit-log changes', ['es.amazonaws.com'], ['CreateDomain','UpdateDomainConfig','DeleteDomain','AuthorizeVpcEndpointAccess','RevokeVpcEndpointAccess','CreateOutboundConnection','AcceptInboundConnection','UpdatePackage','AssociatePackage']),
};

export const queryFor = id => huntingQueries[id];
