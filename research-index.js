import {services, domains, domainFor, connections} from './catalog.js';
import {scenarios, scenarioSources} from './scenario-data.js';
import {detectionsForService, detectionCoverage} from './community-detections.js';
import {hacktricksForService} from './hacktricks-data.js';

// These are counts of editorial mappings, never assessments of an AWS account.
export function scenarioFacts(scenario) {
  const serviceIds = [...new Set(scenario.stages.map(stage => stage.service))];
  const rules = detectionCoverage(serviceIds);
  const gaps = serviceIds.filter(id => !detectionsForService(id).length);
  return {
    serviceIds, rules, gaps,
    domains: [...new Set(serviceIds.map(id => domainFor(id).id))],
    sources: scenarioSources(scenario),
    stages: scenario.stages.length,
  };
}

export function scenarioSearchText(scenario) {
  const ids = new Set(scenario.services);
  return [scenario.title, scenario.summary, scenario.kicker, ...scenario.mitre,
    ...services.filter(service => ids.has(service.id)).flatMap(service => [service.id, service.name, service.short]),
    ...scenario.stages.flatMap(stage => [stage.title, stage.signal])].join(' ').toLowerCase();
}

export function coverageRows(documents = [], docsAvailable = true) {
  return domains.flatMap(domain => domain.services.map(id => {
    const service = services.find(item => item.id === id);
    const doc = documents.find(item => item.id === id);
    return {
      service, domain,
      // null distinguishes an unavailable index from an explicit import gap.
      topics: !docsAvailable ? null : doc?.status === 'ok' ? doc.sections.length : 0,
      doc,
      links: connections.filter(link => link.from === id || link.to === id),
      paths: scenarios.filter(scenario => scenario.services.includes(id)),
      rules: detectionsForService(id),
      research: hacktricksForService(id),
    };
  }));
}
