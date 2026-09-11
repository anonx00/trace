# TRACE

An interactive map of AWS services and their security controls. Follow a connection to its AWS documentation, check the evidence available for a service, or work through an incident scenario.

**[Open TRACE →](https://anonx00.github.io/trace/)**

[![TRACE showing connected AWS services](docs/atlas.png)](https://anonx00.github.io/trace/)

## Explore

The map includes **40 services**, **41 documented relationships**, **28 reviewed community detections**, and **21 incident scenarios**.

- **Domains:** start with identity, workloads, data, networking, detection, response, supply chain, or investigation.
- **Services:** select a node for security context, rule-backed attack cases, telemetry requirements, tuning notes, controls, and documentation. Select a connection to see why it exists.
- **Stories:** search by service, scenario, or MITRE ID and filter by domain. Follow numbered service stages, switch between threat context, evidence, and defense, or compare evidence across the sequence.

Ctrl/Cmd+K opens search. **Reading view** puts the notes first; **Focus graph** gives the map more room. Saved services stay in your browser.

Pages share a responsive reading layout. Service notes come before the graph on phones. Investigation pages include section navigation, expandable full stage notes, and keyboard-accessible stage controls (arrow keys, Home, and End).

Graph cards show service names and relationship labels, with the full explanation and sources in the connection notes. Hover or focus a card to highlight its link; use arrow keys to move between nodes. The service atlas groups nodes by domain and switches to a readable index on smaller screens. Sources and investigations share section shortcuts and the same reading controls.

## Sources

AWS documentation supports the service relationships. Incident scenarios draw on MITRE ATT&CK, controlled AWS attack labs, AWS incident-response playbooks, and the research linked on the [Sources page](https://anonx00.github.io/trace/#/sources). Community detection cards link to their exact [detections.ai](https://detections.ai/detections?q=AWS) pages and, where reviewed, commit-pinned upstream Sigma rules.

The service research layer maps 36 TRACE nodes to exact [HackTricks Cloud AWS service pages](https://cloud.hacktricks.wiki/en/pentesting-cloud/aws-security/aws-services/index.html), reviewed against source commit [`4fa4b2f`](https://github.com/HackTricks-wiki/hacktricks-cloud/tree/4fa4b2f11915ab60ffbd7df5c8c96579aad5b023). IAM Identity Center, AWS Backup, AWS Fargate, and Amazon OpenSearch Service remain explicit gaps because no direct service page was found; neighboring material is not used as a substitute.

The attack-research index also includes commit-pinned references from [OffensiveCloud](https://github.com/lutzenfried/OffensiveCloud/tree/main/AWS), the [AWS Detection Engineering Lab](https://github.com/JpsBookOfLife/aws-detection-engineering-lab/tree/main/detections), and [Awesome AWS Security](https://github.com/jassics/awesome-aws-security). The lab's eight native CloudWatch metric-filter files are listed as research references rather than presented as detections.ai community cards.

CloudFormation node enrichment was prompted by three rows in the MIT-labeled [Cybersecurity Attack Dataset](https://huggingface.co/datasets/savaniDhruv/Cybersecurity_Attack_Dataset/tree/878cd3b46278018e17a1aa9333ff67896fe5fa03); one resulting field note uses row 10297 as its discovery prompt. TRACE treats that undocumented, mixed simulated corpus as discovery input only: it pins the reviewed revision and file hash, imports none of its prose or detection logic, corrects unsupported claims, and publishes only mechanics independently verified against claim-specific AWS and MITRE sources. The measurements, retained row IDs, and explicit rejects are preserved in the [dataset review](docs/cybersecurity-attack-dataset-review.md).

TRACE preserves native rule language instead of translating everything into generic SQL. Each detection records its contributor, collection, MITRE mapping, telemetry dependency, and tuning guidance. The UI distinguishes exact upstream selections from publisher summaries and leaves unmapped services visible as coverage gaps.

Capability links, scenario sequences, and navigation groupings have separate labels. TRACE describes possible relationships; it does not inspect your AWS account or show live incidents.

## Run it

Requires Node.js. There are no npm dependencies.

```sh
git clone https://github.com/anonx00/trace.git
cd trace
npm start
```

Open http://127.0.0.1:4173.

## Development

The frontend is plain JavaScript, CSS, and SVG. The background uses WebGPU where available, with a Canvas 2D fallback. Fonts are included in the repository.

<details>
<summary>Connect the Copilot cloud agent to AWS documentation</summary>

In **Settings → Copilot → Model Context Protocol (MCP)**, save this repository configuration:

```json
{
  "mcpServers": {
    "aws-documentation": {
      "type": "local",
      "command": "uvx",
      "args": [
        "awslabs.aws-documentation-mcp-server@1.2.1"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR",
        "AWS_DOCUMENTATION_PARTITION": "aws"
      },
      "tools": [
        "search_documentation",
        "read_documentation",
        "read_sections",
        "search_table",
        "recommend"
      ]
    }
  }
}
```

The repository's Copilot setup workflow installs `uvx`; this server needs no AWS credentials or Agents secrets. GitHub and Playwright MCP servers remain available through GitHub's built-in integrations.

The AWS documentation tools are read-only. The current upstream package does not publish MCP's `annotations.readOnlyHint`, so GitHub may exclude these tools from Copilot code review while still making them available to the Copilot cloud agent.

</details>

<details>
<summary>Run the checks</summary>

Keep `npm start` running in another terminal.

```sh
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
npm run check
python scripts/test_import_docs.py
npm run test:scenarios
npm run test:detections
npm run test:hacktricks
npm run test:commands
npm run test:ui
npm run test:connections
npm run test:motion
npm run test:mind
npm run test:reader
npm run test:visual
```

</details>

<details>
<summary>Refresh the documentation index</summary>

```sh
python -m pip install -r requirements.txt
python scripts/import_docs.py --refresh
```

The importer saves headings, source URLs, short excerpts, and fetch dates in `generated/docs.json`. Downloaded HTML stays in `.cache/`. Review source changes before editing the security notes.

</details>

`npm run build` writes the site to `dist/`. [GitHub Actions](https://github.com/anonx00/trace/actions/workflows/pages.yml) checks pull requests and deploys successful pushes to `main`.

---

[anonx00](https://github.com/anonx00) · Not affiliated with AWS.
