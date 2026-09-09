
export const researchSources = {
  vault: {
    label: 'ARS3NAL cloud and attack-chain notes',
    publisher: 'Local research vault / upstream inflictx Arsenal',
    url: 'https://github.com/inflictx/Arsenal',
    kind: 'VAULT'
  },
  hacktricks: {
    label: 'AWS services and post-exploitation research',
    publisher: 'HackTricks Cloud',
    url: 'https://cloud.hacktricks.wiki/en/pentesting-cloud/aws-security/aws-services/index.html',
    kind: 'COMMUNITY'
  },
  pacu: {
    label: 'AWS exploitation framework and module catalog',
    publisher: 'Rhino Security Labs / Pacu',
    url: 'https://github.com/RhinoSecurityLabs/pacu',
    kind: 'TOOL RESEARCH'
  },
  stratus: {
    label: 'Granular cloud attack emulation techniques',
    publisher: 'Datadog / Stratus Red Team',
    url: 'https://stratus-red-team.cloud/attack-techniques/list/',
    kind: 'PURPLE TEAM'
  },
  mitre: {
    label: 'T1078.004 Valid Accounts: Cloud Accounts',
    publisher: 'MITRE ATT&CK',
    url: 'https://attack.mitre.org/techniques/T1078/004/',
    kind: 'FRAMEWORK'
  },
  awsIr: {
    label: 'AWS Security Incident Response Guide',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/security-ir/latest/userguide/incident-response.html',
    kind: 'OFFICIAL'
  },
  awsCloudTrailInvestigation: {
    label: 'Incident response guide for AWS CloudTrail investigations',
    publisher: 'AWS Security Blog / AWS SIRT',
    url: 'https://aws.amazon.com/blogs/security/incident-response-guide-for-aws-cloudtrail-investigations-part-1/',
    kind: 'IR BLOG'
  },
  awsCorrelation: {
    label: 'Detecting multi-stage attacks with cross-service signal correlation',
    publisher: 'AWS Security Blog',
    url: 'https://aws.amazon.com/blogs/security/detecting-multi-stage-attacks-on-aws-a-guide-to-cross-service-signal-correlation/',
    kind: 'DETECTION BLOG'
  },
  awsAutomation: {
    label: 'How to get started with security response automation',
    publisher: 'AWS Security Blog',
    url: 'https://aws.amazon.com/blogs/security/how-get-started-security-response-automation-aws/',
    kind: 'RESPONSE BLOG'
  },
  cloudgoat: {
    label: 'Vulnerable-by-design AWS learning scenarios',
    publisher: 'Rhino Security Labs / CloudGoat',
    url: 'https://github.com/RhinoSecurityLabs/cloudgoat',
    kind: 'SAFE LAB'
  },
  prowler: {
    label: 'Open cloud security assessment and compliance checks',
    publisher: 'Prowler',
    url: 'https://github.com/prowler-cloud/prowler',
    kind: 'DEFENSIVE TOOL'
  },
  rhinoIam: {
    label: 'AWS privilege-escalation methods and mitigation',
    publisher: 'Rhino Security Labs',
    url: 'https://rhinosecuritylabs.com/aws/aws-privilege-escalation-methods-mitigation/',
    kind: 'RESEARCH'
  },
  awsAttackAlb: {
    label: 'ALB listener-rule authentication bypass lab',
    publisher: 'AWS Attack Scenarios / Adan Alvarez',
    url: 'https://github.com/adanalvarez/AWS-Attack-Scenarios/blob/dfc857bae9f8fd1cf021f40cac101ec0d76606b6/ALB-Scenario1/README.md',
    kind: 'SAFE LAB'
  },
  awsAttackAppSyncKey: {
    label: 'AppSync additional API-key authorization lab',
    publisher: 'AWS Attack Scenarios / Adan Alvarez',
    url: 'https://github.com/adanalvarez/AWS-Attack-Scenarios/blob/dfc857bae9f8fd1cf021f40cac101ec0d76606b6/AppSync-Scenario1/README.md',
    kind: 'SAFE LAB'
  },
  awsAttackAppSyncResolver: {
    label: 'AppSync resolver authorization manipulation lab',
    publisher: 'AWS Attack Scenarios / Adan Alvarez',
    url: 'https://github.com/adanalvarez/AWS-Attack-Scenarios/blob/dfc857bae9f8fd1cf021f40cac101ec0d76606b6/AppSync-Scenario2/README.md',
    kind: 'SAFE LAB'
  },
  awsAttackCloudFrontFunction: {
    label: 'CloudFront Function response-manipulation and cookie-theft lab',
    publisher: 'AWS Attack Scenarios / Adan Alvarez',
    url: 'https://github.com/adanalvarez/AWS-Attack-Scenarios/blob/dfc857bae9f8fd1cf021f40cac101ec0d76606b6/CloudFront-Scenario1/README.md',
    kind: 'SAFE LAB'
  },
  awsAttackCloudFrontLambda: {
    label: 'Lambda@Edge request-data exfiltration lab',
    publisher: 'AWS Attack Scenarios / Adan Alvarez',
    url: 'https://github.com/adanalvarez/AWS-Attack-Scenarios/blob/dfc857bae9f8fd1cf021f40cac101ec0d76606b6/CloudFront-Scenario2/README.md',
    kind: 'SAFE LAB'
  },
  awsAiApi: {
    label: 'API security breach triage and containment playbook',
    publisher: 'AWS Samples incident-response playbooks',
    url: 'https://github.com/aws-samples/aws-incident-response-playbooks/blob/699c7c7c30f4add23531a3afd1f1803ab61d5f11/ai-playbooks/scenarios/ai-irp-api-security-breach.md',
    kind: 'IR PLAYBOOK'
  },
  awsAiCredential: {
    label: 'Credential compromise scoping and persistence checks',
    publisher: 'AWS Samples incident-response playbooks',
    url: 'https://github.com/aws-samples/aws-incident-response-playbooks/blob/699c7c7c30f4add23531a3afd1f1803ab61d5f11/ai-playbooks/scenarios/ai-irp-credential-compromise.md',
    kind: 'IR PLAYBOOK'
  },
  awsAiSts: {
    label: 'STS role-chain and instance-credential response playbook',
    publisher: 'AWS Samples incident-response playbooks',
    url: 'https://github.com/aws-samples/aws-incident-response-playbooks/blob/699c7c7c30f4add23531a3afd1f1803ab61d5f11/ai-playbooks/scenarios/ai-irp-sts-token-abuse.md',
    kind: 'IR PLAYBOOK'
  },
  awsAiData: {
    label: 'Unauthorized S3 access investigation and recovery playbook',
    publisher: 'AWS Samples incident-response playbooks',
    url: 'https://github.com/aws-samples/aws-incident-response-playbooks/blob/699c7c7c30f4add23531a3afd1f1803ab61d5f11/ai-playbooks/scenarios/ai-irp-data-access.md',
    kind: 'IR PLAYBOOK'
  },
  awsAiEc2: {
    label: 'EC2 isolation, evidence preservation, and recovery playbook',
    publisher: 'AWS Samples incident-response playbooks',
    url: 'https://github.com/aws-samples/aws-incident-response-playbooks/blob/699c7c7c30f4add23531a3afd1f1803ab61d5f11/ai-playbooks/scenarios/ai-irp-ec2-compromise.md',
    kind: 'IR PLAYBOOK'
  },
  awsAiRansomware: {
    label: 'Ransomware containment and recovery-source playbook',
    publisher: 'AWS Samples incident-response playbooks',
    url: 'https://github.com/aws-samples/aws-incident-response-playbooks/blob/699c7c7c30f4add23531a3afd1f1803ab61d5f11/ai-playbooks/scenarios/ai-irp-ransomware.md',
    kind: 'IR PLAYBOOK'
  }
};

const sourceGroups = {
  identity: ['vault','hacktricks','pacu','rhinoIam','awsAiCredential','awsAiSts','mitre','prowler','awsIr'],
  runtime: ['vault','hacktricks','pacu','stratus','cloudgoat','awsAiEc2','prowler','awsIr'],
  data: ['vault','hacktricks','pacu','stratus','cloudgoat','awsAiData','awsAiRansomware','prowler','awsCloudTrailInvestigation','awsIr'],
  edge: ['vault','hacktricks','stratus','awsAttackAlb','awsAttackAppSyncKey','awsAttackAppSyncResolver','awsAttackCloudFrontFunction','awsAttackCloudFrontLambda','awsAiApi','prowler','awsCorrelation','awsIr'],
  detection: ['hacktricks','stratus','prowler','awsCloudTrailInvestigation','awsCorrelation','awsIr'],
  response: ['pacu','stratus','awsAutomation','awsIr'],
  supply: ['vault','hacktricks','cloudgoat','prowler','mitre','awsIr'],
  investigation: ['stratus','awsCloudTrailInvestigation','awsCorrelation','mitre','awsIr']
};

export const researchForDomain = domainId =>
  (sourceGroups[domainId] || ['awsIr']).map(key => researchSources[key]);

export const scenarios = [
  {
    id: 'web-to-role',
    title: 'Web request to cloud identity',
    kicker: 'INITIAL ACCESS -> CREDENTIAL ACCESS -> COLLECTION',
    summary: 'A server-side request feature reaches EC2 instance metadata. Temporary role credentials turn an application flaw into a cloud control-plane incident.',
    confidence: 'Well-documented attack pattern',
    mitre: ['T1190','T1552.005','T1078.004','T1530'],
    services: ['waf','apigateway','elb','ec2','sts','iam','s3','secretsmanager','cloudtrail','guardduty'],
    stages: [
      {service:'waf',title:'Untrusted server-side fetch',detail:'An application accepts a URL or remote resource and performs the request from a trusted workload.',signal:'WAF and application logs show unusual destinations, encodings, redirect chains, or URL-fetch behavior.'},
      {service:'ec2',title:'Instance metadata reached',detail:'The workload can reach its metadata endpoint and expose credentials for its attached instance role.',signal:'Host or proxy telemetry may show metadata traffic; IMDS packet-hop and token settings define what is possible.'},
      {service:'sts',title:'Temporary role session reused',detail:'The obtained role credentials are used from a new network location to call AWS APIs.',signal:'CloudTrail identity context, source IP, user agent, session issuer, and GuardDuty credential findings connect the pivot.'},
      {service:'s3',title:'Permissions become blast radius',detail:'The role discovers or reads objects and secrets allowed by its effective policies.',signal:'S3 data events, Secrets Manager retrieval events, KMS use, and unusual API breadth reveal the collection path.'}
    ],
    detect: ['Correlate the same role session across source IPs and services.', 'Look for first-time API calls, enumeration followed by data access, and access outside the workload baseline.', 'Confirm whether S3 data events and secret retrieval events were enabled before the incident.'],
    contain: ['Block the vulnerable request path and isolate the workload.', 'Replace or remove the role permissions and invalidate dependent secrets; temporary credentials expire but exposed downstream credentials may not.', 'Preserve CloudTrail, application, WAF, VPC, S3, and host evidence before rebuilding.'],
    harden: ['Require IMDSv2, reduce metadata hop limit, and block metadata access where the workload does not need it.', 'Use narrow workload roles and explicit egress controls.', 'Validate URLs after every resolution and redirect, and deny private, link-local, and internal destinations.'],
    sources: ['vault','hacktricks','stratus','cloudgoat','mitre','awsAiSts','awsAiEc2','awsAiData','awsCloudTrailInvestigation','awsIr']
  },
  {
    id: 'role-trust-persistence',
    title: 'Compromised key to durable role access',
    kicker: 'VALID ACCOUNT -> PRIVILEGE ESCALATION -> PERSISTENCE',
    summary: 'A leaked AWS key is only the entry point. The durable risk is a changed trust policy, new credential, or permission path that survives the original key rotation.',
    confidence: 'Supported by ATT&CK and Pacu tradecraft',
    mitre: ['T1078.004','T1098.001','T1548'],
    services: ['iam','sts','identity-center','organizations','cloudtrail','securityhub'],
    stages: [
      {service:'iam',title:'Valid credential used',detail:'A user key or federated session is used to enumerate identity and permission relationships.',signal:'CloudTrail shows GetCallerIdentity context followed by unusual IAM, Organizations, or cross-account discovery.'},
      {service:'sts',title:'Reach expands through role trust',detail:'The principal assumes a role whose trust and permissions extend beyond the original identity.',signal:'AssumeRole events expose the source principal, session issuer, source identity, tags, and target account.'},
      {service:'iam',title:'Persistence is created',detail:'An access key, login profile, policy attachment, or role trust change creates another way back in.',signal:'Prioritize CreateAccessKey, UpdateAssumeRolePolicy, Attach*Policy, Put*Policy, and identity-provider changes.'},
      {service:'organizations',title:'Blast radius crosses accounts',detail:'Organization hierarchy, delegated administration, and guardrails determine whether the session can reach more accounts.',signal:'Organization and SCP changes must be correlated with account-level activity.'}
    ],
    detect: ['Baseline which principals normally change IAM and role trust.', 'Find policy changes followed by AssumeRole from a new source or session name.', 'Search every enabled Region and linked account; identity activity is not safely analyzed in a single-account view.'],
    contain: ['Disable the exposed principal and revoke active sessions where supported.', 'Remove every persistence artifact created during the compromised interval.', 'Quarantine affected roles with explicit denies while preserving policies and CloudTrail evidence.'],
    harden: ['Prefer workforce federation and temporary credentials over user access keys.', 'Use source identity, external IDs where appropriate, and restrictive trust conditions.', 'Protect IAM and Organizations changes with alerting, approval, and break-glass procedures.'],
    sources: ['vault','pacu','rhinoIam','mitre','awsAiCredential','awsAiSts','awsCloudTrailInvestigation','awsIr']
  },
  {
    id: 'lambda-shadow-version',
    title: 'Shadow Lambda version',
    kicker: 'DEPLOYMENT ACCESS -> PERSISTENCE -> EVASION',
    summary: 'A function can continue serving normal traffic while a modified version, layer, alias, environment setting, or resource policy creates a quiet alternate execution path.',
    confidence: 'Documented community post-exploitation pattern',
    mitre: ['T1505.006','T1098','T1053'],
    services: ['lambda','iam','vpc','cloudwatch','cloudtrail','apigateway'],
    stages: [
      {service:'lambda',title:'Function configuration changes',detail:'Code, layer, handler, environment, VPC attachment, version, or alias is changed.',signal:'CloudTrail records update and publish APIs; configuration snapshots reveal layer ARNs, hashes, versions, and networking changes.'},
      {service:'iam',title:'Execution role becomes capability',detail:'The modified runtime inherits the same AWS permissions as the legitimate function.',signal:'Downstream API calls carry the Lambda execution-role session and can be compared with the function baseline.'},
      {service:'apigateway',title:'Alternate invocation path',detail:'A resource policy, function URL, alias, or API route permits invocation outside the primary flow.',signal:'Compare Lambda resource policies, API deployments, alias weights, invocation logs, and access-log request IDs.'},
      {service:'vpc',title:'Egress boundary changes',detail:'Removing or changing VPC configuration can alter the function network path.',signal:'UpdateFunctionConfiguration plus a shift in destination or source addresses is a high-value correlation.'}
    ],
    detect: ['Diff function code hashes, layers, aliases, versions, resource policy, environment, and VPC configuration.', 'Link CloudTrail update events to the actor and deployment pipeline.', 'Inspect low-volume versions and qualified invocations, not only the primary alias.'],
    contain: ['Disable untrusted invocation paths and pin traffic to a known-good version.', 'Replace exposed execution-role and application credentials.', 'Preserve the function package, layers, configuration, logs, and deployment artifacts.'],
    harden: ['Use code signing and controlled deployment roles.', 'Deny direct production updates outside the release pipeline.', 'Alert on AddPermission, UpdateFunctionCode, UpdateFunctionConfiguration, PublishVersion, and alias changes.'],
    sources: ['hacktricks','pacu','stratus','cloudgoat','awsIr']
  },
  {
    id: 'image-to-runtime',
    title: 'Container image to production identity',
    kicker: 'SUPPLY CHAIN -> EXECUTION -> LATERAL MOVEMENT',
    summary: 'A modified image or mutable tag crosses ECR and deployment controls, then runs with task, pod, or node credentials inside a trusted network.',
    confidence: 'Common cloud-native attack path',
    mitre: ['T1195.002','T1610','T1552.007'],
    services: ['codepipeline','ecr','ecs','eks','fargate','iam','guardduty','cloudtrail'],
    stages: [
      {service:'codepipeline',title:'Release path altered',detail:'A source revision, approval, artifact, or pipeline role is abused to publish an unintended build.',signal:'Pipeline execution, approval identity, source commit, build logs, and artifact digest establish provenance.'},
      {service:'ecr',title:'Trusted tag points elsewhere',detail:'A mutable tag or broad repository policy allows an unexpected image digest to become deployable.',signal:'CloudTrail image push activity, ECR scan results, repository policy changes, and digest history show the substitution.'},
      {service:'ecs',title:'Image receives workload identity',detail:'The image runs as an ECS task, EKS pod, or Fargate task with network access and an AWS role.',signal:'Task definitions, pod specifications, deployment events, runtime findings, and role sessions connect image to identity.'},
      {service:'guardduty',title:'Runtime behavior diverges',detail:'Discovery, credential use, network scanning, or execution behavior departs from the workload baseline.',signal:'Runtime findings, VPC flows, DNS, application logs, and CloudTrail form the cross-plane timeline.'}
    ],
    detect: ['Resolve every deployed tag to an immutable digest and trusted build.', 'Correlate image push, task-definition or deployment change, and first runtime activity.', 'Look for workload roles calling services never used by the previous image.'],
    contain: ['Stop the affected rollout and isolate running tasks or pods.', 'Revoke the affected workload identities and rotate reachable secrets.', 'Retain the image, SBOM, signature, pipeline logs, task definitions, and runtime evidence.'],
    harden: ['Use immutable tags or deploy by digest and verify signatures.', 'Separate build, push, deploy, task, and node permissions.', 'Apply image scanning, admission controls, minimal roles, and runtime monitoring.'],
    sources: ['vault','hacktricks','stratus','cloudgoat','mitre','awsCorrelation','awsIr']
  },
  {
    id: 'trail-impairment',
    title: 'Evidence pipeline impairment',
    kicker: 'DEFENSE EVASION -> IMPACT',
    summary: 'Stopping a trail is the obvious move. Selectors, delivery policies, KMS state, lifecycle rules, subscriptions, and retention can create quieter evidence gaps.',
    confidence: 'Directly emulated by Stratus Red Team',
    mitre: ['T1562.008','T1070','T1485'],
    services: ['cloudtrail','s3','kms','cloudwatch','config','securityhub'],
    stages: [
      {service:'cloudtrail',title:'Collection scope narrows',detail:'A trail is stopped, deleted, made single-Region, or its event selectors are changed.',signal:'CloudTrail administration events, trail status, selector history, and organization configuration expose the change.'},
      {service:'s3',title:'Delivery or retention is weakened',detail:'Bucket policy, object deletion, lifecycle, replication, or Object Lock settings reduce log availability.',signal:'S3 management and data events plus version and lifecycle history show the evidence impact.'},
      {service:'kms',title:'Evidence becomes unreadable',detail:'The log encryption key is disabled, scheduled for deletion, or its policy is changed.',signal:'KMS management events and failed CloudTrail delivery or decrypt operations correlate the outage.'},
      {service:'cloudwatch',title:'Alert path goes silent',detail:'A log subscription, alarm, destination, or retention setting is altered.',signal:'CloudWatch control-plane events and sudden ingestion or delivery gaps distinguish silence from normal inactivity.'}
    ],
    detect: ['Alert from a separate security account on every logging-control change.', 'Continuously compare expected and actual trail, selector, bucket, KMS, Config, and subscription state.', 'Use log validation and independent signals such as GuardDuty findings and service-native logs.'],
    contain: ['Restore collection through a protected administrative path.', 'Snapshot current policies and configurations before repair.', 'Identify the exact blind interval and reconstruct it from independent evidence sources.'],
    harden: ['Centralize organization trails in a dedicated log archive account.', 'Use immutable retention controls and tightly separated KMS and S3 administration.', 'Test alert delivery when collection or downstream routing is deliberately interrupted in a sandbox.'],
    sources: ['hacktricks','stratus','awsCloudTrailInvestigation','awsCorrelation','awsIr']
  },
  {
    id: 'dns-origin-bypass',
    title: 'Edge control to exposed origin',
    kicker: 'DISCOVERY -> CONTROL BYPASS -> CREDENTIAL ACCESS',
    summary: 'CloudFront and WAF can be sound while the origin remains directly reachable. DNS history, certificates, headers, or network exposure can reveal the alternate path.',
    confidence: 'Recurring web and cloud assessment pattern',
    mitre: ['T1595','T1584.001','T1190'],
    services: ['route53','cloudfront','waf','elb','apigateway','vpc'],
    stages: [
      {service:'route53',title:'Origin is discoverable',detail:'DNS records, certificate names, response differences, or historical data reveal an origin endpoint.',signal:'Resolver and authoritative DNS logs, certificate inventory, and asset records help establish discovery paths.'},
      {service:'vpc',title:'Origin accepts direct traffic',detail:'A public load balancer, API, instance, or security group permits traffic that does not traverse the intended edge.',signal:'VPC Flow Logs and origin access logs show requests without expected CloudFront or WAF context.'},
      {service:'waf',title:'Edge policy is bypassed',detail:'Requests sent directly to the origin avoid rules associated only with the distribution or edge endpoint.',signal:'Compare WAF logs with origin logs; origin-only requests create a strong coverage discrepancy.'},
      {service:'cloudfront',title:'Trust boundary is corrected',detail:'Origin authentication and network restrictions ensure only the intended distribution can reach the backend.',signal:'Configuration and reachability testing confirm the direct path is closed.'}
    ],
    detect: ['Join edge request IDs, origin logs, and flow records to identify origin-only traffic.', 'Inventory every public listener, API stage, distribution origin, DNS record, and certificate name.', 'Alert on origin, listener, security-group, distribution, and resource-policy changes.'],
    contain: ['Restrict the origin to approved edge identities or network paths.', 'Block direct traffic while preserving representative requests and configuration state.', 'Rotate any application credentials exposed through the bypassed route.'],
    harden: ['Use CloudFront Origin Access Control for supported S3 origins.', 'Apply restrictive origin security groups, resource policies, or private integrations.', 'Test the architecture from the Internet using the origin hostname and address, not only the public application URL.'],
    sources: ['vault','hacktricks','stratus','prowler','awsIr']
  },
  {
    id: 'recovery-erasure',
    title: 'Primary data and recovery erased together',
    kicker: 'IMPACT -> INHIBIT RECOVERY',
    summary: 'A highly privileged identity can target production data, snapshots, backup plans, vaults, replication, and encryption keys during the same destructive event.',
    confidence: 'Resilience-focused threat model',
    mitre: ['T1485','T1490','T1562.008'],
    services: ['backup','s3','rds','dynamodb','efs','kms','organizations'],
    stages: [
      {service:'organizations',title:'Privilege crosses workload accounts',detail:'Shared administration or weak organization guardrails allow one identity to reach production and recovery resources.',signal:'Cross-account role assumptions and organization policy changes define the blast radius.'},
      {service:'backup',title:'Recovery controls are weakened',detail:'Backup plans, retention, vault policy, locks, copy jobs, or recovery points are targeted.',signal:'AWS Backup jobs, Audit Manager, vault events, and policy history show what remains recoverable.'},
      {service:'s3',title:'Primary and replicated data changes',detail:'Objects, versions, replication settings, or lifecycle rules are deleted or overwritten.',signal:'Object data events, version inventory, replication metrics, and KMS activity reveal the destructive sequence.'},
      {service:'kms',title:'Keys become a second failure point',detail:'Disabling or deleting keys can make otherwise intact data and backups unavailable.',signal:'KMS administration events and decrypt failures identify the affected dependency.'}
    ],
    detect: ['Alert on backup, vault, deletion, retention, replication, and key-state changes.', 'Monitor destructive actions by principals that do not normally operate recovery services.', 'Continuously prove that protected copies exist in another account and can be restored.'],
    contain: ['Apply emergency denies to destructive APIs and isolate compromised administrators.', 'Cancel scheduled key deletion and preserve remaining versions, snapshots, and recovery points.', 'Prioritize business-defined critical data and perform a clean-room restore test.'],
    harden: ['Use logically isolated vaults, Vault Lock, Object Lock, and separate recovery accounts.', 'Separate workload, backup, and key administrators.', 'Build recovery objectives around tested restores, not successful backup-job status alone.'],
    sources: ['stratus','prowler','mitre','awsAiRansomware','awsAiData','awsIr']
  },
  {
    id: 'response-plane-hijack',
    title: 'Security finding to privileged automation',
    kicker: 'DETECTION -> AUTOMATION -> CONTAINMENT',
    summary: 'Automated response reduces dwell time, but a forged event, changed rule, broad target role, or unsafe runbook can turn the response plane into a privileged execution path.',
    confidence: 'Defensive control-plane threat model',
    mitre: ['T1098','T1059','T1562.008'],
    services: ['guardduty','eventbridge','sns','sqs','stepfunctions','systemsmanager','iam','cloudtrail'],
    stages: [
      {service:'guardduty',title:'Finding starts the workflow',detail:'A finding or security event is routed into EventBridge for enrichment and response.',signal:'Retain the original finding ID, account, Region, resource, severity, and update history.'},
      {service:'eventbridge',title:'Rule chooses a target',detail:'Event pattern, bus policy, rule state, target, input transform, and retry behavior define what runs.',signal:'CloudTrail rule and target changes plus invocation and DLQ metrics establish routing integrity.'},
      {service:'stepfunctions',title:'Decision path orchestrates action',detail:'The state-machine version and execution role determine branches, approvals, and downstream permissions.',signal:'Execution history and versioned definitions show why a response action occurred.'},
      {service:'systemsmanager',title:'Privileged action reaches a node',detail:'Run Command, Automation, or Session Manager contains the workload or collects evidence.',signal:'Command, session, document, target, output, and initiator records must remain available.'}
    ],
    detect: ['Monitor changes to rules, targets, bus policies, state machines, documents, and response roles.', 'Require every action to carry the source finding and workflow execution identifiers.', 'Alert when response identities act outside approved resources or without a current finding.'],
    contain: ['Disable the affected automation path without deleting its execution history.', 'Revoke the response role session and isolate unsafe documents or targets.', 'Manually validate queued and in-flight actions before resuming.'],
    harden: ['Use narrow roles for each response step and explicit resource allowlists.', 'Require approval for destructive actions and make workflows idempotent.', 'Use dead-letter queues, versioned runbooks, complete logging, and routine sandbox tests.'],
    sources: ['pacu','stratus','awsAutomation','awsIr']
  },
  {
    id: 'alb-rule-auth-bypass',
    title: 'ALB rule before authentication',
    kicker: 'CONTROL PLANE ACCESS -> AUTHENTICATION BYPASS -> DATA ACCESS',
    summary: 'A principal already able to change an Application Load Balancer inserts a higher-priority forwarding rule ahead of the Cognito authenticate action, so selected requests reach the target without that check.',
    confidence: 'Directly demonstrated by a cited safe lab; requires ELB rule-management permission',
    mitre: [],
    services: ['iam','elb','cognito','ec2','cloudtrail','waf'],
    stages: [
      {service:'iam',title:'ELB configuration authority is used',detail:'The path begins with an AWS principal that can create or modify listener rules; it is not a remote flaw in the load balancer.',signal:'CloudTrail identifies the caller, session, source, Region, and ELB rule-management API activity.'},
      {service:'elb',title:'A lower-numbered rule wins',detail:'A new condition and forward or fixed-response action is evaluated before the rule that performs Cognito authentication.',signal:'Preserve listener-rule priorities, conditions, transforms, and ordered actions; ALB access logs expose the matched priority and executed actions.'},
      {service:'cognito',title:'The authenticate action is skipped',detail:'Requests matching the inserted rule are forwarded without running the intended authenticate-cognito action.',signal:'The rule configuration is primary evidence. A missing Cognito event can support the timeline but does not prove bypass by itself.'},
      {service:'ec2',title:'The target handles an unauthenticated request',detail:'The backend receives the selected request and may return data because it trusted the load balancer to enforce identity.',signal:'Join ALB request records with application authorization logs and the exact response or data-access evidence.'}
    ],
    detect: ['Continuously diff listener priorities, conditions, transforms, and ordered actions against reviewed configuration.', 'Correlate CreateRule, ModifyRule, SetRulePriorities, and ModifyListener activity with ALB access-log matched priority and actions.', 'Prove impact in backend logs; a configuration change alone does not establish that protected data was returned.'],
    contain: ['Block active exploitation at the safest available layer, then preserve the listener configuration before restoring the reviewed rule set.', 'Revoke the control-plane session that changed the listener and check for other ELB, WAF, target-group, and Cognito changes by the same principal.', 'Invalidate affected application sessions if backend evidence shows unauthorized access.'],
    harden: ['Limit listener-rule changes to a controlled deployment role and reviewed infrastructure code.', 'Alert on priority changes and any protected route whose terminal action is not preceded by authentication.', 'Test protected routes with both matching and adversarial headers, paths, query strings, and cookies.'],
    sources: ['awsAttackAlb','awsAiApi','awsIr']
  },
  {
    id: 'appsync-api-key-persistence',
    title: 'AppSync API key beside normal sign-in',
    kicker: 'CONTROL PLANE ACCESS -> ALTERNATE AUTHORIZATION -> PERSISTENCE',
    summary: 'A principal with AppSync administration rights adds API-key authorization alongside the existing IAM and Cognito modes, creates a key, and changes schema directives so selected operations accept it.',
    confidence: 'Directly demonstrated by a cited safe lab; requires AppSync API and schema permissions',
    mitre: [],
    services: ['iam','appsync','cognito','dynamodb','cloudtrail','cloudwatch'],
    stages: [
      {service:'iam',title:'AppSync administration is available',detail:'The actor must already be able to update the GraphQL API, create an API key, and publish a schema.',signal:'CloudTrail ties each control-plane change to the principal, source, Region, and request parameters.'},
      {service:'appsync',title:'An additional authorization mode appears',detail:'API-key authorization is added without removing the expected IAM and Cognito providers, allowing normal traffic to continue.',signal:'Compare the current authenticationType, additionalAuthenticationProviders, API-key inventory, descriptions, and expiry times with the approved baseline.'},
      {service:'appsync',title:'Schema directives widen key access',detail:'Selected GraphQL fields are marked to accept the new authorization mode while other directives preserve the legitimate application path.',signal:'Version and diff the schema; investigate UpdateGraphqlApi, CreateApiKey, and StartSchemaCreation events in the same window.'},
      {service:'dynamodb',title:'The alternate path reaches data sources',detail:'Operations admitted by the schema run through existing resolvers and the AppSync data-source role.',signal:'AppSync request and field logs, resolver behavior, DynamoDB access evidence, and capacity changes establish which operations succeeded.'}
    ],
    detect: ['Inventory every primary and additional authorization mode and every API key, including owner, purpose, creation time, and expiry.', 'Diff schema authorization directives and correlate them with API-key and GraphQL API changes.', 'Use AppSync logs and data-source evidence to scope successful operations; key creation alone is not proof of data access.'],
    contain: ['Preserve the API configuration, schema, resolver set, and key metadata before deleting the unapproved key and restoring reviewed authorization modes.', 'Revoke the principal that made the control-plane changes and search for changes to resolvers, functions, data sources, logging, and Cognito.', 'Assess affected records and users before returning the API to normal service.'],
    harden: ['Disallow API-key authorization for sensitive production fields unless it is an explicit design requirement.', 'Deploy authorization providers and schemas only through a reviewed pipeline and alert on out-of-band changes.', 'Keep any approved keys short-lived and test every field against each configured authorization mode.'],
    sources: ['awsAttackAppSyncKey','awsAiApi','awsAiData','awsIr']
  },
  {
    id: 'appsync-resolver-data-access',
    title: 'Resolver branch breaks tenant isolation',
    kicker: 'CONTROL PLANE ACCESS -> AUTHORIZATION CHANGE -> COLLECTION',
    summary: 'A principal with resolver-update rights adds a hidden branch for an attacker-controlled Cognito identity, causing AppSync to scan and return DynamoDB records outside that user’s normal scope.',
    confidence: 'Directly demonstrated by a cited safe lab; requires resolver modification permission',
    mitre: [],
    services: ['iam','appsync','cognito','dynamodb','cloudtrail','cloudwatch'],
    stages: [
      {service:'iam',title:'Resolver deployment rights are used',detail:'The actor must already have AppSync control-plane permission to replace resolver code or configuration.',signal:'CloudTrail establishes who changed the resolver and whether the activity came from the expected deployment role.'},
      {service:'appsync',title:'Authorization moves into a hidden branch',detail:'Resolver logic treats one selected identity differently and accepts request-controlled input to choose records.',signal:'Diff resolver code, functions, runtime, data source, and caching state against the reviewed version.'},
      {service:'cognito',title:'An ordinary user token triggers the branch',detail:'The caller authenticates through the legitimate user pool, but the modified resolver grants behavior that the schema and UI do not reveal.',signal:'Correlate Cognito identity context with AppSync request IDs, field logs, headers selected for safe logging, and the changed resolver version.'},
      {service:'dynamodb',title:'A broad read crosses user boundaries',detail:'The resolver performs a wider table operation and returns records that do not belong to the authenticated user.',signal:'Resolver logs, response evidence, DynamoDB telemetry, and application audit records define the records and users affected.'}
    ],
    detect: ['Keep resolver and function code in version control and compare deployed hashes and configuration continuously.', 'Alert when resolver updates bypass the normal deployment principal or coincide with unusual Scan activity and cross-tenant responses.', 'Test object ownership and tenant isolation at the GraphQL field boundary, not only in the web client.'],
    contain: ['Preserve the changed resolver and logs, then deploy the reviewed resolver version and disable the attacker-controlled application identity.', 'Revoke the principal that changed AppSync and inspect schemas, API keys, data sources, functions, caches, and logging for related persistence.', 'Scope which records were returned and involve data owners, legal, or compliance based on confirmed impact.'],
    harden: ['Require code review and pipeline-only resolver deployment.', 'Make authorization independent of caller-controlled headers and enforce ownership for every record returned.', 'Enable appropriately scoped AppSync logging and alarms while excluding secrets and tokens from logs.'],
    sources: ['awsAttackAppSyncResolver','awsAiApi','awsAiData','awsIr']
  },
  {
    id: 'cloudfront-function-cookie-theft',
    title: 'Viewer response becomes a cookie trap',
    kicker: 'CONTROL PLANE ACCESS -> EDGE RESPONSE CHANGE -> SESSION THEFT',
    summary: 'A principal with CloudFront function and distribution permissions publishes viewer-response logic that replaces selected content with a path that sends browser-accessible cookies to an external destination.',
    confidence: 'Directly demonstrated by a cited safe lab; requires CloudFront function publication and association rights',
    mitre: ['T1539'],
    services: ['iam','cloudfront','s3','cloudtrail','cloudwatch'],
    stages: [
      {service:'iam',title:'Edge deployment rights are used',detail:'The actor must be able to create or update a CloudFront Function, publish it, and associate it with a distribution behavior.',signal:'CloudTrail captures the principal and the CloudFront create, update, publish, and distribution-change sequence.'},
      {service:'cloudfront',title:'Viewer-response code is published',detail:'The function alters responses at the edge and conditionally sends a browser down an attacker-selected content path.',signal:'Preserve the development and live function code, ETags, stage, publish time, and distribution configuration.'},
      {service:'cloudfront',title:'The live behavior gains an association',detail:'The published function is attached to the viewer-response event for a cache behavior, affecting matching requests without an origin deployment.',signal:'Diff FunctionAssociations for every behavior and correlate the change with response anomalies and cache paths.'},
      {service:'s3',title:'A browser-accessible session value leaves',detail:'The lab’s page stores a simulated session cookie accessible to script; altered content causes that value to be sent externally.',signal:'Browser telemetry, application session records, destination indicators, and CloudFront request logs scope affected clients; CloudFront logs do not reveal response-body code.'}
    ],
    detect: ['Inventory every LIVE CloudFront Function and behavior association, then diff code and ETags against reviewed deployment artifacts.', 'Correlate CreateFunction, UpdateFunction, PublishFunction, and UpdateDistribution with unexpected redirects, scripts, or outbound browser requests.', 'Treat a changed function as exposure potential; confirm affected sessions through browser, application, and identity evidence.'],
    contain: ['Preserve the live function and distribution configuration, then detach the unapproved association or restore the reviewed version.', 'Revoke the AWS principal that made the change and inspect all distributions, functions, origins, response-header policies, and WAF associations it touched.', 'Invalidate confirmed exposed web sessions and block known collection destinations.'],
    harden: ['Separate function development, publication, and distribution-update permissions.', 'Deploy edge code and associations through reviewed infrastructure code with drift alerts.', 'Use Secure, HttpOnly, and appropriate SameSite settings for real session cookies and keep authorization decisions server-side.'],
    sources: ['awsAttackCloudFrontFunction','awsAiApi','awsIr']
  },
  {
    id: 'lambda-edge-request-exfiltration',
    title: 'Lambda@Edge request copy',
    kicker: 'CONTROL PLANE ACCESS -> EDGE CODE CHANGE -> EXFILTRATION',
    summary: 'A principal able to change Lambda and CloudFront publishes a modified Lambda@Edge version and associates it with the distribution, allowing request event data to be copied to an external endpoint.',
    confidence: 'Directly demonstrated by a cited safe lab; requires Lambda code, version, and CloudFront association rights',
    mitre: [],
    services: ['iam','lambda','cloudfront','s3','cloudtrail','cloudwatch'],
    stages: [
      {service:'iam',title:'Lambda and distribution rights are combined',detail:'The path requires permission to modify function code, publish a version, and update the CloudFront association.',signal:'CloudTrail reveals whether one principal or a chained set of roles performed the required control-plane actions.'},
      {service:'lambda',title:'A modified version is published',detail:'The edge handler is changed to copy request event data outward, then a numbered function version is created.',signal:'Preserve code hashes, packages, versions, execution role, last-modified time, and UpdateFunctionCode and PublishVersion events.'},
      {service:'cloudfront',title:'The distribution selects the new version',detail:'A cache behavior is updated to invoke the modified Lambda@Edge version for matching requests.',signal:'Diff LambdaFunctionAssociations, event type, include-body setting, qualified ARN, behavior pattern, and distribution ETag.'},
      {service:'cloudwatch',title:'Request data leaves during edge execution',detail:'Each matching invocation can transmit the request fields available to that event type to an external service.',signal:'Use Lambda@Edge logs in the execution Regions, DNS or network indicators, CloudFront logs, and application session evidence to scope exposure.'}
    ],
    detect: ['Correlate UpdateFunctionCode, PublishVersion, and UpdateDistribution as one sequence and verify the actor and approved change.', 'Continuously compare deployed edge-function hashes and qualified ARNs with release artifacts.', 'Hunt across Lambda@Edge log Regions and external-destination indicators; the distribution configuration alone does not prove successful exfiltration.'],
    contain: ['Preserve the function package, versions, role, distribution configuration, and logs before restoring a reviewed association.', 'Revoke the changing principal and execution-role sessions as appropriate, then inspect every distribution that references the function.', 'Rotate only data confirmed or reasonably scoped as exposed, prioritizing session tokens and credentials present in request events.'],
    harden: ['Separate Lambda code publication from CloudFront distribution administration.', 'Permit only reviewed qualified function ARNs in edge associations and alert on drift.', 'Minimize sensitive request data at the edge and test deployment provenance and rollback regularly.'],
    sources: ['awsAttackCloudFrontLambda','awsAiApi','awsAiCredential','awsIr']
  }
];

export const scenarioById = id => scenarios.find(s => s.id === id);
export const scenariosForService = id => scenarios.filter(s => s.services.includes(id));
export const scenarioSources = scenario =>
  (scenario?.sources || []).map(key => researchSources[key]).filter(Boolean);
