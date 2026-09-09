# TRACE

[Open the live atlas](https://anonx00.github.io/trace/) · [Deployment checks](https://github.com/anonx00/trace/actions/workflows/pages.yml)

![Check and deploy TRACE](https://github.com/anonx00/trace/actions/workflows/pages.yml/badge.svg)

An independent AWS security knowledge graph built for an incident-response engineering portfolio. Trace attack paths across service boundaries, inspect observable evidence, compare containment and hardening decisions, and verify claims against linked sources. No AWS account or backend is needed.

## Run locally

```powershell
npm start
```

Open http://127.0.0.1:4173. Choose **Domains**, **Services**, or **Stories** in the connected surface. Services shows 38 nodes and 35 explicitly sourced AWS capabilities. Select a connection to read its meaning and supporting AWS documentation; select a node to enter its security context. Drag to pan or use the zoom controls. Ctrl/Cmd+K searches the atlas.

Use **Explore domains** to open the navigation menu, **Focus graph** to expand the scene, and **Save service** to bookmark a service locally in your browser. Saved services appear under the **Saved** filter in the library. The recent-history trail helps return to a previous layer during your current session.

## Where the information comes from

- `catalog.js`: 38 curated security-relevant services in 8 incident-response domains, plus individually sourced AWS relationships.
- `generated/docs.json`: imported AWS page titles, section anchors, links, short excerpts, retrieval dates, and content hashes. The current security edition contains 230 headings and 52 cross-service documentation references.
- `security-data.js`: service-specific security boundaries, common abuse paths, evidence, defensive controls, responder questions, and official security guidance.
- `scenario-data.js`: eight cross-service attack-and-defense paths sourced from the local ARS3NAL vault, HackTricks, Pacu, Stratus Red Team, MITRE ATT&CK, CloudGoat, Prowler, and AWS incident-response material.
- `s3-notes.js`: 28 original topic summaries of the S3 documentation supplied during development. Each is displayed with the corresponding original section link.
- `data.js`: original service summaries imported by the catalog. Earlier synthetic walkthrough data is retained for history but is not used by the new interface.

An extracted link means **references**, not **depends on**. Curated integration descriptions have their own AWS citations. This is a documentation graph, not a deployment diagram, a live inventory, or a complete catalog of every AWS service.

## Refresh documentation

```powershell
python -m pip install -r requirements.txt
python scripts/import_docs.py
```

The importer reads its seed URLs from `catalog.js`, fetches four pages at a time, validates document structure, and caches HTML under `.cache/` (ignored by Git). A normal run reuses successful cache entries. Use `--refresh` to fetch new versions. Fetch failures are explicitly represented as errors; the importer rejects navigation-only redirect pages.

The public dataset contains metadata and excerpts of at most 24 words per source, not complete mirrored articles. Raw HTML remains in the local cache. Section counts and fetch dates are derived from the imported files. Namespace matches with more than one possible service, such as ECS/Fargate, are omitted from automated references.

Fetching a page does not automatically verify editorial claims. After a refresh, review changes against the source before updating the service summaries and curated relationships. Source dates describe retrieval, not AWS release dates. Regional availability, prices, limits, and feature exceptions should be checked in the current official documentation.

## Validate

```powershell
npm run check
python scripts/test_import_docs.py
python scripts/check_ui.py
```

Install test dependencies with `python -m pip install -r requirements-dev.txt` and `python -m playwright install chromium`. The UI checks require the local preview server. It exercises domain, service, AWS topic, attack-path, evidence, source-catalog, zoom, search, saved-node, and mobile journeys, and fails on browser runtime errors. Screenshots are saved under `artifacts/`.

## GitHub Pages

```powershell
npm run build
```

The Pages workflow checks JavaScript, tests the documentation importer, runs Chromium navigation/graph/motion/layout regressions, and deploys `dist/` after a successful push to `main`. Pull requests run the checks without deploying. Official GitHub actions are pinned to commit hashes; Dependabot checks for updates monthly.

Publish the contents of `dist/` with GitHub Pages. All routes use URL hashes and all asset paths are relative, so repository subpaths work. The build copies only the public app assets and generated metadata; raw source caches and local tooling are excluded. Fonts and licenses are bundled locally; rendering does not wait on a third-party font server.

## Design and accessibility

The homepage and interior maps share circular SVG nodes, readable relationship legends, animated signals, and source-linked reading panels. SVG supplies the meaningful graphics independently of optional WebGPU. The decorative point field appears immediately with Canvas 2D and upgrades when a compatible WebGPU adapter is available. Animation pauses offscreen and honors reduced-motion preferences.

On phones, the homepage uses an accessible service list in Services mode. Interior pages offer **Reading view** and **Focus graph**, and paginate larger neighborhoods without clipping their descriptions. Pause/resume works on maps and scenario players.

Solid mint paths are documented capabilities, coral paths are editorial scenario sequences, and dashed domain links are navigation groupings. Arrows read from subject to related service; they do not universally represent traffic direction. Motion illustrates the diagram, not live account activity. Newly added capability sources were reviewed on 9 September 2026.

Additional regression checks:

```powershell
npm run test:mind
npm run test:motion
npm run test:connections
```

These cover all 38 services, the eight domain graphs, graph text bounds, source inspection, capability coverage, animation, and responsive navigation.

Created for [anonx00](https://github.com/anonx00). This project is independently authored and is not affiliated with or endorsed by AWS.
