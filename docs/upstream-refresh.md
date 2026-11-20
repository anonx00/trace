# AWS upstream refresh

The `Refresh AWS context and native detection rules` workflow runs daily at
05:43 UTC and can also be run manually in GitHub Actions. Download its
`aws-upstream-review` artifact for the current complete source snapshot.

Sources:

- SigmaHQ/sigma: YAML files beneath `rules*` directories containing `/aws/`,
  including emerging or deprecated AWS directories when present. Native Sigma
  is preserved, with source path, Git blob hash and immutable commit URL.
- scanner-inc/detection-rules-aws-cloudtrail: all YAML files under `rules/`.
  These remain native Scanner queries, not Sigma conversions.
- HackTricks-wiki/hacktricks-cloud: Markdown file inventory under
  `src/pentesting-cloud/aws-security/`. Source links and hashes track context
  changes; article bodies are not mirrored or converted into detections.

Each run resolves the current upstream commit before fetching its tree and
rule bodies. Rule bytes are checked against Git blob hashes. A truncated tree,
empty scope, failed fetch or hash mismatch fails the job without replacing a
previous complete output. Nothing from the upstream repositories is executed.
License links accompany each source; native rule authorship remains intact.

`scripts/upstream-baseline.json` is a discovery baseline, **not a review approval**.
The artifact lists additions, modifications and removals relative to that
baseline. After processing a batch, update the baseline deliberately with:

```
python scripts/refresh_upstream.py --index-only --output scripts/upstream-baseline.json
```

To fetch the full review queue locally:

```
python scripts/test_refresh_upstream.py
python scripts/refresh_upstream.py
```

Artifacts are retained for 30 days. This workflow does not automatically change
the website's reviewed summaries or deploy rules into a SIEM. A fetched rule is
not necessarily applicable, stable, or tested in a customer's environment.
Review upstream status, telemetry prerequisites, applicability and false
positives before adding a rule to `community-detections.js`. That file still
contains the separately reviewed service mappings. The two GitBook sources
requested for context are not yet part of this GitHub repository fetcher.
