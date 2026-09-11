# TRACE reader experience

## Scope

Improve the presentation of existing research across the homepage, domain and service pages, AWS topics, path index, scenario reader, library, concepts, and Sources. Keep scenario stages, security profiles, rule predicates, citations, and coverage mappings unchanged.

## Observations

- Service notes sit in a narrow fixed-width column while the graph takes most of the screen.
- Many metadata labels and body paragraphs are too small for comfortable reading.
- Path cards use anonymous domain icons without service labels.
- The scenario player repeats its evidence text in the Evidence perspective and lacks a whole-sequence evidence comparison.
- Tablet homepage previews assign multiple sections to the same grid cells.
- Long scenario pages need section navigation; the path index needs search.

## Implementation

1. Shared reader stylesheet: consistent typography, panels, spacing, focus states, touch targets and responsive layouts across all routes.
2. Scenario player: numbered service cards using existing SVG domain symbols, explicit scenario-order arrows, active-stage progress, domain labels, next/previous controls and an evidence overview. Populate every detail from existing data.
3. Scenario navigation: anchors to sequence, evidence/response, related service rules and sources. Show the existing static full trace as expandable notes to reduce repetition.
4. Path discovery: searchable titles, services and MITRE IDs; labeled service chains and actual stage counts. Rule counts remain labeled as related service rules, not scenario detection coverage.
5. Service reading: more room for notes on desktop; notes before the graph on phones; consistent evidence/detection cards and readable source labels.

## Validation and release

- Existing navigation, all-service, motion, documentation, scenario and provenance checks.
- Browser tests for path filtering, stage navigation, overview data fidelity, keyboard operation, mobile stage visibility and all route families at representative widths.
- Inspect screenshots of the homepage, path index, scenario reader, service reader and Sources before publishing.
- Commit, push to main, wait for GitHub Pages checks and verify published assets.

## Local verification

- JavaScript syntax and 30-file static build passed.
- Existing UI, connections, commands, scenarios, detections, motion, all-service layouts, and documentation importer checks passed.
- Reader tests verified exact stage text and signals for all 17 scenarios, search and domain filters, evidence comparison, section navigation, and keyboard controls.
- Nine route families passed overflow checks at 1440, 1024, 768, 390, and 320 pixels; tablet homepage preview sections no longer overlap.
- Screenshot review covered the homepage, path catalog, desktop/mobile scenario reader, evidence overview, service, domain, library, and Sources layouts.
- Security profiles, scenario data, community rules, and their source mappings were not modified in this visual pass.
