import argparse
import concurrent.futures
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import time
from urllib.parse import urljoin, urlsplit, urlunsplit
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache' / 'aws-docs'
OUTPUT = ROOT / 'generated' / 'docs.json'
HOST = 'docs.aws.amazon.com'

def canonical(url):
    p = urlsplit(url)
    if p.scheme != 'https' or p.hostname != HOST:
        return None
    return urlunsplit(('https', HOST, p.path, '', ''))

def extract(html, url):
    soup = BeautifulSoup(html, 'html.parser')
    body = soup.select_one('#main-col-body') or soup.select_one('#main-content') or soup.find('main')
    if not body or not body.find('h1'):
        raise ValueError('No recognizable AWS document body; refusing navigation-only page')
    for el in body.select('script,style,nav,.feedback-container,#js_error_message,.highlights,awsdocs-view-related-pages'):
        el.decompose()
    title = body.find('h1').get_text(' ', strip=True)
    sections = []
    for h in body.select('h2,h3'):
        label = h.get_text(' ', strip=True)
        anchor = h.get('id') or (h.find('a') or {}).get('id')
        if label and anchor:
            sections.append({'title': label, 'url': url + '#' + anchor, 'level': int(h.name[1])})
    links, seen = [], set()
    for a in body.select('a[href]'):
        full = urljoin(url, a['href'])
        target = canonical(full)
        label = a.get_text(' ', strip=True)
        if not target or not label or target == url or full in seen:
            continue
        seen.add(full)
        links.append({'title': label, 'url': full, 'pageUrl': target})
    first = body.find('p')
    excerpt = ' '.join(first.get_text(' ',strip=True).split()[:24]) if first else ''
    return {'title': title, 'excerpt': excerpt, 'sections': sections, 'links': links}

def fetch_one(item, refresh):
    url = canonical(item['source'])
    cachefile = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.json')
    try:
        if cachefile.exists() and not refresh:
            stored = json.loads(cachefile.read_text(encoding='utf-8'))
        else:
            time.sleep(.35)
            response = requests.get(url, timeout=(10,35), headers={'User-Agent':'TRACE-Documentation-Indexer/1.0 (educational source index)'}, allow_redirects=False)
            for _ in range(4):
                if response.status_code not in (301,302,303,307,308):
                    break
                destination = canonical(urljoin(response.url,response.headers.get('Location','')))
                if not destination:
                    raise ValueError('Redirect outside AWS docs rejected')
                response = requests.get(destination, timeout=(10,35), allow_redirects=False)
            response.raise_for_status()
            if response.is_redirect:
                raise ValueError('Redirect limit exceeded')
            stored = {'html':response.text,'resolvedUrl':response.url,'fetchedAt':datetime.now(timezone.utc).isoformat(),'sha256':hashlib.sha256(response.content).hexdigest()}
            extract(stored['html'], stored['resolvedUrl'])
            cachefile.write_text(json.dumps(stored,ensure_ascii=False),encoding='utf-8')
        result = extract(stored['html'],stored['resolvedUrl'])
        return {'id':item['id'],'url':url,'resolvedUrl':stored['resolvedUrl'],'fetchedAt':stored['fetchedAt'],'sha256':stored['sha256'],'status':'ok',**result}
    except Exception as error:
        return {'id':item['id'],'url':url,'status':'error','error':str(error)}

def main():
    parser=argparse.ArgumentParser(description='Build the AWS documentation graph.')
    parser.add_argument('--refresh',action='store_true')
    parser.add_argument('--limit',type=int,default=40)
    args=parser.parse_args()
    manifest = subprocess.run(['node','--input-type=module','-e',"import {services} from './catalog.js'; console.log(JSON.stringify(services.map(({id,source})=>({id,source}))));"],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',check=True)
    items=json.loads(manifest.stdout)[:max(1,min(args.limit,40))]
    CACHE.mkdir(parents=True,exist_ok=True)
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    documents=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures=[pool.submit(fetch_one,item,args.refresh) for item in items]
        for future in concurrent.futures.as_completed(futures):
            doc=future.result(); documents.append(doc)
            print(f"{doc['status']:5} {doc['id']}",flush=True)
    prefixes={item['id']:urlsplit(item['source']).path.split('/')[1].lower() for item in items}
    references=[]
    for doc in documents:
        if doc['status']!='ok': continue
        for target,prefix in prefixes.items():
            if target==doc['id']: continue
            matches=[x for x in doc['links'] if urlsplit(x['url']).path.split('/')[1].lower()==prefix]
            if matches:
                references.append({'from':doc['id'],'to':target,'type':'references','source':doc['resolvedUrl'],'targets':matches})
    ambiguous={key for key,value in prefixes.items() if list(prefixes.values()).count(value)>1}
    references=[r for r in references if r['to'] not in ambiguous]
    graph={'schemaVersion':1,'generatedAt':datetime.now(timezone.utc).isoformat(),'documents':sorted(documents,key=lambda x:x['id']),'references':references,'stats':{'requested':len(items),'fetched':sum(d['status']=='ok' for d in documents),'sections':sum(len(d.get('sections',[])) for d in documents),'references':len(references)}}
    temp=OUTPUT.with_suffix('.tmp')
    temp.write_text(json.dumps(graph,ensure_ascii=False,indent=2),encoding='utf-8'); temp.replace(OUTPUT)
    print(json.dumps(graph['stats']),flush=True)

if __name__=='__main__': main()
