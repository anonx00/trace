"""Fetch complete scoped upstream indexes; preserve native rules in review artifacts.

Never executes upstream code or changes TRACE's reviewed service mappings.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    'sigma': ('SigmaHQ/sigma', 'master', 'rule', 'https://github.com/SigmaHQ/Detection-Rule-License'),
    'hacktricks': ('HackTricks-wiki/hacktricks-cloud', 'master', 'context', 'https://book.hacktricks.wiki/en/misc/hacktricks-values-and-faq.html'),
    'scanner': ('scanner-inc/detection-rules-aws-cloudtrail', 'main', 'rule', 'https://github.com/scanner-inc/detection-rules-aws-cloudtrail/blob/main/LICENSE'),
}

def selected(source, path):
    if source == 'sigma':
        return path.startswith('rules') and '/aws/' in path and path.endswith(('.yml', '.yaml'))
    if source == 'hacktricks':
        return path.startswith('src/pentesting-cloud/aws-security/') and path.endswith('.md')
    return path.startswith('rules/') and path.endswith(('.yml', '.yaml'))

def fetch(url):
    request = Request(url, headers={'User-Agent': 'TRACE-upstream-review/1.0'})
    with urlopen(request, timeout=60) as response:
        data = response.read(24_000_001)
    if len(data) > 24_000_000:
        raise ValueError('Response exceeds size limit')
    return data

def api(path):
    return json.loads(fetch('https://api.github.com/repos/' + path))

def changes(previous, current):
    old = {item['path']: item['blob'] for item in previous}
    new = {item['path']: item['blob'] for item in current}
    return {'added': sorted(new.keys()-old.keys()),
            'modified': sorted(p for p in new.keys() & old.keys() if new[p] != old[p]),
            'removed': sorted(old.keys()-new.keys())}

def snapshot(previous, include_rules=True):
    result = {'schemaVersion': 1, 'publication': 'review-only',
              'fetchedAt': datetime.now(timezone.utc).isoformat(), 'sources': {}}
    for name, (repo, branch, kind, license_url) in SOURCES.items():
        commit = api(repo+'/commits/'+branch)['sha']
        if not re.fullmatch('[0-9a-f]{40}', commit):
            raise ValueError('Invalid upstream commit')
        tree = api(repo+'/git/trees/'+commit+'?recursive=1')
        if tree.get('truncated'):
            raise ValueError('Incomplete upstream tree: '+name)
        records = []
        for entry in tree['tree']:
            path = entry['path']
            if entry['type'] == 'blob' and selected(name, path):
                records.append({'path': path, 'blob': entry['sha'],
                                'url': f'https://github.com/{repo}/blob/{commit}/{path}'})
        if not records:
            raise ValueError('Empty source scope: '+name)
        records.sort(key=lambda x: x['path'])
        if kind == 'rule' and include_rules:
            def native(record):
                data = fetch(f'https://raw.githubusercontent.com/{repo}/{commit}/{record["path"]}')
                digest = hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
                if digest != record['blob']:
                    raise ValueError('Upstream blob mismatch')
                return {**record, 'nativeYaml': data.decode('utf-8')}
            with ThreadPoolExecutor(max_workers=6) as pool:
                records = list(pool.map(native, records))
        old = previous.get('sources', {}).get(name, {})
        result['sources'][name] = {'repository': repo, 'commit': commit, 'kind': kind,
            'license': license_url, 'reviewStatus': 'pending', 'files': records,
            'changesFromBaseline': changes(old.get('files', []), records),
            'baselineCommit': old.get('commit')}
        print(f'{name}: {len(records)} {kind} files at {commit[:12]}')
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT/'artifacts/upstream-review.json')
    parser.add_argument('--baseline', type=Path, default=ROOT/'scripts/upstream-baseline.json')
    parser.add_argument('--index-only', action='store_true')
    args = parser.parse_args()
    previous = json.loads(args.baseline.read_text('utf-8')) if args.baseline.exists() else {}
    result = snapshot(previous, not args.index_only)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # Failed sources never overwrite the previous complete result.
    temporary = args.output.with_suffix('.tmp')
    temporary.write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
    temporary.replace(args.output)

if __name__ == '__main__':
    main()
