import portalsConfig from '../portals.json' assert { type: 'json' };

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '');
}

/**
 * Generate the view URL for a dataset
 */
export function getDatasetViewUrl(serverUrl: string, pkg: any): string {
  const cleanServerUrl = normalizeUrl(serverUrl);
  
  // Find matching portal or alias
  const portal = (portalsConfig.portals as any[]).find((p: any) => {
    const mainUrl = normalizeUrl(p.api_url);
    const aliases = (p.api_url_aliases || []).map(normalizeUrl);
    return mainUrl === cleanServerUrl || aliases.includes(cleanServerUrl);
  });

  const template = portal?.dataset_view_url || portalsConfig.defaults.dataset_view_url;
  
  return template
    .replace('{server_url}', cleanServerUrl)
    .replace('{id}', pkg.id)
    .replace('{name}', pkg.name);
}

/**
 * Generate the view URL for an organization
 */
export function getOrganizationViewUrl(serverUrl: string, org: any): string {
  const cleanServerUrl = normalizeUrl(serverUrl);
  
  const portal = (portalsConfig.portals as any[]).find((p: any) => {
    const mainUrl = normalizeUrl(p.api_url);
    const aliases = (p.api_url_aliases || []).map(normalizeUrl);
    return mainUrl === cleanServerUrl || aliases.includes(cleanServerUrl);
  });

  const template = portal?.organization_view_url || portalsConfig.defaults.organization_view_url;
  
  return template
    .replace('{server_url}', cleanServerUrl)
    .replace('{id}', org.id)
    .replace('{name}', org.name);
}