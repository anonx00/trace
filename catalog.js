import { services as originalServices } from './data.js';

export const reviewed = '8 September 2026';
const root = 'https://docs.aws.amazon.com/';
const extra = (id, name, label, summary, doc) => ({ id, name, label, summary, doc });
const allServices = [...originalServices,
  extra('organizations','AWS Organizations','Multi-account governance','AWS Organizations centrally manages AWS accounts, groups them into organizational units, and applies governance policies.','organizations/latest/userguide/orgs_introduction.html'),
  extra('fargate','AWS Fargate','Serverless containers','Fargate runs containers for Amazon ECS without requiring you to provision or manage a cluster of EC2 instances.','AmazonECS/latest/developerguide/AWS_Fargate.html'),
  extra('efs','Amazon EFS','Shared file storage','Amazon Elastic File System provides managed, elastic file storage for use with AWS compute services and on-premises resources.','efs/latest/ug/whatisefs.html'),
  extra('elb','Elastic Load Balancing','Traffic distribution','Elastic Load Balancing distributes incoming traffic across multiple targets and monitors their health.','elasticloadbalancing/latest/userguide/what-is-load-balancing.html'),
  extra('config','AWS Config','Resource configuration history','AWS Config records supported resource configurations and relationships and evaluates configurations against rules.','config/latest/developerguide/WhatIsConfig.html'),
  extra('systemsmanager','AWS Systems Manager','Fleet operations','Systems Manager helps manage nodes across AWS, on-premises, and other cloud environments from a central interface.','systems-manager/latest/userguide/what-is-systems-manager.html'),
  extra('sns','Amazon SNS','Publish / subscribe','Amazon Simple Notification Service sends messages from publishers to subscribers through topics. Subscribers can include applications and supported notification endpoints.','sns/latest/dg/welcome.html'),
  extra('sqs','Amazon SQS','Message queues','Amazon Simple Queue Service provides managed message queues to decouple distributed application components.','AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html'),
  extra('eventbridge','Amazon EventBridge','Event routing','EventBridge connects application components through events. Event buses route matching events to targets using rules.','eventbridge/latest/userguide/eb-what-is.html'),
  extra('stepfunctions','AWS Step Functions','Workflow orchestration','Step Functions coordinates application components through state-machine workflows, including tasks, choices, and parallel branches.','step-functions/latest/dg/welcome.html'),
  extra('apigateway','Amazon API Gateway','Managed APIs','API Gateway creates and manages REST, HTTP, and WebSocket APIs that access backend services.','apigateway/latest/developerguide/welcome.html'),
  extra('athena','Amazon Athena','SQL over data','Athena is an interactive analytics service. It can query data in Amazon S3 using standard SQL without infrastructure provisioning.','athena/latest/ug/what-is.html'),
  extra('glue','AWS Glue','Data integration','AWS Glue provides data discovery, preparation, and integration capabilities, including a central Data Catalog.','glue/latest/dg/what-is-glue.html'),
  extra('kinesis','Kinesis Data Streams','Streaming data','Kinesis Data Streams collects and processes streams of data records in real time. Applications produce and consume records through streams.','streams/latest/dev/introduction.html'),
  extra('opensearch','Amazon OpenSearch Service','Search & analytics','OpenSearch Service manages the deployment and operation of OpenSearch clusters for search and analytics workloads.','opensearch-service/latest/developerguide/what-is.html'),
  extra('redshift','Amazon Redshift','Data warehouse','Amazon Redshift is a managed cloud data warehouse for analyzing data using SQL.','redshift/latest/mgmt/welcome.html'),
].map(s=>({...s, source: root+(s.id==='sts'?'STS/latest/APIReference/API_AssumeRole.html':s.doc), short: s.name.replace(/^(Amazon |AWS )/, '')}));

// Glue and Redshift are valuable AWS services, but they did not earn a place in
// this incident-response-focused edition. The map is intentionally a curated
// security surface rather than a general product catalog.
export const services = allServices.filter(s=>!['glue','redshift'].includes(s.id));

export const domains = [
  {id:'identity',name:'Identity & trust',short:'Identity',color:'#c3adff',icon:'key',description:'Trace principals, temporary sessions, account guardrails, and cryptographic authority.',services:['iam','sts','identity-center','organizations','kms'],x:450,y:220},
  {id:'runtime',name:'Workload & runtime',short:'Runtime',color:'#ffbd91',icon:'chip',description:'Investigate the code, containers, hosts, roles, and network paths where workloads execute.',services:['ec2','lambda','ecs','eks','fargate'],x:885,y:180},
  {id:'data',name:'Data protection',short:'Data',color:'#97d5bd',icon:'database',description:'Model access, encryption, recovery, and destructive paths across high-value data stores.',services:['s3','rds','dynamodb','efs','backup','secretsmanager'],x:1275,y:320},
  {id:'edge',name:'Network & edge',short:'Edge',color:'#90c9f2',icon:'network',description:'See how traffic reaches workloads through routing, DNS, APIs, load balancers, and edge controls.',services:['vpc','route53','cloudfront','waf','elb','apigateway'],x:1270,y:690},
  {id:'detection',name:'Detection & evidence',short:'Detection',color:'#d9e894',icon:'shield',description:'Preserve the findings, API history, configuration state, metrics, and logs used during triage.',services:['guardduty','cloudtrail','securityhub','cloudwatch','config'],x:890,y:855},
  {id:'response',name:'Response automation',short:'Response',color:'#eeaaca',icon:'workflow',description:'Route, queue, orchestrate, and execute contained response actions with an auditable control plane.',services:['systemsmanager','eventbridge','sns','sqs','stepfunctions'],x:450,y:815},
  {id:'supply',name:'Software supply chain',short:'Supply chain',color:'#9bdade',icon:'layers',description:'Protect templates, images, artifacts, release identities, and the path into production.',services:['codepipeline','cloudformation','ecr'],x:150,y:595},
  {id:'investigation',name:'Security investigation',short:'Investigation',color:'#b6bbf2',icon:'chart',description:'Stream, index, and query security evidence while preserving its access and provenance.',services:['athena','opensearch','kinesis'],x:135,y:305},
];
export const serviceById = id => services.find(s=>s.id===id);
export const domainById = id => domains.find(d=>d.id===id);
export const domainFor = id => domains.find(d=>d.services.includes(id));

// Each relationship below has a specific official source. These are documented
// capabilities; they do not assert that an integration is configured in an account.
const link = (from,to,label,detail,path) => ({from,to,label,detail,source:root+path});
export const connections = [
  // Additional capability sources checked 9 September 2026.
  link("codepipeline","cloudformation","Can deploy a CloudFormation stack","A configured CloudFormation deploy action runs stack or change-set operations. Its action mode and IAM roles determine what it can do.","codepipeline/latest/userguide/action-reference-CloudFormation.html"),
  link("cloudformation","iam","Can operate through a service role","A stack can have an IAM service role that CloudFormation uses for resource operations. The role permissions define its authority.","AWSCloudFormation/latest/UserGuide/using-iam-servicerole.html"),
  link("ecr","cloudtrail","Records ECR API activity","CloudTrail captures ECR API calls for audit history. Retention and delivery depend on the CloudTrail configuration.","AmazonECR/latest/userguide/logging-using-cloudtrail.html"),
  link("ecs","ecr","Can pull container images","ECS task definitions can reference ECR images. Pull permissions and the execution environment must be configured.","AmazonECR/latest/userguide/ECR_on_ECS.html"),
  link("identity-center","iam","Provisions account-access roles","Assigning a permission set provisions corresponding IAM roles and policies in the assigned AWS accounts.","singlesignon/latest/userguide/permissionsetsconcept.html"),
  link("eks","iam","Supports Pod Identity roles","EKS Pod Identity associates an IAM role with a Kubernetes service account in a cluster namespace. It requires an association and supported workload configuration.","eks/latest/userguide/pod-identities.html"),
  link("rds","kms","Protects encrypted database resources","RDS encryption uses AWS KMS keys to protect encrypted database resources. Availability depends on access to the encryption key.","AmazonRDS/latest/UserGuide/Overview.Encryption.html"),
  link("dynamodb","kms","Uses keys for encryption at rest","DynamoDB encryption at rest integrates with AWS KMS. The selected key type determines key management and access controls.","amazondynamodb/latest/developerguide/encryption.usagenotes.html"),
  link("backup","kms","Uses backup encryption keys","AWS Backup encryption depends on the resource type: some backups use independent encryption and others inherit source encryption. Consult the resource-specific table.","aws-backup/latest/devguide/encryption.html"),
  link("waf","cloudwatch","Can publish web ACL traffic logs","AWS WAF can deliver configured web ACL traffic logs to a CloudWatch Logs log group. Log destination permissions and configuration apply.","waf/latest/developerguide/logging-cw-logs.html"),
  link("securityhub","eventbridge","Publishes CSPM finding events","Security Hub CSPM finding events can be matched by EventBridge rules. A configured rule and target determine the downstream response.","securityhub/latest/userguide/securityhub-cwe-all-findings.html"),
  link("efs","kms","Supports encryption at rest","Encrypted EFS file systems use AWS KMS for key management. Key permissions and file-system access permissions are separate controls.","efs/latest/ug/encryption-at-rest.html"),
  link("elb","s3","Can store ALB access logs","Application Load Balancer access logging can deliver request logs to an S3 bucket when enabled. This relationship describes ALBs, not every load balancer type.","elasticloadbalancing/latest/application/load-balancer-access-logs.html"),
  link("config","sns","Can notify configuration changes","AWS Config can send configuration and compliance notifications to SNS after the configuration recorder and delivery channel are set up.","config/latest/developerguide/notifications-for-AWS-Config.html"),
  link("systemsmanager","cloudwatch","Can export session logs","Session Manager can send supported session log data to CloudWatch Logs when configured. Consult session logging limitations for the session type in use.","systems-manager/latest/userguide/session-manager-logging-cloudwatch-logs.html"),
  link("stepfunctions","lambda","Can invoke a function","A Step Functions task can invoke Lambda synchronously or asynchronously. The state-machine definition and IAM permissions govern the invocation.","step-functions/latest/dg/connect-lambda.html"),
  link("apigateway","lambda","Supports REST API integrations","API Gateway REST APIs support Lambda proxy and custom integrations. Method configuration and invocation permissions determine the request path.","apigateway/latest/developerguide/set-up-lambda-integrations.html"),
  link("kinesis","kms","Supports stream encryption","Kinesis Data Streams supports server-side encryption with AWS KMS keys. Stream encryption configuration and key permissions apply.","streams/latest/dev/server-side-encryption.html"),
  link("opensearch","cloudwatch","Can publish audit logs","OpenSearch Service audit logging sends configured audit events to CloudWatch Logs and requires fine-grained access control.","opensearch-service/latest/developerguide/audit-logs.html"),

  link('lambda','iam','Uses an execution role','A Lambda execution role grants the function permissions to access AWS services and resources.','lambda/latest/dg/lambda-intro-execution-role.html'),
  link('ecs','iam','Uses a task role','An ECS task IAM role gives containers in a task credentials to call AWS APIs. The task execution role is a separate role.','AmazonECS/latest/developerguide/task-iam-roles.html'),
  link('cloudfront','s3','Can use a private S3 origin','CloudFront origin access control can restrict a supported S3 origin to access through a distribution. It requires configuration; it is not automatic.','AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html'),
  link('s3','kms','Supports SSE-KMS encryption','S3 can use KMS keys for server-side encryption. Key permissions and S3 permissions both matter for access.','AmazonS3/latest/userguide/UsingKMSEncryption.html'),
  link('guardduty','cloudtrail','Analyzes management events','GuardDuty consumes an independent stream of CloudTrail management events. Changing a trail does not control this stream.','guardduty/latest/ug/guardduty_data-sources.html'),
  link('guardduty','vpc','Analyzes network flow data','GuardDuty consumes an independent stream of VPC flow data. You do not need to configure customer VPC Flow Logs for this analysis.','guardduty/latest/ug/guardduty_data-sources.html'),
  link('guardduty','route53','Analyzes resolver DNS data','GuardDuty analyzes supported queries made through AWS DNS resolvers using a separate data stream. Third-party resolvers are not covered by that source.','guardduty/latest/ug/guardduty_data-sources.html'),
  link('cloudtrail','s3','Can record object data events','S3 object-level activity can be recorded as CloudTrail data events. Relevant data-event logging must be configured; event history is not an object-access log.','awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html'),
  link('fargate','ecs','Runs ECS tasks','ECS tasks can use Fargate capacity to run containers without managing EC2 hosts.','AmazonECS/latest/developerguide/AWS_Fargate.html'),
  link('athena','s3','Queries data in S3','Athena supports querying data stored in S3 using SQL. Access and query configuration still apply.','athena/latest/ug/what-is.html'),
  link('organizations','iam','Provides governance boundaries','Organizations policies provide governance for accounts and organizational units. Service control policies bound permissions; they do not grant them.','organizations/latest/userguide/orgs_manage_policies_scps.html'),
  link('sts','iam','Issues role-session credentials','The STS AssumeRole operation returns temporary security credentials for an IAM role session.','STS/latest/APIReference/API_AssumeRole.html'),
  link('ec2','iam','Can use an instance role','Applications on EC2 can use an attached IAM role through an instance profile to obtain temporary credentials.','AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html'),
  link('lambda','cloudwatch','Sends function logs','Lambda sends function logs to CloudWatch Logs when the execution role has the required permissions.','lambda/latest/dg/monitoring-cloudwatchlogs.html'),
  link('secretsmanager','kms','Encrypts secret values','Secrets Manager uses AWS KMS envelope encryption to protect stored secret values.','secretsmanager/latest/userguide/security-encryption.html'),
  link('sns','sqs','Can deliver to a queue','An SQS queue can subscribe to an SNS topic. Subscription and queue permissions determine delivery.','sns/latest/dg/sns-sqs-as-subscriber.html'),
];

export const insights = [
  {id:'telemetry',title:'One event. Two different paths.',tag:'DETECTION CONCEPT',description:'Understand why a configured CloudTrail trail and GuardDuty analysis are different evidence paths.',services:['cloudtrail','guardduty','s3'],body:'GuardDuty consumes CloudTrail management events through an independent stream. Customer trail settings do not control that stream. Preserve and retain your own events for investigation; GuardDuty does not replace your log archive.',source:root+'guardduty/latest/ug/guardduty_data-sources.html'},
  {id:'object-access',title:'Configuration is not object access.',tag:'EVIDENCE CONCEPT',description:'Separate management activity from object-level data events when investigating S3.',services:['s3','cloudtrail'],body:'CloudTrail data events describe activity on or within supported resources, including S3 object operations. Data-event logging is configured separately, and data events are not shown in CloudTrail event history.',source:root+'awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html'},
  {id:'workload-role',title:'The identity behind a workload.',tag:'IDENTITY CONCEPT',description:'Explore the role a function or container uses to access AWS resources.',services:['lambda','iam','ecs'],body:'Lambda uses an execution role for its AWS permissions. In ECS, the task role grants permissions to application containers, while the task execution role supports actions performed by the ECS agent. These are distinct responsibilities.',source:root+'AmazonECS/latest/developerguide/task-iam-roles.html',sources:[root+'lambda/latest/dg/lambda-intro-execution-role.html']},
];
