
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
  },
  rhinoCloudFormation: {
    label: 'CloudFormation template resource injection research',
    publisher: 'Rhino Security Labs',
    url: 'https://rhinosecuritylabs.com/aws/cloud-malware-cloudformation-injection/',
    kind: 'RESEARCH'
  },
  awsCloudFormationRole: {
    label: 'CloudFormation service role security behavior',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-servicerole.html',
    kind: 'OFFICIAL'
  },
  awsAthenaTrail: {
    label: 'Logging Athena API calls with CloudTrail',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/athena/latest/ug/monitor-with-cloudtrail.html',
    kind: 'OFFICIAL'
  },
  awsKinesisPolicy: {
    label: 'Kinesis Data Streams access and cross-account policy model',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/streams/latest/dev/controlling-access.html',
    kind: 'OFFICIAL'
  },
  awsKinesisTrail: {
    label: 'Logging Kinesis Data Streams API calls with CloudTrail',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/streams/latest/dev/logging-using-cloudtrail.html',
    kind: 'OFFICIAL'
  },
  awsOpenSearchAccess: {
    label: 'OpenSearch Service access-policy and network controls',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/opensearch-service/latest/developerguide/ac.html',
    kind: 'OFFICIAL'
  },
  awsOpenSearchAudit: {
    label: 'OpenSearch audit-log configuration and event fields',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/opensearch-service/latest/developerguide/audit-logs.html',
    kind: 'OFFICIAL'
  },
  offensiveCloud: {
    label: 'AWS reconnaissance, privilege-escalation, persistence, execution, and exfiltration technique catalog',
    publisher: 'OffensiveCloud / lutzenfried',
    url: 'https://github.com/lutzenfried/OffensiveCloud/blob/f91d349debbd6fc697962c42c6922c8e14a4967e/AWS/AWS%20Pentest%20Cloud%20-%20Resources.md',
    kind: 'COMMUNITY RESEARCH'
  },
  awesomeAwsSecurity: {
    label: 'Curated directory of AWS security research, labs, tools, training, and incident references',
    publisher: 'Awesome AWS Security / jassics',
    url: 'https://github.com/jassics/awesome-aws-security/blob/b613b720f0c2d68636e9f3bfc0e4b295a8848241/README.md',
    kind: 'CURATED INDEX'
  },
  awsDetectionLab: {
    label: 'Eight native CloudWatch Logs metric-filter detections with telemetry, response, false-positive, and tuning notes',
    publisher: 'AWS Detection Engineering Lab / Jan Paul Sanchez Sierra',
    url: 'https://github.com/JpsBookOfLife/aws-detection-engineering-lab/tree/4a985c0bb78862748591387b1eaebbd3568df89f/detections',
    kind: 'DETECTION LAB'
  },
  awsDetectionRoot: {
    label: 'DET-001 — Root account usage metric filter',
    publisher: 'AWS Detection Engineering Lab / Jan Paul Sanchez Sierra',
    url: 'https://github.com/JpsBookOfLife/aws-detection-engineering-lab/blob/4a985c0bb78862748591387b1eaebbd3568df89f/detections/DET-001-root-account-usage.yml',
    kind: 'NATIVE DETECTION'
  },
  awsDetectionCloudTrail: {
    label: 'DET-002 — CloudTrail logging disabled, deleted, or reconfigured',
    publisher: 'AWS Detection Engineering Lab / Jan Paul Sanchez Sierra',
    url: 'https://github.com/JpsBookOfLife/aws-detection-engineering-lab/blob/4a985c0bb78862748591387b1eaebbd3568df89f/detections/DET-002-cloudtrail-tampering.yml',
    kind: 'NATIVE DETECTION'
  },
  awsDetectionNoMfa: {
    label: 'DET-003 — Successful IAM-user console login without MFA',
    publisher: 'AWS Detection Engineering Lab / Jan Paul Sanchez Sierra',
    url: 'https://github.com/JpsBookOfLife/aws-detection-engineering-lab/blob/4a985c0bb78862748591387b1eaebbd3568df89f/detections/DET-003-console-login-without-mfa.yml',
    kind: 'NATIVE DETECTION'
  },
  awsDetectionConsoleBrute: {
    label: 'DET-004 — Repeated failed AWS Console authentication',
    publisher: 'AWS Detection Engineering Lab / Jan Paul Sanchez Sierra',
    url: 'https://github.com/JpsBookOfLife/aws-detection-engineering-lab/blob/4a985c0bb78862748591387b1eaebbd3568df89f/detections/DET-004-console-brute-force.yml',
    kind: 'NATIVE DETECTION'
  },
  awsDetectionS3Public: {
    label: 'DET-005 — S3 public-exposure configuration changes',
    publisher: 'AWS Detection Engineering Lab / Jan Paul Sanchez Sierra',
    url: 'https://github.com/JpsBookOfLife/aws-detection-engineering-lab/blob/4a985c0bb78862748591387b1eaebbd3568df89f/detections/DET-005-s3-public-exposure.yml',
    kind: 'NATIVE DETECTION'
  },
  awsDetectionIamPolicy: {
    label: 'DET-006 — IAM policy attachment, inline policy, policy version, and role-trust changes',
    publisher: 'AWS Detection Engineering Lab / Jan Paul Sanchez Sierra',
    url: 'https://github.com/JpsBookOfLife/aws-detection-engineering-lab/blob/4a985c0bb78862748591387b1eaebbd3568df89f/detections/DET-006-iam-privilege-escalation.yml',
    kind: 'NATIVE DETECTION'
  },
  awsDetectionSecurityGroup: {
    label: 'DET-007 — IPv4 security-group ingress opened to 0.0.0.0/0',
    publisher: 'AWS Detection Engineering Lab / Jan Paul Sanchez Sierra',
    url: 'https://github.com/JpsBookOfLife/aws-detection-engineering-lab/blob/4a985c0bb78862748591387b1eaebbd3568df89f/detections/DET-007-security-group-open-to-world.yml',
    kind: 'NATIVE DETECTION'
  },
  awsDetectionUnusedRegion: {
    label: 'DET-008 — Mutating API activity outside an approved Region allowlist',
    publisher: 'AWS Detection Engineering Lab / Jan Paul Sanchez Sierra',
    url: 'https://github.com/JpsBookOfLife/aws-detection-engineering-lab/blob/4a985c0bb78862748591387b1eaebbd3568df89f/detections/DET-008-access-key-new-region.yml',
    kind: 'NATIVE DETECTION'
  },
  rhinoEcsTask: {
    label: 'Weaponizing ECS task definitions to reach credentials from running containers',
    publisher: 'Rhino Security Labs',
    url: 'https://rhinosecuritylabs.com/aws/weaponizing-ecs-task-definitions-steal-credentials-running-containers/',
    kind: 'RESEARCH'
  },
  rhinoEbsSnapshots: {
    label: 'Downloading and examining EBS snapshots for exposed data',
    publisher: 'Rhino Security Labs',
    url: 'https://rhinosecuritylabs.com/aws/exploring-aws-ebs-snapshots/',
    kind: 'RESEARCH'
  },
  bishopIamVulnerable: {
    label: 'Vulnerable-by-design IAM privilege-escalation paths for isolated labs',
    publisher: 'Bishop Fox / iam-vulnerable',
    url: 'https://github.com/BishopFox/iam-vulnerable',
    kind: 'SAFE LAB'
  },
  hackingCloudS3Replication: {
    label: 'S3 bucket-replication exfiltration prerequisites and attack path',
    publisher: 'Hacking the Cloud',
    url: 'https://hackingthe.cloud/aws/exploitation/s3-bucket-replication-exfiltration/',
    kind: 'COMMUNITY RESEARCH'
  },
  awsSsmRunCommand: {
    label: 'Run Command behavior, authorization, targeting, and command history',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/run-command.html',
    kind: 'OFFICIAL'
  },
  awsEbsSnapshotPermissions: {
    label: 'EBS snapshot sharing, public access, and encryption restrictions',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/ebs/latest/userguide/ebs-modifying-snapshot-permissions.html',
    kind: 'OFFICIAL'
  },
  awsS3Replication: {
    label: 'Cross-account S3 replication requirements and destination ownership',
    publisher: 'Amazon Web Services',
    url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication-walkthrough-2.html',
    kind: 'OFFICIAL'
  }
};

const sourceGroups = {
  identity: ['vault','hacktricks','offensiveCloud','pacu','rhinoIam','bishopIamVulnerable','awsDetectionRoot','awsDetectionNoMfa','awsDetectionConsoleBrute','awsDetectionIamPolicy','awsDetectionUnusedRegion','awsAiCredential','awsAiSts','mitre','prowler','awesomeAwsSecurity','awsIr'],
  runtime: ['vault','hacktricks','offensiveCloud','pacu','stratus','cloudgoat','rhinoEcsTask','rhinoEbsSnapshots','awsSsmRunCommand','awsEbsSnapshotPermissions','awsDetectionSecurityGroup','awsAiEc2','prowler','awesomeAwsSecurity','awsIr'],
  data: ['vault','hacktricks','offensiveCloud','pacu','stratus','cloudgoat','hackingCloudS3Replication','awsS3Replication','awsDetectionS3Public','awsAiData','awsAiRansomware','awsAthenaTrail','awsKinesisPolicy','awsOpenSearchAccess','prowler','awsCloudTrailInvestigation','awesomeAwsSecurity','awsIr'],
  edge: ['vault','hacktricks','offensiveCloud','stratus','awsAttackAlb','awsAttackAppSyncKey','awsAttackAppSyncResolver','awsAttackCloudFrontFunction','awsAttackCloudFrontLambda','awsDetectionSecurityGroup','awsAiApi','prowler','awsCorrelation','awesomeAwsSecurity','awsIr'],
  detection: ['hacktricks','stratus','awsDetectionLab','awsDetectionRoot','awsDetectionCloudTrail','awsDetectionNoMfa','awsDetectionConsoleBrute','awsDetectionS3Public','awsDetectionIamPolicy','awsDetectionSecurityGroup','awsDetectionUnusedRegion','prowler','awsCloudTrailInvestigation','awsCorrelation','awesomeAwsSecurity','awsIr'],
  response: ['pacu','stratus','offensiveCloud','awsSsmRunCommand','awsAutomation','awesomeAwsSecurity','awsIr'],
  supply: ['vault','hacktricks','offensiveCloud','cloudgoat','rhinoEcsTask','bishopIamVulnerable','rhinoCloudFormation','awsCloudFormationRole','prowler','mitre','awesomeAwsSecurity','awsIr'],
  investigation: ['stratus','awsDetectionLab','awsDetectionCloudTrail','awsDetectionUnusedRegion','awsCloudTrailInvestigation','awsCorrelation','mitre','awesomeAwsSecurity','awsIr']
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
    sources: ['vault','hacktricks','offensiveCloud','stratus','cloudgoat','mitre','awsAiSts','awsAiEc2','awsAiData','awsCloudTrailInvestigation','awsIr']
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
    sources: ['vault','offensiveCloud','pacu','rhinoIam','bishopIamVulnerable','awsDetectionIamPolicy','mitre','awsAiCredential','awsAiSts','awsCloudTrailInvestigation','awsIr']
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
    sources: ['hacktricks','offensiveCloud','pacu','stratus','cloudgoat','awsIr']
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
    sources: ['vault','hacktricks','offensiveCloud','rhinoEcsTask','stratus','cloudgoat','mitre','awsCorrelation','awsIr']
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
    sources: ['hacktricks','offensiveCloud','stratus','awsDetectionCloudTrail','awsCloudTrailInvestigation','awsCorrelation','awsIr']
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
    sources: ['vault','hacktricks','offensiveCloud','stratus','awsDetectionSecurityGroup','prowler','awsIr']
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
    sources: ['offensiveCloud','stratus','awsDetectionS3Public','prowler','mitre','awsAiRansomware','awsAiData','awsIr']
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
    sources: ['offensiveCloud','pacu','stratus','awsSsmRunCommand','awsAutomation','awsIr']
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
  },
  {
    id: 'cloudformation-template-role-escalation',
    title: 'Mutable template to privileged stack execution',
    kicker: 'TEMPLATE WRITE -> SERVICE ROLE USE -> PRIVILEGED RESOURCE',
    summary: 'An actor who can alter a referenced CloudFormation template and reach a stack update path inserts an IAM resource. CloudFormation then creates it with the stack service role rather than the actor\'s direct permissions.',
    confidence: 'Demonstrated by cited research and bounded by documented CloudFormation service-role behavior; requires template write access plus a stack deployment path',
    mitre: ['T1078.004','T1098.003'],
    services: ['iam','s3','cloudformation','cloudtrail','config'],
    stages: [
      {service:'iam',title:'Two permissions become one path',detail:'The path requires control over template content and a way to create, update, or execute a change set for a stack that uses a more privileged service role.',signal:'Identify the template writer, stack operator, role session, source identity, source IP, and whether these were separate principals.'},
      {service:'s3',title:'Referenced template content changes',detail:'A template at a mutable S3 location gains an IAM resource or another privileged resource before CloudFormation consumes it.',signal:'Preserve object version IDs, hashes, data-event records, bucket policy, and the exact TemplateURL or change-set input. A latest-object snapshot is not sufficient.'},
      {service:'cloudformation',title:'The stack executes the changed template',detail:'CreateStack, UpdateStack, or ExecuteChangeSet causes CloudFormation to act with the stack service role. AWS warns that users with stack-operation permissions can use that attached role.',signal:'Preserve stack events, template body, change set, parameters, capabilities, service-role ARN, client request token, and matching CloudTrail events.'},
      {service:'iam',title:'A privileged identity resource appears',detail:'The injected resource can create or modify a role, policy, user, or credential within the service role\'s authority.',signal:'Join the CloudFormation operation to IAM events through time, actor context, stack resources, tags, and CloudTrail invokedBy fields; verify the resulting permissions directly.'},
      {service:'config',title:'Drift and resource history confirm state',detail:'AWS Config history can show the resulting resource and later changes when recording was enabled for the resource type.',signal:'Compare configuration history with the reviewed template and deployment artifacts. Missing Config history is a coverage gap, not proof the change did not occur.'}
    ],
    detect: ['Alert on stack operations using sensitive service roles and review the submitted template or change set before execution.', 'Version and integrity-check template artifacts, then correlate S3 object writes with CreateChangeSet, UpdateStack, and ExecuteChangeSet.', 'Hunt for IAM resources created through CloudFormation and confirm that every resulting permission matches reviewed infrastructure code.'],
    contain: ['Preserve the template versions, change sets, stack events, role policies, and CloudTrail records before changing resources.', 'Revoke the template-writer and stack-operator sessions, then block further stack updates through the affected role while impact is scoped.', 'Remove unauthorized IAM access through a reviewed stack correction or controlled response procedure; account for dependencies before deleting resources.'],
    harden: ['Store templates in versioned, write-restricted artifact locations and deploy immutable object versions or verified hashes.', 'Keep CloudFormation service roles narrowly scoped and separate template publication from stack execution.', 'Require change-set review for IAM and other high-impact resource types, with drift detection and out-of-band change alerts.'],
    sources: ['offensiveCloud','bishopIamVulnerable','rhinoCloudFormation','awsCloudFormationRole','awsCloudTrailInvestigation','awsIr']
  },
  {
    id: 'athena-valid-role-data-access',
    title: 'Valid analyst role queries sensitive data',
    kicker: 'VALID SESSION -> ATHENA QUERY -> S3 RESULTS',
    summary: 'A compromised or overprivileged analyst session uses Athena to query catalogued data and writes results to an allowed S3 location. The incident spans identity, query history, source objects, and the result bucket.',
    confidence: 'Documented service behavior, not a service vulnerability; requires Athena execution plus catalog, source-data, result-bucket, and any KMS permissions',
    mitre: ['T1078.004','T1530'],
    services: ['iam','athena','s3','kms','cloudtrail'],
    stages: [
      {service:'iam',title:'An authorized-looking session is used',detail:'The actor enters through a role or user whose permissions allow the required Athena and data-plane operations.',signal:'Establish the session issuer, source identity, MFA state, source IP, user agent, access key ID, and normal owner of the role.'},
      {service:'athena',title:'A query execution starts',detail:'StartQueryExecution selects a workgroup, catalog, database, and result configuration. CloudTrail records the API activity but omits the SQL query string.',signal:'Preserve queryExecutionId from CloudTrail and retrieve authorized query-history details through Athena; compare workgroup and output configuration with the baseline.'},
      {service:'s3',title:'Source objects are read and results are written',detail:'The session and Athena execution rely on permitted source objects and an S3 output location; encryption can add KMS authorization requirements.',signal:'Use S3 data events, result-object metadata, version IDs, access logs where available, and KMS events to prove which data paths were used.'},
      {service:'cloudtrail',title:'Identity and data evidence are joined',detail:'Control-plane records establish the query request while configured S3 and KMS data events help scope access and output.',signal:'Join by time, access key, session, Region, query execution, bucket, object key, and encryption context. Do not infer rows returned from StartQueryExecution alone.'}
    ],
    detect: ['Baseline Athena workgroups, principals, catalogs, databases, output buckets, and normal query times; alert on meaningful deviations.', 'Correlate StartQueryExecution with S3 and KMS data events and retain query history long enough for incident response.', 'Investigate output-location changes, cross-account result buckets, disabled workgroup enforcement, and unusually broad source reads.'],
    contain: ['Revoke the affected session and restrict Athena, source-bucket, result-bucket, Glue catalog, and KMS permissions without destroying query evidence.', 'Preserve query history and result objects under evidence controls before removing unauthorized copies.', 'Scope exposed datasets and downstream access from the result bucket before rotating keys or restoring normal analyst access.'],
    harden: ['Use enforced workgroup settings, dedicated result buckets, least-privilege catalog and object access, and KMS controls.', 'Separate sensitive datasets by role and account boundaries instead of relying only on query conventions.', 'Log required S3 and KMS data events, retain Athena history, and test joins between query, identity, and object evidence.'],
    sources: ['awsAthenaTrail','awsAiData','awsCloudTrailInvestigation','awsIr']
  },
  {
    id: 'kinesis-cross-account-stream-access',
    title: 'Stream policy opens a cross-account reader',
    kicker: 'POLICY CHANGE -> EXTERNAL PRINCIPAL -> STREAM READ',
    summary: 'A principal with Kinesis policy authority grants another account access to a stream. When the external identity also has the required identity policy and encryption access, it can read records through the documented cross-account model.',
    confidence: 'Documented service behavior, not a service vulnerability; requires resource-policy authority, an external identity policy, network/API reachability, and KMS access when applicable',
    mitre: ['T1078.004','T1530'],
    services: ['iam','kinesis','kms','cloudtrail'],
    stages: [
      {service:'iam',title:'Stream-policy authority is used',detail:'The initiating principal must be allowed to call PutResourcePolicy for the target stream or consumer.',signal:'Identify the caller, session issuer, source identity, source IP, user agent, Region, and prior use of this permission.'},
      {service:'kinesis',title:'A cross-account grant is written',detail:'The resource policy names an external principal and allowed Kinesis actions. AWS documents that the external account must also grant its principal corresponding identity permissions.',signal:'Preserve the policy before and after, resource ARN, principal, actions, conditions, event record, and approved sharing inventory.'},
      {service:'kms',title:'Encryption authorization completes the path',detail:'For a customer-managed encrypted stream, the external principal also needs the applicable KMS permissions and key-policy path.',signal:'Review key policy and grants, then correlate Decrypt or GenerateDataKey activity using the key ARN and encryption context. Do not assume policy change equals readable data.'},
      {service:'cloudtrail',title:'Reads establish actual use',detail:'GetRecords or SubscribeToShard activity, when covered by the configured event selectors and service logging, distinguishes an unused grant from accessed records.',signal:'Validate selector coverage, then join policy changes and read calls by resource, external account, principal, access key, source IP, time, and consumer ARN.'}
    ],
    detect: ['Continuously inventory Kinesis resource policies and alert on new accounts, wildcard principals, widened actions, or removed conditions.', 'Correlate PutResourcePolicy with KMS policy or grant changes and subsequent external-principal read activity.', 'Verify CloudTrail coverage for the Kinesis operations under investigation; treat a missing event as inconclusive when selectors do not cover it.'],
    contain: ['Preserve the stream policy, key policy, grants, consumer inventory, and event records before revoking the unapproved grant.', 'Revoke the modifying session and coordinate with the external account owner when a legitimate trust relationship may be affected.', 'Scope records available during the grant window and rotate only downstream secrets or credentials confirmed to be present.'],
    harden: ['Limit PutResourcePolicy and KMS policy changes to controlled deployment roles with review.', 'Use exact external principals, minimal actions, resource constraints, and organization or account conditions where the design permits.', 'Alert on policy drift and test that external-access telemetry is present before relying on it for incident response.'],
    sources: ['awsKinesisPolicy','awsKinesisTrail','awsCloudTrailInvestigation','awsIr']
  },
  {
    id: 'opensearch-domain-policy-exposure',
    title: 'Domain policy widens a reachable search surface',
    kicker: 'DOMAIN CHANGE -> REACHABLE ENDPOINT -> INDEX ACCESS',
    summary: 'A principal with OpenSearch domain administration rights broadens an access policy or endpoint authorization. Data becomes reachable only where network placement, domain policy, and fine-grained access control together permit it.',
    confidence: 'Documented control interaction, not a service vulnerability; requires domain configuration authority and a reachable endpoint, and remains bounded by fine-grained access control when enabled',
    mitre: ['T1078.004','T1213'],
    services: ['iam','opensearch','vpc','cloudwatch','cloudtrail'],
    stages: [
      {service:'iam',title:'Domain administration is used',detail:'The actor must already be able to update domain configuration, change endpoint access, or authorize VPC endpoint access.',signal:'Establish the principal, session issuer, source identity, source IP, user agent, Region, and expected change path.'},
      {service:'opensearch',title:'An access boundary is widened',detail:'UpdateDomainConfig can change a domain access policy and related security options; VPC endpoint APIs can authorize another AWS account to create a managed endpoint to the domain.',signal:'Preserve access policies, endpoint options, fine-grained security settings, authentication configuration, VPC endpoint authorizations, and configuration-change status.'},
      {service:'vpc',title:'Network reachability determines exposure',detail:'A VPC domain remains subject to routing, security groups, endpoint placement, and name resolution; a broad resource policy alone does not make it internet reachable.',signal:'Capture VPC configuration, security-group changes, endpoint inventories, flow records where enabled, and the tested source-to-endpoint path.'},
      {service:'cloudwatch',title:'Audit records show index-level activity',detail:'When OpenSearch audit logs were enabled and published, they can record authentication, authorization, REST, and index activity beyond CloudTrail control-plane events.',signal:'Preserve audit-log groups, resource policies, retention, delivery status, requester identity, indices, requests, and responses without assuming disabled logs were available.'},
      {service:'cloudtrail',title:'Configuration events anchor the timeline',detail:'CloudTrail records OpenSearch Service configuration API calls and the actor that made them, while data-plane proof comes from audit and network evidence.',signal:'Correlate UpdateDomainConfig and VPC endpoint-access events with configuration completion, network evidence, audit records, and confirmed document access.'}
    ],
    detect: ['Diff domain access policies, endpoint options, fine-grained security, identity providers, and VPC endpoint authorizations against a reviewed baseline.', 'Correlate domain configuration changes with security-group, route, endpoint, and CloudWatch log-delivery changes.', 'Use audit logs to prove index access when enabled; configuration exposure without access evidence should be described as exposure, not confirmed collection.'],
    contain: ['Preserve the domain configuration, policy versions, authorization state, CloudTrail records, audit logs, and network evidence before restoring boundaries.', 'Revoke the changing session and restrict endpoint reachability or policy access using the least disruptive verified control.', 'Scope indices, queries, writes, and returned documents before rotating credentials or rebuilding affected application state.'],
    harden: ['Keep OpenSearch domains private where appropriate and make domain, network, and fine-grained access controls mutually restrictive.', 'Limit UpdateDomainConfig and VPC endpoint authorization to controlled roles with policy review and drift alerts.', 'Enable and retain appropriately scoped audit logs, protect their CloudWatch destination, and routinely validate end-to-end delivery.'],
    sources: ['awsOpenSearchAccess','awsOpenSearchAudit','awsCloudTrailInvestigation','awsIr']
  },
  {
    id: 'ssm-run-command-host-execution',
    title: 'Run Command turns cloud authority into host execution',
    kicker: 'VALID SESSION -> MANAGEMENT COMMAND -> HOST EXECUTION',
    summary: 'A principal allowed to use Systems Manager Run Command selects a managed EC2 node and an approved command document. The action crosses from AWS control-plane authority into the operating-system context of SSM Agent. The document, target, output settings, and host evidence determine impact.',
    confidence: 'Documented Systems Manager behavior and a cited community technique; requires an online managed node plus permission for SendCommand, the selected document, and the target',
    mitre: ['T1078.004','T1651','T1059'],
    services: ['iam','systemsmanager','ec2','cloudwatch','s3','cloudtrail'],
    stages: [
      {service:'iam',title:'A session has command authority',detail:'The initiating identity must be allowed to call SendCommand against both the selected Systems Manager document and the managed-node targets. Pass-through permissions, tag conditions, and document restrictions determine the actual boundary.',signal:'Establish the caller ARN, session issuer, source identity, MFA state, source IP, user agent, policies, permission boundaries, and target and document conditions.'},
      {service:'systemsmanager',title:'Run Command dispatches a document',detail:'SendCommand identifies a document, document version, targets or instance IDs, parameters, concurrency and error controls, and optional output destinations. A successful API call means the request was accepted, not that every target executed it.',signal:'Preserve the command ID, document name and version, target selectors, requested parameters where recorded, timeout, concurrency, error threshold, notification settings, and invocation status per node.'},
      {service:'ec2',title:'SSM Agent processes the command on the node',detail:'An online managed node receives the document through SSM Agent and runs the applicable plugin in the agent’s configured operating-system context. Host configuration and the document decide which local actions are possible.',signal:'Collect SSM Agent logs, process creation, shell or PowerShell history where available, EDR events, file changes, network activity, logged-on users, and the node’s instance-profile and registration state.'},
      {service:'cloudwatch',title:'Configured output becomes response evidence',detail:'Run Command can stream command output to CloudWatch Logs or write output to S3 when those options were configured and their delivery permissions worked. Neither destination is automatic evidence for every command.',signal:'Verify the exact CloudWatch log group and S3 output settings, delivery status, retention and bucket versions; reconcile them with invocation output and host telemetry rather than assuming output was complete.'},
      {service:'cloudtrail',title:'Control-plane events anchor the sequence',detail:'CloudTrail records Systems Manager API activity such as SendCommand and follow-on administrative actions. Command execution and host impact still require Systems Manager and endpoint evidence.',signal:'Join the SendCommand event to command ID, caller session, document, targets, Region, invocation history, host timeline, output objects or log streams, and any downstream AWS API activity.'}
    ],
    detect: ['Alert when SendCommand uses an unexpected principal, document, document version, target set, Region, source network, or time window.', 'Correlate SendCommand with command invocation status, CloudWatch or S3 delivery, and process and network telemetry on each selected node.', 'Hunt for commands against sensitive fleets, broad tag targets, public documents, unusual concurrency, disabled output, or subsequent use of the node’s instance role.'],
    contain: ['Preserve command history, CloudTrail, SSM Agent logs, output destinations, and endpoint telemetry before terminating active commands or isolating nodes.', 'Revoke the initiating session and restrict SendCommand, document use, and target access while preserving authorized fleet-management paths.', 'Isolate confirmed affected nodes, scope local changes and downstream AWS activity, and rebuild or restore through the approved recovery process when integrity cannot be established.'],
    harden: ['Allow only approved documents and narrow node targets with explicit resource and tag conditions; separate document authors from command operators.', 'Protect and retain CloudTrail, command history, SSM Agent logs, and configured CloudWatch or S3 output in a security-owned destination.', 'Use private connectivity where appropriate, minimize managed-node roles, monitor association and document changes, and routinely test command attribution end to end.'],
    sources: ['offensiveCloud','awsSsmRunCommand','awsCloudTrailInvestigation','awsIr']
  },
  {
    id: 'ebs-snapshot-cross-account-exposure',
    title: 'Snapshot permission becomes an offline data path',
    kicker: 'SNAPSHOT AUTHORITY -> EXTERNAL SHARE -> OFFLINE ACCESS',
    summary: 'A principal changes an EBS snapshot’s createVolumePermission so another account—or, for an unencrypted snapshot, the public—can use it. The recipient can create a volume or copy the snapshot and inspect data without reaching the original instance.',
    confidence: 'Documented EBS sharing behavior and cited research; requires snapshot-modification authority, and encrypted snapshots additionally require a customer-managed KMS key shared with the recipient',
    mitre: ['T1078.004','T1537'],
    services: ['iam','ec2','kms','cloudtrail'],
    stages: [
      {service:'iam',title:'Snapshot-sharing authority is used',detail:'The initiating principal must be able to change the snapshot attribute. Effective IAM policy, organization controls, snapshot ownership, and Block Public Access for EBS snapshots constrain the request.',signal:'Identify the caller session, source, Region, affected snapshot owner, effective policies, organization guardrails, and whether the change followed an approved backup or migration workflow.'},
      {service:'ec2',title:'Create-volume permission is widened',detail:'ModifySnapshotAttribute can grant selected AWS accounts permission to use a private snapshot. An unencrypted snapshot can also be made public when account and Regional controls allow it; encrypted snapshots cannot be public.',signal:'Preserve the before-and-after createVolumePermission, snapshot ID, owner, description, tags, source volume and instance, encryption flag, key ARN, and the exact CloudTrail request.'},
      {service:'kms',title:'Encryption either blocks or completes sharing',detail:'A snapshot encrypted with the default AWS managed key cannot be shared. A snapshot using a customer-managed key requires a separate valid KMS authorization path for the recipient; snapshot permission alone does not make it usable.',signal:'Capture the key policy, grants, aliases, enabled state, recipient principal, encryption context, and KMS events. Record a failed key path as a constraint, not as proof that no sharing was attempted.'},
      {service:'ec2',title:'The recipient creates an offline copy',detail:'An authorized recipient can copy the shared snapshot or create a volume from it, attach that volume to an instance it controls, and inspect the filesystem independently of the source workload.',signal:'Correlate CopySnapshot, CreateVolume and AttachVolume activity where visible, recipient account, copied snapshot or volume IDs, tags, timing, and any sanctioned migration record.'},
      {service:'cloudtrail',title:'Permission and copy events form the timeline',detail:'EC2 management events anchor the sharing and local resource operations. Cross-account visibility may be incomplete unless logs from both accounts are available.',signal:'Join the permission change, snapshot copy or volume creation, KMS activity, and reversal by snapshot ID, owner, recipient account, key ARN, access key, source IP, Region, and time.'}
    ],
    detect: ['Alert on ModifySnapshotAttribute that adds an unfamiliar account or the all group, and independently inventory the resulting effective sharing state.', 'Correlate snapshot sharing with KMS key-policy or grant changes and subsequent CopySnapshot, CreateVolume, or AttachVolume activity.', 'Prioritize snapshots tied to sensitive systems, directories, databases, identity stores, or secrets; permission change alone does not prove the recipient read data.'],
    contain: ['Preserve snapshot attributes, CloudTrail, key configuration, and related resource identifiers before removing unauthorized permissions.', 'Revoke the initiating session, remove unapproved account or public access, and constrain the KMS key without disrupting legitimate encrypted workloads.', 'Coordinate with the recipient account owner and data owners to determine whether a copy or volume was created and which data requires downstream response.'],
    harden: ['Enable Block Public Access for EBS snapshots in every governed Region and continuously inventory cross-account snapshot permissions.', 'Restrict ModifySnapshotAttribute and KMS policy or grant administration to reviewed backup and migration roles.', 'Use customer-managed keys with narrow policies for approved sharing, tag snapshot ownership and sensitivity, and alert on permission drift.'],
    sources: ['offensiveCloud','rhinoEbsSnapshots','awsEbsSnapshotPermissions','awsCloudTrailInvestigation','awsIr']
  },
  {
    id: 's3-replication-cross-account-exfiltration',
    title: 'Replication configuration becomes an exfiltration route',
    kicker: 'CONFIGURATION CHANGE -> SERVICE ROLE -> CROSS-ACCOUNT COPY',
    summary: 'A principal able to configure S3 replication and pass a suitable role points eligible objects at a destination bucket in another account. S3 then performs asynchronous copies through the configured role, with additional KMS permissions required for SSE-KMS objects.',
    confidence: 'Documented cross-account replication behavior and a cited community attack path; requires PutReplicationConfiguration, PassRole, a usable replication role, destination authorization, versioning, and any necessary KMS permissions',
    mitre: ['T1078.004','T1537','T1530'],
    services: ['iam','s3','kms','cloudtrail'],
    stages: [
      {service:'iam',title:'Configuration and role permissions combine',detail:'The actor needs authority to set the replication configuration and pass a role that S3 can assume. The role trust and policies, destination bucket policy, and organization controls must together permit the copy path.',signal:'Identify the caller session, iam:PassRole decision, replication-role ARN, role trust, policy versions, destination owner, source IP, Region, and approved data-movement design.'},
      {service:'s3',title:'The bucket gains a replication rule',detail:'PutBucketReplication writes a rule containing status, priority, filters, destination, storage class and optional ownership, delete-marker, metrics, and encryption settings. Source and destination buckets must be versioning-enabled.',signal:'Preserve the full replication configuration before and after, bucket versioning, rule IDs, destination ARN and account, filters, ownership settings, role ARN, and the CloudTrail management event.'},
      {service:'kms',title:'SSE-KMS objects require another authorization path',detail:'Replicating objects encrypted with AWS KMS requires replication configuration for encrypted objects plus permission to use the source and destination customer-managed keys. A replication rule without that path may exist while encrypted copies fail.',signal:'Capture key ARNs, policies, grants, encryption configuration, replication failure metrics, and KMS events; distinguish unencrypted, SSE-S3, and SSE-KMS object populations.'},
      {service:'s3',title:'Eligible object versions reach the destination',detail:'S3 asynchronously replicates new eligible object versions under the configured rule. Existing objects are not copied by ordinary live replication unless they are re-copied or a separate S3 Batch Replication job is used.',signal:'Use destination object metadata and versions, replication status, source inventory, replication metrics, bucket access evidence where enabled, and destination-account logs to establish what actually moved.'},
      {service:'cloudtrail',title:'Configuration and data evidence are correlated',detail:'CloudTrail management events establish who changed replication. Object and destination evidence, rather than configuration alone, is required to claim successful exfiltration.',signal:'Join PutBucketReplication, role and key changes, source object versions, replication status, destination objects and later reads by bucket, key, version, role session, destination account, Region, and time.'}
    ],
    detect: ['Alert on new or changed replication destinations, roles, filters, ownership settings, RTC or metrics configuration, and KMS key paths—especially external accounts.', 'Continuously diff replication configurations and destination bucket policies, then correlate changes with replication bytes, failed operations, destination versions, and reads.', 'Separate ordinary live replication from S3 Batch Replication and from manual copies; prove the affected object versions before declaring exfiltration.'],
    contain: ['Preserve both bucket configurations, role and key policies, CloudTrail events, inventories, metrics, and destination evidence before disabling an unauthorized rule.', 'Revoke the modifying session and prevent further role assumption or destination writes while coordinating with owners of legitimate replication workflows.', 'Scope object versions already copied and downstream reads in the destination account; removing the rule does not delete replicas that already exist.'],
    harden: ['Restrict PutReplicationConfiguration and iam:PassRole to reviewed deployment roles and approved replication-role ARNs.', 'Constrain destination accounts and buckets with organization-aware policy conditions where the design permits, and review KMS policies separately.', 'Enable configuration drift alerts, versioning, protected evidence logs, replication metrics for sensitive buckets, and a maintained inventory of approved data flows.'],
    sources: ['offensiveCloud','hackingCloudS3Replication','awsS3Replication','awsAiData','awsCloudTrailInvestigation','awsIr']
  }
];

export const scenarioById = id => scenarios.find(s => s.id === id);
export const scenariosForService = id => scenarios.filter(s => s.services.includes(id));
export const scenarioSources = scenario =>
  (scenario?.sources || []).map(key => researchSources[key]).filter(Boolean);
