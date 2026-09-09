# TRACE

[Website](https://anonx00.github.io/trace/) · [Build status](https://github.com/anonx00/trace/actions/workflows/pages.yml)

AWS security notes in an interactive graph. Pick a service to see how it connects to other services, what can go wrong, which logs to check, and which controls apply.

The map covers 38 services and eight security domains. Each of the 35 capability links has an AWS documentation reference. There are also eight incident scenarios with separate views for threats, evidence, and response.

## Using the map

- **Domains** groups services by security area.
- **Services** shows their documented relationships. Select a line to read its source.
- **Stories** walks through incident scenarios one stage at a time.

Search with Ctrl/Cmd+K. Use **Reading view** for the written notes or **Focus graph** for a larger map. Bookmarks stay in your browser.

## Sources

Service behavior and capability links come from AWS documentation. Scenario references include [MITRE ATT&CK](https://attack.mitre.org/), [HackTricks](https://cloud.hacktricks.wiki/), [Stratus Red Team](https://stratus-red-team.cloud/), and the other references linked in the [source list](https://anonx00.github.io/trace/#/sources).

Mint lines show AWS capabilities, coral lines show scenario sequences, and dashed lines group topics or services. The graph is a learning resource; it does not connect to an AWS account. A line shows a supported relationship, not proof that a particular environment uses it.

## Run locally

Requires Node.js. No npm dependencies or AWS credentials are needed.

```sh
npm start
```

Open http://127.0.0.1:4173.

## Check changes

Keep the local server running in another terminal.

```sh
python -m pip install -r requirements-dev.txt
python -m playwright install chromium

npm run check
python scripts/test_import_docs.py
npm run test:ui
npm run test:connections
npm run test:motion
npm run test:mind
```

The browser tests cover navigation, source links, graph labels, animation controls, and mobile layouts.

## Update the AWS documentation index

```sh
python -m pip install -r requirements.txt
python scripts/import_docs.py --refresh
```

The importer writes page metadata, headings, links, and short excerpts to `generated/docs.json`. Downloaded HTML stays in the ignored `.cache/` directory. Review changed source pages before updating the notes in `catalog.js`, `security-data.js`, or `scenario-data.js`.

## Deploy

```sh
npm run build
```

The static site is written to `dist/`. GitHub Actions runs the checks and deploys successful pushes to `main`. Pull requests run the checks without publishing.

The frontend uses JavaScript, CSS, and SVG. The background animation uses WebGPU when available, with a Canvas 2D fallback. Fonts are bundled locally.

---

Maintained by [anonx00](https://github.com/anonx00). Not affiliated with AWS.
