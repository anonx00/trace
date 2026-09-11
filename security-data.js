
const securityPillar = 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html';
const incidentResponse = 'https://docs.aws.amazon.com/security-ir/latest/userguide/incident-response.html';

export const securityProfiles = {
  iam: {
    boundary: 'Controls who can authenticate, which actions they can perform, and which resources those actions can reach.',
    threats: ['Stolen access keys or single-factor console credentials used outside their owner’s baseline', 'CreateAccessKey, CreateLoginProfile, AddUserToGroup, policy attachment, inline-policy, or policy-version actions that widen an existing identity', 'UpdateAssumeRolePolicy or other trust changes that admit an external principal or create durable role access', 'iam:PassRole combined with a workload-creation path that transfers a more privileged service role to attacker-controlled code'],
    evidence: ['CloudTrail sign-in, credential, policy, trust, group-membership, and PassRole-dependent API activity', 'Credential reports, access-key age and last-used data, console-login MFA context, and identity ownership', 'IAM Access Analyzer findings, policy and trust versions, permission boundaries, organization controls, and the effective policy path'],
    defenses: ['Prefer federation and temporary credentials', 'Require phishing-resistant MFA for privileged access', 'Continuously reduce unused permissions and credentials'],
    responder: 'Which principal and session made the request, and which policy statement allowed it?',
    source: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html'
  },
  sts: {
    boundary: 'Issues temporary role sessions that often carry authority across workloads, accounts, and incident boundaries.',
    threats: ['Overly permissive role trust', 'Confused-deputy paths in cross-account access', 'Unexpected role chaining or session reuse'],
    evidence: ['CloudTrail AssumeRole events', 'Session issuer, source identity, tags, and source IP', 'Role-session duration and downstream API activity'],
    defenses: ['Constrain trust policies with context conditions', 'Use ExternalId where third-party delegation requires it', 'Preserve source identity and use short session durations'],
    responder: 'Where did this role session originate, and what actions did it perform before expiration?',
    source: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html'
  },
  'identity-center': {
    boundary: 'Connects workforce identities and permission sets to AWS accounts, making it a central privilege distribution point.',
    threats: ['Compromised identity-provider or workforce session', 'Broad permission-set assignments', 'Unauthorized assignment or delegated-administration changes'],
    evidence: ['Identity-provider sign-in and MFA logs', 'CloudTrail IAM Identity Center administration events', 'Account assignments and permission-set changes'],
    defenses: ['Enforce strong MFA and rapid user lifecycle controls', 'Keep permission sets narrow and task based', 'Protect delegated administration and emergency access'],
    responder: 'Was the user session legitimate, and which account assignments expanded its reach?',
    source: 'https://docs.aws.amazon.com/singlesignon/latest/userguide/security-best-practices.html'
  },
  cognito: {
    boundary: 'Manages application users, federation, tokens, app clients, user-pool triggers, and identity-pool mappings to AWS roles.',
    threats: ['Unauthorized user, group, app-client, or identity-provider change', 'Weak token, redirect, or federation configuration', 'Identity-pool role mapping grants unintended AWS access'],
    evidence: ['CloudTrail-supported Cognito administration and authentication events', 'User-pool risk, sign-in, and application logs where configured', 'App-client, domain, group, trigger, provider, and identity-pool configuration'],
    defenses: ['Require strong sign-in controls and protect recovery paths', 'Restrict app clients, callback URLs, federation, and privileged groups', 'Alert on user-pool, identity-provider, trigger, and role-mapping changes'],
    responder: 'Which user or app client authenticated, which token or identity pool was used, and what configuration changed?',
    source: 'https://docs.aws.amazon.com/cognito/latest/developerguide/security.html'
  },
  organizations: {
    boundary: 'Defines account hierarchy and organization-wide guardrails, including service control and resource control policies.',
    threats: ['Guardrails weakened or detached', 'Accounts moved, invited, or removed unexpectedly', 'Trusted access or delegated administrators changed'],
    evidence: ['Organization-wide CloudTrail events', 'SCP, RCP, account, and organizational-unit changes', 'Trusted-access and delegated-admin inventory'],
    defenses: ['Protect the management account and minimize its use', 'Test and version organization policies', 'Centralize an organization trail in a security account'],
    responder: 'Which organization-level change altered the effective permissions of affected accounts?',
    source: 'https://docs.aws.amazon.com/organizations/latest/userguide/orgs_security.html'
  },
  kms: {
    boundary: 'Controls cryptographic use through key policies, grants, aliases, and integrated-service encryption contexts.',
    threats: ['Permissive key policy or unintended grant', 'Unauthorized decrypt activity', 'Key disablement, deletion scheduling, or alias changes'],
    evidence: ['CloudTrail KMS management and cryptographic events', 'Key policies, grants, aliases, and rotation state', 'Encryption context and calling-service details'],
    defenses: ['Separate key administration from key use', 'Apply least privilege and encryption-context conditions', 'Alert on policy, grant, disable, and deletion changes'],
    responder: 'Who used or changed the key, through which service, and with what encryption context?',
    source: 'https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html'
  },

  ec2: {
    boundary: 'Combines operating-system exposure, network reachability, instance metadata, images, and instance-role credentials.',
    threats: ['Internet-exposed service or vulnerable software reached through a permissive security-group or routing path', 'Instance-role credential access through IMDS after server-side request forgery or host execution', 'EBS snapshot permission changed so another account can create an offline copy of workload data', 'User data, images, volumes, Systems Manager commands, or management agents used for execution or persistence'],
    evidence: ['GuardDuty findings, VPC Flow Logs, load-balancer records, and the security-group and route state at event time', 'CloudTrail instance, image, snapshot, volume, security-group, user-data, and Systems Manager changes', 'IMDS configuration plus host, EDR, SSM Agent, process, filesystem, and application logs', 'For IMDS specifically, VPC Flow Logs exclude traffic to and from 169.254.169.254; use host, process, application, proxy, or runtime telemetry for the fetch, then CloudTrail and GuardDuty to scope later use of the issued credentials'],
    defenses: ['Minimize inbound and outbound network paths', 'Require IMDSv2 and narrow the instance role', 'Patch, harden, inventory, and monitor the operating system'],
    responder: 'What reached the instance, what changed on the host, and what could its role access?',
    source: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security.html'
  },
  lambda: {
    boundary: 'Runs event-driven code with an execution role, resource policy, triggers, layers, environment variables, and optional network access.',
    threats: ['Public or weakly restricted invocation path', 'iam:PassRole with CreateFunction and InvokeFunction used to run code under a more privileged execution role', 'UpdateFunctionCode, layer, environment, version, alias, trigger, or edge association changed outside the deployment path', 'Runtime code execution exposes temporary execution-role credentials and sensitive environment or log data'],
    evidence: ['CloudTrail function, version, permission, and CloudFront association changes', 'CloudWatch invocation, error, and application logs', 'GuardDuty Lambda Protection findings where enabled'],
    defenses: ['Restrict function URLs and resource policies', 'Use a minimal execution role and external secret store', 'Use code signing and protect published versions, triggers, and edge associations'],
    responder: 'Which trigger or CloudFront behavior invoked the function, which version ran, and what data and permissions did it receive?',
    source: 'https://docs.aws.amazon.com/lambda/latest/dg/lambda-security.html'
  },
  ecs: {
    boundary: 'Connects container images, task definitions, task and execution roles, clusters, networking, and ECS Exec.',
    threats: ['Malicious or replaced container image', 'Task-definition commands, environment settings, secrets, mounts, or logging options changed to expose workload data', 'Container-credential endpoint access or broad task-role credentials used beyond the intended task behavior', 'RunTask, service update, or ECS Exec used to place or control an unexpected workload'],
    evidence: ['CloudTrail ECS and ECR activity, including task registration, run, service update, and execute-command events', 'Complete task-definition revisions, image digests, task and execution roles, secrets references, network mode, mounts, and overrides', 'Container and credential-endpoint access telemetry, runtime findings, outbound connections, and ECS Exec session records'],
    defenses: ['Separate and minimize task and execution roles', 'Deploy immutable image digests and scan images', 'Log and tightly restrict ECS Exec'],
    responder: 'Which task revision and image ran, and what actions came from its task role?',
    source: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/security.html'
  },
  eks: {
    boundary: 'Bridges Kubernetes authorization, AWS identity, cluster endpoints, workloads, node roles, and pod credentials.',
    threats: ['Exposed cluster API or excessive Kubernetes RBAC', 'Privileged or malicious workload', 'Abuse of node, pod, or service-account credentials'],
    evidence: ['EKS control-plane and Kubernetes audit logs', 'CloudTrail EKS and IAM activity', 'GuardDuty Runtime Monitoring and container telemetry'],
    defenses: ['Restrict cluster endpoint access', 'Use least-privilege RBAC and pod-specific AWS identities', 'Apply admission, network, image, and runtime controls'],
    responder: 'Which Kubernetes identity created the workload, and which AWS identity did that workload assume?',
    source: 'https://docs.aws.amazon.com/eks/latest/best-practices/security.html'
  },
  fargate: {
    boundary: 'Provides managed container compute while leaving image, task role, task definition, logging, and network policy with the customer.',
    threats: ['Vulnerable or untrusted image', 'Public network path or permissive security group', 'Overly broad task role or exposed application secret'],
    evidence: ['Task definitions, revisions, and image digests', 'CloudTrail, VPC Flow Logs, and application logs', 'Runtime and image-scan findings where available'],
    defenses: ['Use minimal images and immutable digests', 'Isolate task networking and control egress', 'Scope each task role and retrieve secrets at runtime'],
    responder: 'Which image and task definition ran, and where could its network and IAM identities reach?',
    source: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-security-considerations.html'
  },

  s3: {
    boundary: 'Protects buckets, objects, access points, versions, policies, replication paths, and encryption keys.',
    threats: ['Bucket policy, ACL, access point, or Public Access Block change creates public or unintended cross-account access', 'Credential-based object discovery, bulk reads, streaming copies, or result-bucket collection', 'Replication configuration and service-role permissions copy eligible object versions to an unapproved destination account', 'Destructive deletion, overwrite, lifecycle, retention, replication, or encryption activity impairs primary data and recovery'],
    evidence: ['CloudTrail S3 data and management events with selector coverage recorded', 'S3 server access logs, GuardDuty S3 findings, object metadata, versions, replication status, inventories, and destination evidence', 'Access Analyzer, bucket and access-point policies, ACL and ownership state, Public Access Block, replication role and rules, lifecycle, retention, and KMS configuration'],
    defenses: ['Keep Block Public Access and Object Ownership enabled', 'Use least-privilege policies, versioning, and Object Lock where required', 'Encrypt with controlled KMS keys and protect logging destinations'],
    responder: 'Which principal accessed which key and version, through which policy and network path?',
    source: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html'
  },
  rds: {
    boundary: 'Combines database authentication, network placement, parameter configuration, snapshots, logs, backups, and encryption.',
    threats: ['Public or broadly reachable database endpoint', 'Stolen database credentials or excessive database privileges', 'Snapshot sharing, export, or destructive administration'],
    evidence: ['Database audit and engine logs', 'CloudTrail RDS changes and RDS events', 'GuardDuty RDS Protection findings where supported'],
    defenses: ['Use private subnets and narrow security groups', 'Rotate secrets and consider IAM database authentication', 'Encrypt, back up, audit, and test recovery'],
    responder: 'Was access made through the database plane or AWS control plane, and what data changed?',
    source: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html'
  },
  dynamodb: {
    boundary: 'Protects tables, indexes, streams, exports, backups, encryption settings, and item-level API access through IAM.',
    threats: ['Broad data-plane or data-source role permissions', 'Bulk read, export, update, or deletion activity', 'Tampered application resolver returns records outside the caller scope'],
    evidence: ['CloudTrail management and enabled data events', 'Table, export, backup, and point-in-time recovery state', 'AppSync resolver logs plus capacity, error, and access-pattern metrics'],
    defenses: ['Scope IAM by action, table, condition, and attribute where practical', 'Test resolver authorization and object ownership at the API boundary', 'Use KMS controls, point-in-time recovery, and unusual-access monitoring'],
    responder: 'Which identity or resolver accessed which table operation, and did the returned records exceed that caller’s scope?',
    source: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/security.html'
  },
  efs: {
    boundary: 'Exposes shared file systems through mount targets, security groups, access points, IAM authorization, and POSIX permissions.',
    threats: ['Overly reachable mount target', 'Weak access-point or POSIX isolation', 'Unencrypted or unauthorized mount activity'],
    evidence: ['CloudTrail EFS management events', 'VPC Flow Logs for mount targets', 'Host mount records, file audit data, and backup state'],
    defenses: ['Restrict mount-target security groups', 'Use access points, IAM authorization, and least POSIX privilege', 'Require encryption in transit and maintain recoverable backups'],
    responder: 'Which client mounted the file system, through which access point, and what files changed?',
    source: 'https://docs.aws.amazon.com/efs/latest/ug/security-considerations.html'
  },
  backup: {
    boundary: 'Controls backup plans, vaults, recovery points, copy paths, restore permissions, and retention guarantees.',
    threats: ['Recovery-point or vault deletion', 'Retention, lifecycle, or backup-plan weakening', 'Unauthorized restore or cross-account copy'],
    evidence: ['CloudTrail AWS Backup events', 'Backup Audit Manager and job status', 'Vault policies, locks, recovery points, and restore history'],
    defenses: ['Use Vault Lock and isolated recovery accounts', 'Separate backup administration from workload administration', 'Continuously test restore procedures and alert on failed jobs'],
    responder: 'Which recovery points remain trustworthy, immutable, and restorable after the event?',
    source: 'https://docs.aws.amazon.com/aws-backup/latest/devguide/security.html'
  },
  secretsmanager: {
    boundary: 'Stores versioned secrets protected by IAM, resource policies, KMS keys, rotation functions, and service integrations.',
    threats: ['Unauthorized GetSecretValue access', 'Public or unintended cross-account resource policy', 'Rotation, version-stage, or KMS configuration tampering'],
    evidence: ['CloudTrail secret management and retrieval events', 'Resource policy, KMS key, rotation, and version-stage state', 'Workload access patterns without logging secret values'],
    defenses: ['Scope secret reads to workload identities', 'Block broad resource policies and control the KMS key', 'Rotate automatically and remove secrets from code and logs'],
    responder: 'Which secret version was retrieved, by whom, and where could the exposed credential be used?',
    source: 'https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html'
  },

  vpc: {
    boundary: 'Defines network reachability through subnets, routing, security groups, network ACLs, endpoints, peering, and egress.',
    threats: ['Security-group ingress opened to 0.0.0.0/0 or ::/0 on a management or data-service port', 'Unexpected egress, route, endpoint, network ACL, peering, or transit change creates a new reachability path', 'Traffic mirroring or flow-log configuration changed to capture traffic or impair network evidence', 'Lateral movement through a network path that application or identity controls incorrectly treat as trusted'],
    evidence: ['VPC Flow Logs and traffic-mirroring data', 'CloudTrail EC2 networking changes', 'Reachability Analyzer and current route/security-group state'],
    defenses: ['Segment workloads and minimize allowed paths', 'Prefer private service endpoints and controlled egress', 'Continuously detect drift in routes and security groups'],
    responder: 'Was the path reachable at event time, and which configuration made that traffic possible?',
    source: 'https://docs.aws.amazon.com/vpc/latest/userguide/security.html'
  },
  route53: {
    boundary: 'Controls public and private DNS records, hosted zones, health checks, resolver endpoints, rules, and query visibility.',
    threats: ['Record or hosted-zone hijack', 'Malicious resolver rule or forwarding path', 'DNS used for discovery, tunneling, or command traffic'],
    evidence: ['CloudTrail Route 53 configuration changes', 'Route 53 Resolver query logs', 'GuardDuty DNS findings and registrar change records'],
    defenses: ['Restrict DNS administration and protect registrar workflows', 'Enable query logging and monitor high-risk record changes', 'Use DNSSEC where it fits the hosted-zone design'],
    responder: 'Which resolver answered the query, and did the record or forwarding path change before the event?',
    source: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/security.html'
  },
  cloudfront: {
    boundary: 'Mediates edge requests through distributions, behaviors, origins, cache policy, TLS, signed access, and logging.',
    threats: ['Direct origin bypass', 'CloudFront Function or Lambda@Edge code and association tampering', 'Distribution, behavior, key-group, or origin change'],
    evidence: ['CloudFront standard or real-time access logs', 'CloudTrail distribution, function, publish, and association changes', 'AWS WAF, origin, Lambda@Edge, and application logs'],
    defenses: ['Use Origin Access Control and restrict origin reachability', 'Review and test edge code before publication', 'Protect distribution and function changes and retain edge logs centrally'],
    responder: 'Which behavior and edge-function version handled the request, what changed in the response, and was the origin independently reachable?',
    source: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/security.html'
  },
  waf: {
    boundary: 'Evaluates web requests using managed and custom rules, rate controls, labels, scope-down statements, and logging.',
    threats: ['Rule, association, or logging disabled', 'Application path not covered by the intended web ACL', 'Resource exhaustion or evasion around incomplete rules'],
    evidence: ['AWS WAF full logs and sampled requests', 'CloudTrail web-ACL and rule changes', 'Rule labels, action counts, rate metrics, and origin logs'],
    defenses: ['Combine managed, application-specific, and rate-based rules', 'Test coverage against real application routes', 'Protect changes and send complete logs to a monitored destination'],
    responder: 'Which rule evaluated the request, what action occurred, and did the request still reach the origin?',
    source: 'https://docs.aws.amazon.com/waf/latest/developerguide/security.html'
  },
  elb: {
    boundary: 'Exposes listeners and target groups through security groups, routing rules, TLS policies, certificates, and access logs.',
    threats: ['Unexpected public listener or permissive security group', 'Higher-priority rule bypasses an authenticate action', 'Fixed response, target, certificate, or forwarding action tampering'],
    evidence: ['Load balancer access and connection logs', 'CloudTrail listener and rule configuration changes', 'Rule priorities and actions, Cognito state, VPC flows, target health, and WAF logs'],
    defenses: ['Use current TLS policies and controlled certificates', 'Continuously diff listener priorities, conditions, and ordered actions', 'Restrict load-balancer and target changes and attach WAF where applicable'],
    responder: 'Which rule won priority evaluation, did its ordered actions authenticate the request, and which target or fixed response followed?',
    source: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/security.html'
  },
  apigateway: {
    boundary: 'Publishes APIs through routes, stages, authorizers, resource policies, integrations, throttles, and request logs.',
    threats: ['Unauthenticated or mis-authorized route', 'Excessive requests or unsafe input reaching an integration', 'Stage, authorizer, resource-policy, or deployment tampering'],
    evidence: ['API Gateway access and execution logs', 'CloudTrail configuration and deployment activity', 'Authorizer, integration, WAF, latency, and error telemetry'],
    defenses: ['Require route-level authentication and authorization', 'Validate requests and apply throttles, quotas, and WAF', 'Use private endpoints or restrictive resource policies where possible'],
    responder: 'Which route, stage, identity, and integration handled the request?',
    source: 'https://docs.aws.amazon.com/apigateway/latest/developerguide/security.html'
  },
  appsync: {
    boundary: 'Exposes GraphQL operations through authorization modes, schema directives, resolvers, data sources, API keys, and optional real-time endpoints.',
    threats: ['Unauthorized API key or additional authorization mode', 'Schema directive or resolver change weakens object-level access', 'Data-source role or logging configuration grants excessive reach or hides activity'],
    evidence: ['CloudTrail AppSync configuration and API-key activity', 'CloudWatch request, field, resolver, and error logs where enabled', 'GraphQL schema, authorization providers, resolvers, functions, data sources, and role state'],
    defenses: ['Use the strongest suitable authorization mode and short API-key lifetimes', 'Enforce authorization in schema and resolver logic and test object ownership', 'Protect schema, resolver, key, data-source, and logging changes'],
    responder: 'Which authorization mode admitted the operation, which resolver ran, and which data source and identity context did it use?',
    source: 'https://docs.aws.amazon.com/appsync/latest/devguide/security.html'
  },

  guardduty: {
    boundary: 'Analyzes AWS telemetry and runtime signals to produce contextual findings across accounts, Regions, identities, data, and workloads.',
    threats: ['Detector or protection plan disabled', 'Suppression or coverage gaps conceal activity', 'Findings routed to an unmonitored destination'],
    evidence: ['GuardDuty findings and finding history', 'CloudTrail GuardDuty administration events', 'Detector, member, Region, and protection-plan coverage'],
    defenses: ['Use organization delegated administration', 'Enable required plans in every relevant Region', 'Route findings through EventBridge into tested response workflows'],
    responder: 'Which underlying events support the finding, and what related activity occurred before and after it?',
    source: 'https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_data-sources.html'
  },
  cloudtrail: {
    boundary: 'Records control-plane and selected data-plane activity, preserving identity, request, response, source, time, and resource context.',
    threats: ['StopLogging or DeleteTrail removes expected collection', 'UpdateTrail or PutEventSelectors redirects delivery or removes required management, data, or network activity coverage', 'Delivery bucket, resource policy, KMS key, CloudWatch integration, or log-file validation weakened', 'A principal moves activity to an unmonitored account or Region and exploits assumptions about trail scope'],
    evidence: ['CloudTrail event history and trail status', 'Organization trail, event selectors, channels, and integrations', 'S3 delivery, digest validation, and CloudWatch delivery state'],
    defenses: ['Use an organization-wide multi-Region trail', 'Centralize logs in an immutable security account', 'Enable required data events and alert on trail changes'],
    responder: 'What was the earliest suspicious API event, and which identity context links subsequent actions?',
    source: 'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/best-practices-security.html'
  },
  securityhub: {
    boundary: 'Aggregates findings and control status from AWS services and partners into a multi-account security posture view.',
    threats: ['Controls, standards, or integrations disabled', 'Findings suppressed or workflow status altered', 'Regional aggregation or account coverage gaps'],
    evidence: ['Security Hub findings and finding history', 'CloudTrail Security Hub administration events', 'Standards, controls, integrations, members, and aggregation state'],
    defenses: ['Use delegated administration and central aggregation', 'Continuously monitor control and integration state', 'Route high-confidence findings into owned response procedures'],
    responder: 'Which source produced the finding, what raw evidence exists, and has its workflow state been altered?',
    source: 'https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-security.html'
  },
  cloudwatch: {
    boundary: 'Holds operational and security logs, metrics, alarms, dashboards, subscriptions, retention, and delivery paths.',
    threats: ['Log group, alarm, or subscription deletion', 'Retention shortened or delivery redirected', 'Sensitive data exposure or visibility loss in application logging'],
    evidence: ['CloudTrail CloudWatch and Logs configuration events', 'Log-group retention, KMS, resource policy, and subscription state', 'Alarm history, delivery errors, ingestion gaps, and metric anomalies'],
    defenses: ['Centralize security logs with controlled access', 'Encrypt and retain evidence for the required period', 'Alert on destructive configuration changes and delivery failures'],
    responder: 'Is the apparent silence real, or did collection, routing, retention, or access change?',
    source: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/security.html'
  },
  config: {
    boundary: 'Records resource configuration and evaluates drift against rules, conformance packs, aggregators, and delivery settings.',
    threats: ['Recorder or delivery channel stopped', 'Rules removed or scoped away from sensitive resources', 'Aggregator or remediation configuration tampered with'],
    evidence: ['Configuration history and compliance timeline', 'CloudTrail AWS Config administration events', 'Recorder, delivery, rule, pack, aggregator, and remediation state'],
    defenses: ['Use organization-wide recording and aggregation', 'Protect recorder roles and delivery destinations', 'Alert on recorder gaps and high-risk configuration drift'],
    responder: 'What configuration changed before the incident, and how long did the noncompliant state exist?',
    source: 'https://docs.aws.amazon.com/config/latest/developerguide/security.html'
  },

  systemsmanager: {
    boundary: 'Provides privileged fleet access through Session Manager, Run Command, Automation, documents, inventory, patching, and managed-node roles.',
    threats: ['SendCommand, StartSession, or Automation execution turns cloud API permission into operating-system or workflow actions', 'Document content, version, sharing, default version, association, or target selectors changed outside the approved path', 'Broad tag targeting or concurrency sends one action across an unexpectedly large fleet', 'Managed-node role, operator role, output destination, or transcript settings allow excessive reach or suppress useful evidence'],
    evidence: ['CloudTrail Systems Manager activity with caller, command or execution ID, document, version, targets, parameters where recorded, and Region', 'Session, command, invocation, automation, association, and document history plus SSM Agent and endpoint process telemetry', 'CloudWatch and S3 output configuration and delivery status, session transcripts, managed-node inventory, registration, tags, and instance profile'],
    defenses: ['Scope operators, documents, targets, and node roles', 'Log sessions and commands to protected destinations', 'Use approved documents, change controls, and private endpoints'],
    responder: 'Who initiated the action, which document and targets were used, and where is the command output?',
    source: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/security.html'
  },
  eventbridge: {
    boundary: 'Routes events between producers and targets using buses, rules, patterns, schedules, archives, replays, resource policies, and roles.',
    threats: ['Rule or target changed to suppress or redirect events', 'Untrusted PutEvents producer injects events', 'Replay or scheduler used outside intended workflow'],
    evidence: ['CloudTrail EventBridge configuration and event APIs', 'Rule, target, role, bus-policy, archive, and replay state', 'Invocation, failure, retry, and dead-letter metrics'],
    defenses: ['Restrict event producers and target-management permissions', 'Use narrow target roles and dead-letter queues', 'Monitor rule drift and failed delivery'],
    responder: 'Was the event authentic, which rule matched it, and did every intended target receive it?',
    source: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-security.html'
  },
  sns: {
    boundary: 'Fans messages to subscriptions through topic policies, delivery protocols, filtering, retries, encryption, and dead-letter handling.',
    threats: ['Broad topic policy permits unauthorized publishing', 'Subscription added, replaced, or redirected', 'Sensitive content sent through an unsuitable endpoint'],
    evidence: ['CloudTrail topic and subscription changes', 'Delivery-status logs and failure metrics', 'Topic policy, subscriptions, filters, KMS key, and DLQ state'],
    defenses: ['Use least-privilege topic policies', 'Encrypt topics and control subscription confirmation', 'Monitor subscription changes and delivery failures'],
    responder: 'Who published the message, which subscriptions received it, and were any endpoints changed?',
    source: 'https://docs.aws.amazon.com/sns/latest/dg/sns-security.html'
  },
  sqs: {
    boundary: 'Buffers messages through queue policies, producers, consumers, visibility timeouts, retention, encryption, and dead-letter queues.',
    threats: ['Public or unintended queue access', 'Messages read, deleted, purged, or poisoned', 'Dead-letter redrive or retention changed'],
    evidence: ['CloudTrail SQS control and enabled data events', 'Queue depth, age, receive, delete, and DLQ metrics', 'Queue policy, KMS key, redrive, and retention state'],
    defenses: ['Restrict queue policies and separate producer/consumer roles', 'Encrypt messages and use private service endpoints', 'Protect purge and redrive operations and monitor DLQs'],
    responder: 'Which producer introduced the message, which consumer received it, and did processing or deletion deviate?',
    source: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-security.html'
  },
  stepfunctions: {
    boundary: 'Orchestrates state transitions using definitions, versions, aliases, execution roles, service integrations, inputs, outputs, and history.',
    threats: ['State-machine definition or execution role modified', 'Sensitive values exposed in execution data or logs', 'Unauthorized or excessive execution'],
    evidence: ['CloudTrail state-machine and execution activity', 'Execution history and CloudWatch Logs', 'Definition versions, aliases, role, encryption, and logging state'],
    defenses: ['Minimize the execution role for each integration', 'Encrypt and avoid placing secrets in execution data', 'Version definitions and protect deployment changes'],
    responder: 'Which definition version ran, what branch executed, and what downstream actions used its role?',
    source: 'https://docs.aws.amazon.com/step-functions/latest/dg/security.html'
  },

  codepipeline: {
    boundary: 'Moves source and artifacts through build, test, approval, and deployment stages using service roles and external integrations.',
    threats: ['Source, approval, or pipeline configuration compromised', 'Artifact replaced or read by an unintended principal', 'Overpowered pipeline service role'],
    evidence: ['CloudTrail pipeline and stage activity', 'Execution history, approvals, source revisions, and artifact records', 'Connected build, repository, KMS, and deployment logs'],
    defenses: ['Protect source branches and require meaningful approvals', 'Use least-privilege roles per delivery action', 'Encrypt artifacts and bind deployments to reviewed revisions'],
    responder: 'Which source revision and actor initiated the release, and exactly what artifact reached production?',
    source: 'https://docs.aws.amazon.com/codepipeline/latest/userguide/security.html'
  },
  cloudformation: {
    boundary: 'Creates infrastructure from templates and change sets using caller or service-role permissions, stack policies, hooks, and resource providers.',
    threats: ['A mutable local or S3-hosted template is changed before CreateStack, UpdateStack, or change-set execution', 'iam:PassRole and stack-operation permissions transfer an overprivileged CloudFormation service role to the submitted template', 'Nested stacks, macros, transforms, custom resources, or hooks expand execution beyond the apparent top-level template', 'Out-of-band drift, rollback manipulation, termination-protection change, or destructive stack action impairs recovery', 'Literal credentials in templates, or sensitive values placed in Metadata, Outputs, resource metadata, or primary-identifier properties, bypass or outlive NoEcho masking and can expose a reusable secret'],
    evidence: ['Stack events, change sets, template versions, and drift results', 'CloudTrail CloudFormation and downstream resource activity', 'Service role, termination protection, stack policy, and hook state', 'Exact template revision, parameter declarations and NoEcho flags, Metadata, Outputs, resource metadata, dynamic references, and every path able to read source or stack descriptions'],
    defenses: ['Review change sets and control template provenance', 'Use a scoped service role and policy validation', 'Apply stack policies, termination protection, hooks, and drift detection', 'Keep secrets out of templates, Metadata, Outputs, resource metadata, and primary identifiers; use Secrets Manager or Parameter Store secure-string dynamic references where supported'],
    responder: 'Which template and role produced the resource change, and was it part of an approved stack operation?',
    source: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/security.html'
  },
  ecr: {
    boundary: 'Stores deployable container images behind repository policies, registry settings, tags, digests, scanning, replication, and encryption.',
    threats: ['Malicious image pushed or a trusted mutable tag moved to a different digest', 'Cross-account repository policy grants unintended pull, push, or administrative access', 'Authorized credentials pull an image so embedded secrets, configuration, or software can be inspected offline', 'Scanning, signing, lifecycle, encryption, tag immutability, or replication controls bypassed'],
    evidence: ['CloudTrail image-layer upload, PutImage, BatchGetImage, layer download, and repository-configuration activity', 'Image digest and manifest, tag history, scan findings, signature and build provenance, repository policy, lifecycle, and replication state', 'Downstream task, deployment, admission, and release records that identify the exact digest used'],
    defenses: ['Use immutable tags and deploy by digest', 'Scan images and enforce trusted build provenance', 'Restrict repository policies and lifecycle administration'],
    responder: 'Who pushed the digest, what source produced it, and which workloads deployed it?',
    source: 'https://docs.aws.amazon.com/AmazonECR/latest/userguide/security.html'
  },

  athena: {
    boundary: 'Queries evidence in S3 through workgroups, catalogs, query permissions, result locations, encryption, and service integrations.',
    threats: ['Broad query access exposes sensitive evidence', 'Query results written to an unsafe bucket', 'Workgroup controls or data-catalog permissions bypassed'],
    evidence: ['CloudTrail Athena query and administration events', 'Query history, workgroup settings, catalog access, and result-bucket logs', 'S3 and KMS access to source and result data'],
    defenses: ['Isolate security workgroups and restrict query principals', 'Encrypt and tightly control result buckets', 'Enforce workgroup limits and preserve investigation queries'],
    responder: 'Who queried which evidence, where were results stored, and could those results be altered or exposed?',
    source: 'https://docs.aws.amazon.com/athena/latest/ug/security.html'
  },
  opensearch: {
    boundary: 'Indexes searchable telemetry behind domain access policy, network placement, fine-grained authorization, audit logging, encryption, and snapshots.',
    threats: ['Public endpoint or weak domain policy', 'Excessive index and dashboard privileges', 'Snapshot, ingestion, or cluster configuration exposure'],
    evidence: ['OpenSearch audit and application logs', 'CloudTrail domain configuration activity', 'Domain policy, users, roles, network, encryption, and snapshot state'],
    defenses: ['Use VPC access and fine-grained access control', 'Encrypt in transit and at rest and enable audit logs', 'Separate ingestion, investigation, and administration roles'],
    responder: 'Which identity searched or changed which index, and is the indexed evidence complete and trustworthy?',
    source: 'https://docs.aws.amazon.com/opensearch-service/latest/developerguide/security.html'
  },
  kinesis: {
    boundary: 'Streams telemetry through producers, shards, consumers, enhanced fan-out, retention, encryption, and delivery integrations.',
    threats: ['Untrusted producer injects records', 'Consumer reads or exports a sensitive stream', 'Retention, encryption, shard, or consumer configuration changed'],
    evidence: ['CloudTrail Kinesis activity supported by configured logging', 'Producer and consumer inventory plus stream configuration', 'Incoming records, iterator age, read/write, throttle, and delivery metrics'],
    defenses: ['Separate producer and consumer permissions', 'Encrypt streams and restrict network access', 'Monitor consumer changes, lag, throughput anomalies, and retention'],
    responder: 'Which producer wrote the record, which consumers read it, and did the stream lose or delay evidence?',
    source: 'https://docs.aws.amazon.com/streams/latest/dev/security.html'
  }
};

export const profileFor = id => securityProfiles[id] || {
  boundary: 'This service participates in an AWS security boundary that should be modeled through identity, network, data, and evidence paths.',
  threats: ['Unexpected identity, configuration, or data-plane use'],
  evidence: ['CloudTrail activity and service-native logs'],
  defenses: ['Apply least privilege, protected logging, and continuous configuration review'],
  responder: 'What changed, who changed it, and which resources became reachable?',
  source: securityPillar
};

export const commonSources = { securityPillar, incidentResponse };
