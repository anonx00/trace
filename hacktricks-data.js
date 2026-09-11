export const hacktricksReviewCommit='4fa4b2f11915ab60ffbd7df5c8c96579aad5b023';
export const hacktricksReviewDate='10 September 2026';

const liveRoot='https://cloud.hacktricks.wiki/en/pentesting-cloud/aws-security/aws-services/';
const sourceRoot=`https://github.com/HackTricks-wiki/hacktricks-cloud/blob/${hacktricksReviewCommit}/src/pentesting-cloud/aws-security/aws-services/`;
const page=(service,title,summary,focus,sourcePath,livePath=sourcePath.replace(/\.md$/,'.html'))=>({
  service,title,summary,focus,sourcePath,
  url:liveRoot+livePath,
  reviewedSource:sourceRoot+sourcePath,
});

const ec2Path='aws-ec2-ebs-elb-ssm-vpc-and-vpn-enum/README.md';
const ec2Live='aws-ec2-ebs-elb-ssm-vpc-and-vpn-enum/index.html';
const s3Path='aws-s3-athena-and-glacier-enum.md';
const securityPath=name=>`aws-security-and-detection-services/${name}.md`;

export const hacktricksServiceResearch=[
  page('iam','Identity, policy, and privilege-path enumeration','Maps IAM identities, credentials, policies, and the permission relationships that can create escalation or persistence paths.',['Users, roles, groups, policies, and access keys','Privilege-escalation and persistence references'],'aws-iam-enum.md'),
  page('sts','Role assumption and temporary-session paths','Covers temporary credentials and the trust and identity-policy conditions that govern role sessions.',['AssumeRole trust and identity-policy logic','GetCallerIdentity, GetAccessKeyInfo, and GetSessionToken'],'aws-sts-enum.md'),
  page('kms','Key policy, grant, and cryptographic access review','Enumerates keys, policies, grants, metadata, and custom key stores, including the evidence left by key use.',['Keys, policies, grants, and metadata across Regions','CloudTrail-visible key-management and cryptographic operations'],'aws-kms-enum.md'),
  page('organizations','Organization hierarchy and account reach','Maps the organization hierarchy and its member accounts without treating the first page of results as complete.',['Roots, organizational units, and member accounts','Paginated organization inventory'],'aws-organizations-enum.md'),
  page('cognito','User-pool and identity-pool attack surface','Reviews user pools, identity pools, application clients, identity providers, groups, and role mappings.',['Pool clients, providers, groups, and role mappings','Unauthenticated identity paths and persistence references'],'aws-cognito-enum/README.md','aws-cognito-enum/index.html'),

  page('ec2','Instance metadata, user data, and host reach','Connects instance identity, metadata, user data, images, snapshots, network exposure, and management channels.',['IMDS and instance-role credential exposure','User data, images, snapshots, and management paths'],ec2Path,ec2Live),
  page('lambda','Function code, configuration, and alternate invocation','Maps function configuration, downloadable code, versions, aliases, layers, policies, URLs, and event sources.',['Environment, code, layers, aliases, and resource policy','Function URLs, event mappings, and direct invocation'],'aws-lambda-enum.md'),
  page('ecs','Task definition and runtime credential exposure','Surfaces task-definition configuration, secret references, task overrides, and state exposed on container hosts.',['Environment and secret references in task definitions','Task overrides and on-host agent state'],'aws-ecs-enum.md'),
  page('eks','Cluster endpoint and workload identity surface','Reviews endpoint exposure, allowed CIDRs, node groups, Fargate profiles, identity-provider configuration, and updates.',['Public endpoint and allowed CIDRs','Node groups, Fargate profiles, and identity-provider configs'],'aws-eks-enum.md'),

  page('s3','Bucket access, object recovery, and brokered credentials','Covers bucket and object access, versions, logging, public paths, recovery controls, and newer credential-broker surfaces.',['Policies, ACLs, versions, access logs, and public paths','Access Grants, S3 Express, and post-exploitation references'],s3Path),
  page('rds','Database reachability, snapshots, and credential control','Connects database network exposure and engine metadata with snapshots and credential-management paths.',['Public and VPC exposure with engine metadata','Snapshot access and master-credential reset paths'],'aws-relational-database-rds-enum.md'),
  page('dynamodb','Table data, backups, exports, and injection surface','Reviews table schemas, recovery and export paths, and application query patterns that can expose DynamoDB data.',['Key schemas, PITR, backups, global tables, and exports','PartiQL and application-side NoSQL injection'],'aws-dynamodb-enum.md'),
  page('efs','Network, IAM, POSIX, and access-point boundaries','Separates network reachability from file-system policy, IAM authorization, POSIX identity, root access, and access points.',['Mount targets, security groups, and TCP 2049 reachability','File-system policies, root access, and access points'],'aws-efs-enum.md'),
  page('secretsmanager','Secret policy, versions, and retrieval surface','Maps secret metadata, resource policies, versions, retrieval permissions, and rotation or persistence paths.',['Secret metadata, resource policies, and versions','Read, rotation, and persistence paths'],'aws-secrets-manager-enum.md'),

  page('vpc','Reachability and network-control inventory','Maps VPC reachability through subnets, routes, endpoints, security groups, network ACLs, peering, and flow visibility.',['Subnets, routes, endpoints, security groups, and NACLs','Peering, flow visibility, and exposed-origin paths'],ec2Path,ec2Live),
  page('route53','Hosted-zone, record, and routing control','Enumerates hosted zones, records, health checks, traffic policies, and the permission paths that can change resolution.',['Hosted zones, records, health checks, and traffic policies','Record-change privilege paths and resolver policy validation'],'aws-route53-enum.md'),
  page('cloudfront','Origin, behavior, and edge-code exposure','Examines distribution origins and behavior configuration, including origin secrets and downloadable edge function source.',['Distribution origins and custom headers','CloudFront Function source and direct-origin checks'],'aws-cloudfront-enum.md'),
  page('waf','Web ACL coverage, rule state, and logging exposure','Reviews web ACL associations, component rule sets, sampled requests, and logging paths that may contain sensitive requests.',['ACL associations, rule groups, IP or regex sets, and samples','Logging changes and credential-bearing request-log risk'],securityPath('aws-waf-enum')),
  page('elb','Listener-rule and direct-origin boundaries','Connects listeners, rules, target groups, and origin reachability, including priority-dependent authentication bypass conditions.',['Listeners, rules, target groups, and access exposure','Direct origin access and higher-priority rule shadowing'],ec2Path,ec2Live),
  page('apigateway','Routes, authorizers, API keys, and invocation','Maps API types, stages, integrations, authorizers, API keys, and IAM-protected invocation paths.',['REST and HTTP stages, integrations, and authorizers','API-key retrieval and IAM-protected execute-api access'],'aws-api-gateway-enum.md'),
  page('appsync','GraphQL keys and IAM-authorized data access','Covers AppSync API enumeration and the bearer or IAM authorization paths that permit GraphQL operations.',['API key listing as bearer-credential exposure','IAM-signed GraphQL operations'],'aws-appsync-enum.md'),

  page('guardduty','Detector coverage and suppression or evasion controls','Reviews detectors, members, finding criteria, trusted IP lists, and ways authorized changes can weaken coverage.',['Detectors, members, criteria, and trusted IP lists','Coverage weakening and finding-specific bypass examples'],securityPath('aws-guardduty-enum')),
  page('cloudtrail','Trail coverage, selectors, and evidence impairment','Maps trails, destinations, selectors, and configuration changes that can remove or narrow retained evidence.',['Trails, event selectors, destinations, and recovered identifiers','Multi-Region logging and selector changes that create blind spots'],securityPath('aws-cloudtrail-enum')),
  page('securityhub','Finding aggregation and automation trust','Enumerates standards, findings, insights, members, and automation paths that shape triage state.',['Standards, findings, insights, members, and administrators','Automation and finding-update paths that can impair triage'],securityPath('aws-security-hub-enum')),
  page('cloudwatch','Logs, queries, alarms, and evidence access','Reviews log groups, filters, alarms, dashboards, and alternate APIs that can return log or query data.',['Log groups, filters, alarms, and dashboards','GetLogRecord and GetQueryResults alternate data paths'],securityPath('aws-cloudwatch-enum')),
  page('config','Recorder, delivery, and rule coverage','Maps configuration recorders, delivery channels, rules, and aggregators that determine retained configuration evidence.',['Recorders, delivery channels, rules, and aggregators','Configuration changes that weaken recorded evidence'],securityPath('aws-config-enum')),

  page('systemsmanager','Documents, command content, and operations data','Examines fleet-management documents, command content, operations data, and instance management paths.',['Run Command documents and command history','GetDocument and GetOpsItem content exposure'],ec2Path,ec2Live),
  page('eventbridge','Rule, schedule, and pipe payload exposure','Surfaces constant input stored in schedules, rules, and pipes alongside their targets and execution roles.',['Schedule target Input and rule constant payloads','Pipe input templates, target roles, and routing logic'],'eventbridgescheduler-enum.md'),
  page('sns','Topic policy, subscription, and message paths','Maps topics, policies, subscriptions, publishing, and persistence paths in event-driven systems.',['Topics, policies, attributes, and subscriptions','Publish, subscribe, and persistence paths'],'aws-sns-enum.md'),
  page('sqs','Queue policy, messages, and dead-letter paths','Reviews queue attributes, access policies, messages, and redrive configuration.',['Queue URLs, attributes, policies, and redrive settings','Message access and queue-policy abuse paths'],'aws-sqs-and-sns-enum.md'),
  page('stepfunctions','Workflow definition, history, and execution role','Maps state-machine definitions and identities together with execution inputs, outputs, and history.',['State-machine definitions, versions, aliases, and tags','Execution history, input or output, and service-role paths'],'aws-stepfunctions-enum.md'),

  page('codepipeline','Pipeline state and custom-action artifact access','Reviews pipeline definitions and executions, including the tested artifact credentials returned to reachable custom actions.',['Pipeline definitions, executions, webhooks, and state','PollForJobs artifact credentials for reachable custom actions'],'aws-datapipeline-codepipeline-codebuild-and-codecommit.md'),
  page('cloudformation','Template, parameter, and service-role exposure','Surfaces stacks, templates, parameters, outputs, exports, change sets, and the authority delegated to service roles.',['Stacks, templates, outputs, exports, and change sets','Secret-bearing parameters and pending change-set disclosure'],'aws-cloudformation-and-codestar-enum.md'),
  page('ecr','Registry policy and image-layer exposure','Maps repositories, policies, images, scan findings, image downloads, and persistence paths.',['Repositories, policies, images, and scan findings','Image and layer access with repository persistence paths'],'aws-ecr-enum.md'),

  page('athena','Query history and result-location exposure','Connects the Athena catalog and workgroup surface with prior query text and result objects stored in S3.',['Workgroups, databases, tables, and named queries','Query history and result objects as sensitive evidence'],s3Path),
  page('kinesis','Stream record access and iterator boundaries','Covers the stream read sequence, resource policy, and the significance of a valid shard iterator.',['GetShardIterator and GetRecords read chain','Valid iterator reuse and resource-policy exposure'],'aws-kinesis-data-streams-enum.md'),
];

export const hacktricksCoverageGaps=['identity-center','backup','fargate','opensearch'];
export const hacktricksForService=id=>hacktricksServiceResearch.find(item=>item.service===id);
export const hacktricksSearchText=id=>{const item=hacktricksForService(id);return item?`${item.title} ${item.summary} ${item.focus.join(' ')}`:'';};
