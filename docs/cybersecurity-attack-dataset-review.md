# Cybersecurity Attack Dataset review

Reviewed 11 September 2026 for possible AWS node enrichment in TRACE.

## Source snapshot

- Dataset: [savaniDhruv/Cybersecurity_Attack_Dataset](https://huggingface.co/datasets/savaniDhruv/Cybersecurity_Attack_Dataset)
- Revision: `878cd3b46278018e17a1aa9333ff67896fe5fa03`
- CSV SHA-256: `130e90c57e33d1791a3f2aad07855dcc80e7d6b0727ecd421376abc2550283d4`
- Downloaded CSV: 18,290,701 bytes; 14,133 rows; 16 columns
- Dataset card: MIT-labeled, but otherwise empty; it provides no collection method, provenance, citation, validation process, limitations, or real-versus-synthetic declaration

The CSV is a prose scenario catalog, not incident telemetry. Its fields are `ID`, `Title`, `Category`, `Attack Type`, `Scenario Description`, `Tools Used`, `Attack Steps `, `Target Type`, `Vulnerability`, `MITRE Technique`, `Impact`, `Detection Method`, `Solution`, `Tags`, `Source`, and an unnamed trailing column.

## Quality findings

- 228 duplicate-content groups contain 466 rows; 238 are surplus copies after retaining one row from each group.
- 159 rows have no source. The unexplained trailing column is populated in 46 rows.
- 2,947 source values contain the word `simulated`; frequent exact values include `Simulated`, `Educational`, `Educational Simulation`, and `Fictional Scenario`.
- 523 rows literally mention AWS. An expanded AWS-service keyword filter finds 638, but only 300 mention a service in core descriptive fields and only 136 do so in the title.
- Of those 638 candidates, 97 contain any URL in `Source`; only three contain an AWS documentation URL, and those links are broad landing pages rather than claim-specific evidence.
- ATT&CK mappings include absent, deprecated, and semantically unrelated technique IDs.

An MIT label on the dataset repository does not establish the provenance or redistribution rights of prose that may have originated elsewhere. TRACE therefore imports no supplied scenario text, detection logic, solution text, or ATT&CK mapping.

## Retained review prompts

Rows `10297`, `10309`, and `10322` raised a useful node-review question: where can CloudFormation material expose a credential despite `NoEcho`? They informed the CloudFormation threat, evidence, and defense notes. Row `10297` alone prompted `cloudformation-secret-to-rds-access`, a modeled path that requires confirmed reading of a plaintext credential from a template file. Rows `10309` and `10322` are not automatically covered by its ATT&CK badge. The resulting material uses independent primary sources:

- [CloudFormation parameter and NoEcho behavior](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html)
- [CloudFormation dynamic references](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/dynamic-references.html)
- [Amazon RDS in an Amazon VPC](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.html)
- [CloudTrail coverage for RDS API calls](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/logging-using-cloudtrail.html)
- [RDS database-engine logs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.html)
- [MITRE ATT&CK T1552.001: Credentials In Files](https://attack.mitre.org/techniques/T1552/001/)

Row `9946` was retained only as a correction prompt. Its claim that VPC Flow Logs can monitor EC2 instance-metadata traffic is false: AWS explicitly excludes traffic to and from `169.254.169.254`. TRACE now distinguishes the original metadata request from later use of EC2-issued credentials:

- [VPC Flow Log limitations](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs-limitations.html)
- [GuardDuty IAM finding types](https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_finding-types-iam.html)
- [MITRE ATT&CK T1552.005: Cloud Instance Metadata API](https://attack.mitre.org/techniques/T1552/005/)

## Explicit rejects

- Rows `9945` and `9946` misstate what GuardDuty's instance-credential-exfiltration findings prove. They concern unexpected downstream use of EC2-issued credentials, not observation of the original IMDS request.
- Rows `9945` and `9946` map metadata credential access to `T1557.003`, which MITRE defines as DHCP Spoofing. The relevant sub-technique is `T1552.005`.
- Row `10337` treats `NoEcho` as complete secret protection. AWS states that it does not redact template Metadata, Outputs, resource Metadata, or primary-identifier values.
- Row `10363` treats `Principal: "*"` in a CloudFormation stack policy as an IAM grant. A stack policy constrains stack updates; it does not grant IAM authorization.
- Row `12105` describes an ordinary EC2/EBS snapshot as a memory snapshot. EBS snapshots contain volume data written to disk, not a capture of instance RAM.

## Admission rule

The dataset remains a discovery-only corpus. A candidate reaches TRACE only when its prerequisites, AWS actions, observable evidence, limitations, response guidance, and current ATT&CK mapping are independently verified against direct sources. Dataset row IDs and the reviewed revision remain attached for auditability, but the dataset is never presented as proof that an incident occurred.
