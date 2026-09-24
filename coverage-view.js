import {domains} from './catalog.js';
import {coverageRows} from './research-index.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function mountCoverage(root,{documents=[],docsAvailable=true}={}) {
  const rows=coverageRows(documents,docsAvailable);
  const mapped=rows.filter(row=>row.rules.length).length;
  const research=rows.filter(row=>row.research).length;
  const paths=rows.filter(row=>row.paths.length).length;
  root.innerHTML=`<section class="content-page coverage-page">
    <div class="breadcrumb"><a href="#/">Atlas</a><span>/</span><span>Coverage</span></div>
    <header class="content-hero coverage-hero"><div><span class="eyebrow">THE RESEARCH FOOTPRINT</span><h1>See what we know.<br><em>See what’s missing.</em></h1><p>One view of the documentation, paths, and reviewed rules behind every service. Open a row to inspect its sources and security notes.</p></div><div class="coverage-key"><span><i class="coverage-dot mapped"></i> At least one mapping</span><span><i class="coverage-dot gap"></i> No mapping in TRACE</span><small>Editorial coverage, not an account security score.</small></div></header>
    <div class="coverage-metrics"><div><strong>${rows.length}</strong><span>services in the atlas</span></div><div><strong>${mapped}<small> / ${rows.length}</small></strong><span>with reviewed rule mappings</span></div><div><strong>${paths}<small> / ${rows.length}</small></strong><span>included in research paths</span></div><div><strong>${research}<small> / ${rows.length}</small></strong><span>with direct service research</span></div></div>
    <section class="coverage-domains" aria-label="Rule mappings by domain">${domains.map(domain=>{
      const members=rows.filter(row=>row.domain.id===domain.id),count=members.filter(row=>row.rules.length).length;
      return `<button data-coverage-domain="${domain.id}" aria-pressed="false" style="--color:${domain.color}"><span>${esc(domain.short)}<b>${count}/${members.length}</b></span><span class="coverage-segments" aria-hidden="true">${members.map(row=>`<i class="${row.rules.length?'mapped':'gap'}"></i>`).join('')}</span><small>services with rule mappings</small></button>`;
    }).join('')}</section>
    <div class="coverage-tools"><label for="coverage-search">Find a service<input id="coverage-search" type="search" placeholder="Service or domain…"></label><label for="coverage-filter">Show<select id="coverage-filter"><option value="all">All services</option><option value="rules">Without reviewed rules</option><option value="paths">Without research paths</option><option value="research">Without direct service research</option><option value="docs">Without imported AWS topics</option></select></label><button class="coverage-reset" hidden>Clear filters</button></div>
    <div class="coverage-results-line"><p class="coverage-count" role="status" aria-live="polite"></p><span>Counts link to the service notes · “—” means no mapping</span></div>
    ${!docsAvailable?'<p class="coverage-unavailable" role="status">The documentation index is unavailable. Topic counts are unknown; other collections are still shown.</p>':''}
    <div class="coverage-table-wrap" role="region" aria-label="Service research coverage table, scroll horizontally for all columns" tabindex="0"><table class="coverage-table"><caption class="sr-only">TRACE editorial coverage by AWS service. Rule mappings do not establish detection of an entire scenario.</caption><thead><tr><th scope="col">Service / domain</th><th scope="col">AWS topics</th><th scope="col">Sourced links</th><th scope="col">Paths</th><th scope="col">Reviewed rules</th><th scope="col">Service research</th></tr></thead><tbody></tbody></table></div>
    <p class="coverage-footnote">AWS topics count successfully imported headings. Sourced links count documented relationships. Paths include services named in the scenario. Reviewed rules are mapped at service level, not validated against every stage. Service research counts direct HackTricks mappings. <a href="#/sources">Read the provenance ↗</a></p>
  </section>`;
  let domain='all';
  function render(){
    const query=root.querySelector('#coverage-search').value.toLowerCase().trim(),filter=root.querySelector('#coverage-filter').value;
    const filtered=rows.filter(row=>(domain==='all'||row.domain.id===domain)&&`${row.service.id} ${row.service.name} ${row.domain.name}`.toLowerCase().includes(query)&&(filter==='all'||(filter==='docs'?row.topics===0:filter==='research'?!row.research:!row[filter].length)));
    root.querySelector('.coverage-count').textContent=`${filtered.length} of ${rows.length} services${domain==='all'?'':' · '+domains.find(item=>item.id===domain).short}`;
    root.querySelector('.coverage-reset').hidden=!(domain!=='all'||query||filter!=='all');
    root.querySelectorAll('[data-coverage-domain]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.coverageDomain===domain)));
    const count=(row,value,label)=>`<td><a href="#/service/${row.service.id}" class="coverage-value ${value===null?'unknown':value?'mapped':'gap'}" aria-label="${esc(row.service.name)}: ${value===null?'unknown':value} ${label}"><i aria-hidden="true"></i>${value===null?'Unknown':value||'—'}</a></td>`;
    root.querySelector('tbody').innerHTML=filtered.map(row=>`<tr data-coverage-service="${row.service.id}" style="--color:${row.domain.color}"><th scope="row"><a href="#/service/${row.service.id}"><span class="coverage-service-mark" aria-hidden="true"></span><span>${esc(row.service.name)}<small>${esc(row.domain.short)}</small></span><b aria-hidden="true">↗</b></a></th>${count(row,row.topics,'imported topics')}${count(row,row.links.length,'documented relationships')}${count(row,row.paths.length,'research paths')}${count(row,row.rules.length,'reviewed rule mappings')}<td>${row.research?`<a class="coverage-research mapped" href="${esc(row.research.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(row.service.name)}: direct HackTricks research">Mapped ↗</a>`:'<span class="coverage-research gap">Not mapped</span>'}</td></tr>`).join('')||'<tr><td colspan="6" class="coverage-empty">No services match. Clear the filters to see the complete atlas.</td></tr>';
  }
  root.querySelector('#coverage-search').oninput=render;
  root.querySelector('#coverage-filter').onchange=render;
  root.querySelectorAll('[data-coverage-domain]').forEach(button=>button.onclick=()=>{domain=domain===button.dataset.coverageDomain?'all':button.dataset.coverageDomain;render();});
  root.querySelector('.coverage-reset').onclick=()=>{domain='all';root.querySelector('#coverage-search').value='';root.querySelector('#coverage-filter').value='all';render();};
  render();
}
