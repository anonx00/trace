const cli = 'https://docs.aws.amazon.com/cli/latest/reference/';

export const defensiveCommands = {
  iam: {
    title: 'Review identities and attached policy material',
    command: 'aws iam get-account-authorization-details',
    source: cli + 'iam/get-account-authorization-details.html'
  },
  sts: {
    title: 'Confirm the identity behind the current credentials',
    command: 'aws sts get-caller-identity',
    source: cli + 'sts/get-caller-identity.html'
  },
  'identity-center': {
    title: 'List IAM Identity Center instances',
    command: 'aws sso-admin list-instances',
    source: cli + 'sso-admin/list-instances.html'
  },
  organizations: {
    title: 'Confirm organization identity and feature set',
    command: 'aws organizations describe-organization',
    source: cli + 'organizations/describe-organization.html'
  },
  kms: {
    title: 'Read the default key policy',
    command: 'aws kms get-key-policy --key-id <key-id> --policy-name default',
    source: cli + 'kms/get-key-policy.html'
  },
  ec2: {
    title: 'Review instances, roles, networking, and metadata settings',
    command: 'aws ec2 describe-instances',
    source: cli + 'ec2/describe-instances.html'
  },
  lambda: {
    title: 'Read a function resource policy',
    command: 'aws lambda get-policy --function-name <function>',
    source: cli + 'lambda/get-policy.html'
  },
  ecs: {
    title: 'Inspect roles, containers, logging, and image references',
    command: 'aws ecs describe-task-definition --task-definition <task-definition>',
    source: cli + 'ecs/describe-task-definition.html'
  },
  eks: {
    title: 'Review endpoint access, logging, and cluster identity',
    command: 'aws eks describe-cluster --name <cluster>',
    source: cli + 'eks/describe-cluster.html'
  },
  fargate: {
    title: 'Inspect running Fargate tasks and attachments',
    command: 'aws ecs describe-tasks --cluster <cluster> --tasks <task-arn>',
    source: cli + 'ecs/describe-tasks.html'
  },
  s3: {
    title: 'Check the bucket-level public access block',
    command: 'aws s3api get-public-access-block --bucket <bucket>',
    source: cli + 's3api/get-public-access-block.html'
  },
  rds: {
    title: 'Review exposure, encryption, logging, and authentication settings',
    command: 'aws rds describe-db-instances --db-instance-identifier <db-instance>',
    source: cli + 'rds/describe-db-instances.html'
  },
  dynamodb: {
    title: 'Check point-in-time recovery and backup state',
    command: 'aws dynamodb describe-continuous-backups --table-name <table>',
    source: cli + 'dynamodb/describe-continuous-backups.html'
  },
  efs: {
    title: 'Review file-system encryption and lifecycle state',
    command: 'aws efs describe-file-systems --file-system-id <file-system-id>',
    source: cli + 'efs/describe-file-systems.html'
  },
  backup: {
    title: 'List resources covered by AWS Backup',
    command: 'aws backup list-protected-resources',
    source: cli + 'backup/list-protected-resources.html'
  },
  secretsmanager: {
    title: 'Review secret rotation, KMS, and deletion metadata',
    command: 'aws secretsmanager describe-secret --secret-id <secret-id>',
    source: cli + 'secretsmanager/describe-secret.html'
  },
  vpc: {
    title: 'Review security-group ingress and egress rules',
    command: 'aws ec2 describe-security-groups --group-ids <security-group-id>',
    source: cli + 'ec2/describe-security-groups.html'
  },
  route53: {
    title: 'Check DNSSEC signing for a public hosted zone',
    command: 'aws route53 get-dnssec --hosted-zone-id <hosted-zone-id>',
    source: cli + 'route53/get-dnssec.html'
  },
  cloudfront: {
    title: 'Read origin, behavior, TLS, logging, and WAF settings',
    command: 'aws cloudfront get-distribution-config --id <distribution-id>',
    source: cli + 'cloudfront/get-distribution-config.html'
  },
  waf: {
    title: 'Check the logging destination for a web ACL',
    command: 'aws wafv2 get-logging-configuration --resource-arn <web-acl-arn>',
    source: cli + 'wafv2/get-logging-configuration.html'
  },
  elb: {
    title: 'Review listener protocols, certificates, and forwarding actions',
    command: 'aws elbv2 describe-listeners --load-balancer-arn <load-balancer-arn>',
    source: cli + 'elbv2/describe-listeners.html'
  },
  apigateway: {
    title: 'Inspect stage logging, tracing, throttling, and deployment state',
    command: 'aws apigateway get-stages --rest-api-id <rest-api-id>',
    source: cli + 'apigateway/get-stages.html'
  },
  guardduty: {
    title: 'Review detector status and finding publication frequency',
    command: 'aws guardduty get-detector --detector-id <detector-id>',
    source: cli + 'guardduty/get-detector.html'
  },
  cloudtrail: {
    title: 'Check whether a trail is logging and delivering events',
    command: 'aws cloudtrail get-trail-status --name <trail-name-or-arn>',
    source: cli + 'cloudtrail/get-trail-status.html'
  },
  securityhub: {
    title: 'Review Security Hub enablement and control settings',
    command: 'aws securityhub describe-hub',
    source: cli + 'securityhub/describe-hub.html'
  },
  cloudwatch: {
    title: 'Review retention, KMS keys, and stored-byte counts for log groups',
    command: 'aws logs describe-log-groups',
    source: cli + 'logs/describe-log-groups.html'
  },
  config: {
    title: 'Check configuration recorder health and delivery times',
    command: 'aws configservice describe-configuration-recorder-status',
    source: cli + 'configservice/describe-configuration-recorder-status.html'
  },
  systemsmanager: {
    title: 'List managed nodes and agent connectivity state',
    command: 'aws ssm describe-instance-information',
    source: cli + 'ssm/describe-instance-information.html'
  },
  eventbridge: {
    title: 'Review the destinations and roles attached to a rule',
    command: 'aws events list-targets-by-rule --rule <rule-name>',
    source: cli + 'events/list-targets-by-rule.html'
  },
  sns: {
    title: 'Read the topic policy, KMS key, and delivery settings',
    command: 'aws sns get-topic-attributes --topic-arn <topic-arn>',
    source: cli + 'sns/get-topic-attributes.html'
  },
  sqs: {
    title: 'Read queue policy, encryption, retention, and redrive settings',
    command: 'aws sqs get-queue-attributes --queue-url <queue-url> --attribute-names All',
    source: cli + 'sqs/get-queue-attributes.html'
  },
  stepfunctions: {
    title: 'Inspect a state machine definition, role, logging, and tracing',
    command: 'aws stepfunctions describe-state-machine --state-machine-arn <state-machine-arn>',
    source: cli + 'stepfunctions/describe-state-machine.html'
  },
  codepipeline: {
    title: 'Check current stages, actions, and execution status',
    command: 'aws codepipeline get-pipeline-state --name <pipeline>',
    source: cli + 'codepipeline/get-pipeline-state.html'
  },
  cloudformation: {
    title: 'Review stack parameters, role, protection, and current status',
    command: 'aws cloudformation describe-stacks --stack-name <stack-name-or-id>',
    source: cli + 'cloudformation/describe-stacks.html'
  },
  ecr: {
    title: 'Read image scan findings for a deployed digest',
    command: 'aws ecr describe-image-scan-findings --repository-name <repository> --image-id imageDigest=<sha256-digest>',
    source: cli + 'ecr/describe-image-scan-findings.html'
  },
  athena: {
    title: 'Review a workgroup result location and enforcement settings',
    command: 'aws athena get-work-group --work-group <workgroup>',
    source: cli + 'athena/get-work-group.html'
  },
  opensearch: {
    title: 'Review endpoint, network, encryption, logging, and access policy',
    command: 'aws opensearch describe-domain --domain-name <domain>',
    source: cli + 'opensearch/describe-domain.html'
  },
  kinesis: {
    title: 'Inspect stream encryption, retention, capacity, and status',
    command: 'aws kinesis describe-stream-summary --stream-name <stream>',
    source: cli + 'kinesis/describe-stream-summary.html'
  }
};

export const commandFor = id => defensiveCommands[id];
