#!/usr/bin/env node
/**
 * CKAN MCP Server
 * 
 * Provides MCP tools to interact with any CKAN-based open data portal.
 * Supports searching datasets, querying metadata, exploring organizations,
 * and accessing the DataStore API.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { z } from "zod";
import axios, { AxiosError } from "axios";

// ============================================================================
// Server Configuration
// ============================================================================

const server = new McpServer({
  name: "ckan-mcp-server",
  version: "1.0.0"
});

const CHARACTER_LIMIT = 50000;

// ============================================================================
// Types and Schemas
// ============================================================================

enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

const ResponseFormatSchema = z.nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Make HTTP request to CKAN API
 */
async function makeCkanRequest<T>(
  serverUrl: string,
  action: string,
  params: Record<string, any> = {}
): Promise<T> {
  // Normalize server URL
  const baseUrl = serverUrl.replace(/\/$/, '');
  const url = `${baseUrl}/api/3/action/${action}`;

  try {
    const response = await axios.get(url, {
      params,
      timeout: 30000,
      headers: {
        'User-Agent': 'CKAN-MCP-Server/1.0'
      }
    });

    if (response.data && response.data.success === true) {
      return response.data.result as T;
    } else {
      throw new Error(`CKAN API returned success=false: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data as any;
        const errorMsg = data?.error?.message || data?.error || 'Unknown error';
        throw new Error(`CKAN API error (${status}): ${errorMsg}`);
      } else if (axiosError.code === 'ECONNABORTED') {
        throw new Error(`Request timeout connecting to ${serverUrl}`);
      } else if (axiosError.code === 'ENOTFOUND') {
        throw new Error(`Server not found: ${serverUrl}`);
      } else {
        throw new Error(`Network error: ${axiosError.message}`);
      }
    }
    throw error;
  }
}

/**
 * Truncate text if it exceeds character limit
 */
function truncateText(text: string, limit: number = CHARACTER_LIMIT): string {
  if (text.length <= limit) {
    return text;
  }
  return text.substring(0, limit) + `\n\n... [Response truncated at ${limit} characters]`;
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('it-IT');
  } catch {
    return dateStr;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number | undefined): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================================================
// Tool Implementations
// ============================================================================

/**
 * Search for datasets on a CKAN server
 */
server.registerTool(
  "ckan_package_search",
  {
    title: "Search CKAN Datasets",
    description: `Search for datasets (packages) on a CKAN server using Solr query syntax.

Supports full Solr search capabilities including filters, facets, and sorting.
Use this to discover datasets matching specific criteria.

Args:
  - server_url (string): Base URL of CKAN server (e.g., "https://dati.gov.it")
  - q (string): Search query using Solr syntax (default: "*:*" for all)
  - fq (string): Filter query (e.g., "organization:comune-palermo")
  - rows (number): Number of results to return (default: 10, max: 1000)
  - start (number): Offset for pagination (default: 0)
  - sort (string): Sort field and direction (e.g., "metadata_modified desc")
  - facet_field (array): Fields to facet on (e.g., ["organization", "tags"])
  - facet_limit (number): Max facet values per field (default: 50)
  - include_drafts (boolean): Include draft datasets (default: false)
  - response_format ('markdown' | 'json'): Output format

Returns:
  Search results with:
  - count: Number of results found
  - results: Array of dataset objects
  - facets: Facet counts (if facet_field specified)
  - search_facets: Detailed facet information

Examples:
  - Search all: { server_url: "https://dati.gov.it", q: "*:*" }
  - By tag: { server_url: "...", q: "tags:sanità" }
  - Filter org: { server_url: "...", fq: "organization:regione-siciliana" }
  - Get facets: { server_url: "...", facet_field: ["organization"], rows: 0 }`,
    inputSchema: z.object({
      server_url: z.string()
        .url("Must be a valid URL")
        .describe("Base URL of the CKAN server"),
      q: z.string()
        .optional()
        .default("*:*")
        .describe("Search query in Solr syntax"),
      fq: z.string()
        .optional()
        .describe("Filter query in Solr syntax"),
      rows: z.number()
        .int()
        .min(0)
        .max(1000)
        .optional()
        .default(10)
        .describe("Number of results to return"),
      start: z.number()
        .int()
        .min(0)
        .optional()
        .default(0)
        .describe("Offset for pagination"),
      sort: z.string()
        .optional()
        .describe("Sort field and direction (e.g., 'metadata_modified desc')"),
      facet_field: z.array(z.string())
        .optional()
        .describe("Fields to facet on"),
      facet_limit: z.number()
        .int()
        .min(1)
        .optional()
        .default(50)
        .describe("Maximum facet values per field"),
      include_drafts: z.boolean()
        .optional()
        .default(false)
        .describe("Include draft datasets"),
      response_format: ResponseFormatSchema
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params) => {
    try {
      const apiParams: Record<string, any> = {
        q: params.q,
        rows: params.rows,
        start: params.start,
        include_private: params.include_drafts
      };

      if (params.fq) apiParams.fq = params.fq;
      if (params.sort) apiParams.sort = params.sort;
      if (params.facet_field && params.facet_field.length > 0) {
        apiParams['facet.field'] = JSON.stringify(params.facet_field);
        apiParams['facet.limit'] = params.facet_limit;
      }

      const result = await makeCkanRequest<any>(
        params.server_url,
        'package_search',
        apiParams
      );

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: truncateText(JSON.stringify(result, null, 2)) }],
          structuredContent: result
        };
      }

      // Markdown format
      let markdown = `# CKAN Package Search Results

**Server**: ${params.server_url}
**Query**: ${params.q}
${params.fq ? `**Filter**: ${params.fq}\n` : ''}
**Total Results**: ${result.count}
**Showing**: ${result.results.length} results (from ${params.start})

`;

      // Show facets if available
      if (result.facets && Object.keys(result.facets).length > 0) {
        markdown += `## Facets\n\n`;
        for (const [field, values] of Object.entries(result.facets)) {
          markdown += `### ${field}\n\n`;
          const facetValues = values as Record<string, number>;
          const sorted = Object.entries(facetValues)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
          for (const [value, count] of sorted) {
            markdown += `- **${value}**: ${count}\n`;
          }
          markdown += '\n';
        }
      }

      // Show results
      if (result.results && result.results.length > 0) {
        markdown += `## Datasets\n\n`;
        for (const pkg of result.results) {
          markdown += `### ${pkg.title || pkg.name}\n\n`;
          markdown += `- **ID**: \`${pkg.id}\`\n`;
          markdown += `- **Name**: \`${pkg.name}\`\n`;
          if (pkg.organization) {
            markdown += `- **Organization**: ${pkg.organization.title || pkg.organization.name}\n`;
          }
          if (pkg.notes) {
            const notes = pkg.notes.substring(0, 200);
            markdown += `- **Description**: ${notes}${pkg.notes.length > 200 ? '...' : ''}\n`;
          }
          if (pkg.tags && pkg.tags.length > 0) {
            const tags = pkg.tags.slice(0, 5).map((t: any) => t.name).join(', ');
            markdown += `- **Tags**: ${tags}${pkg.tags.length > 5 ? ', ...' : ''}\n`;
          }
          markdown += `- **Resources**: ${pkg.num_resources || 0}\n`;
          markdown += `- **Modified**: ${formatDate(pkg.metadata_modified)}\n`;
          markdown += `- **Link**: ${params.server_url}/dataset/${pkg.name}\n\n`;
        }
      } else {
        markdown += `No datasets found matching your query.\n`;
      }

      if (result.count > params.start + params.rows) {
        const nextStart = params.start + params.rows;
        markdown += `\n---\n**More results available**: Use \`start: ${nextStart}\` to see next page.\n`;
      }

      return {
        content: [{ type: "text", text: truncateText(markdown) }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error searching packages: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

/**
 * Get details of a specific dataset
 */
server.registerTool(
  "ckan_package_show",
  {
    title: "Show CKAN Dataset Details",
    description: `Get complete metadata for a specific dataset (package).

Returns full details including resources, organization, tags, and all metadata fields.

Args:
  - server_url (string): Base URL of CKAN server
  - id (string): Dataset ID or name (machine-readable slug)
  - include_tracking (boolean): Include view/download statistics (default: false)
  - response_format ('markdown' | 'json'): Output format

Returns:
  Complete dataset object with all metadata and resources

Examples:
  - { server_url: "https://dati.gov.it", id: "dataset-name" }
  - { server_url: "...", id: "abc-123-def", include_tracking: true }`,
    inputSchema: z.object({
      server_url: z.string()
        .url()
        .describe("Base URL of the CKAN server"),
      id: z.string()
        .min(1)
        .describe("Dataset ID or name"),
      include_tracking: z.boolean()
        .optional()
        .default(false)
        .describe("Include tracking statistics"),
      response_format: ResponseFormatSchema
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params) => {
    try {
      const result = await makeCkanRequest<any>(
        params.server_url,
        'package_show',
        {
          id: params.id,
          include_tracking: params.include_tracking
        }
      );

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: truncateText(JSON.stringify(result, null, 2)) }],
          structuredContent: result
        };
      }

      // Markdown format
      let markdown = `# Dataset: ${result.title || result.name}\n\n`;
      markdown += `**Server**: ${params.server_url}\n`;
      markdown += `**Link**: ${params.server_url}/dataset/${result.name}\n\n`;

      markdown += `## Basic Information\n\n`;
      markdown += `- **ID**: \`${result.id}\`\n`;
      markdown += `- **Name**: \`${result.name}\`\n`;
      if (result.author) markdown += `- **Author**: ${result.author}\n`;
      if (result.author_email) markdown += `- **Author Email**: ${result.author_email}\n`;
      if (result.maintainer) markdown += `- **Maintainer**: ${result.maintainer}\n`;
      if (result.maintainer_email) markdown += `- **Maintainer Email**: ${result.maintainer_email}\n`;
      markdown += `- **License**: ${result.license_title || result.license_id || 'Not specified'}\n`;
      markdown += `- **State**: ${result.state}\n`;
      markdown += `- **Created**: ${formatDate(result.metadata_created)}\n`;
      markdown += `- **Modified**: ${formatDate(result.metadata_modified)}\n\n`;

      if (result.organization) {
        markdown += `## Organization\n\n`;
        markdown += `- **Name**: ${result.organization.title || result.organization.name}\n`;
        markdown += `- **ID**: \`${result.organization.id}\`\n\n`;
      }

      if (result.notes) {
        markdown += `## Description\n\n${result.notes}\n\n`;
      }

      if (result.tags && result.tags.length > 0) {
        markdown += `## Tags\n\n`;
        markdown += result.tags.map((t: any) => `- ${t.name}`).join('\n') + '\n\n';
      }

      if (result.groups && result.groups.length > 0) {
        markdown += `## Groups\n\n`;
        for (const group of result.groups) {
          markdown += `- **${group.title || group.name}** (\`${group.name}\`)\n`;
        }
        markdown += '\n';
      }

      if (result.resources && result.resources.length > 0) {
        markdown += `## Resources (${result.resources.length})\n\n`;
        for (const resource of result.resources) {
          markdown += `### ${resource.name || 'Unnamed Resource'}\n\n`;
          markdown += `- **ID**: \`${resource.id}\`\n`;
          markdown += `- **Format**: ${resource.format || 'Unknown'}\n`;
          if (resource.description) markdown += `- **Description**: ${resource.description}\n`;
          markdown += `- **URL**: ${resource.url}\n`;
          if (resource.size) markdown += `- **Size**: ${formatBytes(resource.size)}\n`;
          if (resource.mimetype) markdown += `- **MIME Type**: ${resource.mimetype}\n`;
          markdown += `- **Created**: ${formatDate(resource.created)}\n`;
          if (resource.last_modified) markdown += `- **Modified**: ${formatDate(resource.last_modified)}\n`;
          if (resource.datastore_active !== undefined) {
            markdown += `- **DataStore**: ${resource.datastore_active ? '✅ Available' : '❌ Not available'}\n`;
          }
          markdown += '\n';
        }
      }

      if (result.extras && result.extras.length > 0) {
        markdown += `## Extra Fields\n\n`;
        for (const extra of result.extras) {
          markdown += `- **${extra.key}**: ${extra.value}\n`;
        }
        markdown += '\n';
      }

      return {
        content: [{ type: "text", text: truncateText(markdown) }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching package: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

/**
 * List all organizations
 */
server.registerTool(
  "ckan_organization_list",
  {
    title: "List CKAN Organizations",
    description: `List all organizations on a CKAN server.

Organizations are entities that publish and manage datasets.

Args:
  - server_url (string): Base URL of CKAN server
  - all_fields (boolean): Return full objects vs just names (default: false)
  - sort (string): Sort field (default: "name asc")
  - limit (number): Maximum results (default: 100)
  - offset (number): Pagination offset (default: 0)
  - response_format ('markdown' | 'json'): Output format

Returns:
  List of organizations with metadata`,
    inputSchema: z.object({
      server_url: z.string().url(),
      all_fields: z.boolean().optional().default(false),
      sort: z.string().optional().default("name asc"),
      limit: z.number().int().min(1).optional().default(100),
      offset: z.number().int().min(0).optional().default(0),
      response_format: ResponseFormatSchema
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params) => {
    try {
      const result = await makeCkanRequest<any>(
        params.server_url,
        'organization_list',
        {
          all_fields: params.all_fields,
          sort: params.sort,
          limit: params.limit,
          offset: params.offset
        }
      );

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: truncateText(JSON.stringify(result, null, 2)) }],
          structuredContent: result
        };
      }

      let markdown = `# CKAN Organizations\n\n`;
      markdown += `**Server**: ${params.server_url}\n`;
      markdown += `**Total**: ${Array.isArray(result) ? result.length : 'Unknown'}\n\n`;

      if (Array.isArray(result)) {
        if (params.all_fields) {
          for (const org of result) {
            markdown += `## ${org.title || org.name}\n\n`;
            markdown += `- **ID**: \`${org.id}\`\n`;
            markdown += `- **Name**: \`${org.name}\`\n`;
            if (org.description) markdown += `- **Description**: ${org.description.substring(0, 200)}\n`;
            markdown += `- **Datasets**: ${org.package_count || 0}\n`;
            markdown += `- **Created**: ${formatDate(org.created)}\n`;
            markdown += `- **Link**: ${params.server_url}/organization/${org.name}\n\n`;
          }
        } else {
          markdown += result.map((name: string) => `- ${name}`).join('\n');
        }
      }

      return {
        content: [{ type: "text", text: truncateText(markdown) }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error listing organizations: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

/**
 * Show organization details
 */
server.registerTool(
  "ckan_organization_show",
  {
    title: "Show CKAN Organization Details",
    description: `Get details of a specific organization.

Args:
  - server_url (string): Base URL of CKAN server
  - id (string): Organization ID or name
  - include_datasets (boolean): Include list of datasets (default: true)
  - include_users (boolean): Include list of users (default: false)
  - response_format ('markdown' | 'json'): Output format

Returns:
  Organization details with optional datasets and users`,
    inputSchema: z.object({
      server_url: z.string().url(),
      id: z.string().min(1),
      include_datasets: z.boolean().optional().default(true),
      include_users: z.boolean().optional().default(false),
      response_format: ResponseFormatSchema
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params) => {
    try {
      const result = await makeCkanRequest<any>(
        params.server_url,
        'organization_show',
        {
          id: params.id,
          include_datasets: params.include_datasets,
          include_users: params.include_users
        }
      );

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: truncateText(JSON.stringify(result, null, 2)) }],
          structuredContent: result
        };
      }

      let markdown = `# Organization: ${result.title || result.name}\n\n`;
      markdown += `**Server**: ${params.server_url}\n`;
      markdown += `**Link**: ${params.server_url}/organization/${result.name}\n\n`;

      markdown += `## Details\n\n`;
      markdown += `- **ID**: \`${result.id}\`\n`;
      markdown += `- **Name**: \`${result.name}\`\n`;
      markdown += `- **Datasets**: ${result.package_count || 0}\n`;
      markdown += `- **Created**: ${formatDate(result.created)}\n`;
      markdown += `- **State**: ${result.state}\n\n`;

      if (result.description) {
        markdown += `## Description\n\n${result.description}\n\n`;
      }

      if (result.packages && result.packages.length > 0) {
        markdown += `## Datasets (${result.packages.length})\n\n`;
        for (const pkg of result.packages.slice(0, 20)) {
          markdown += `- **${pkg.title || pkg.name}** (\`${pkg.name}\`)\n`;
        }
        if (result.packages.length > 20) {
          markdown += `\n... and ${result.packages.length - 20} more datasets\n`;
        }
        markdown += '\n';
      }

      if (result.users && result.users.length > 0) {
        markdown += `## Users (${result.users.length})\n\n`;
        for (const user of result.users) {
          markdown += `- **${user.name}** (${user.capacity})\n`;
        }
        markdown += '\n';
      }

      return {
        content: [{ type: "text", text: truncateText(markdown) }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error fetching organization: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

/**
 * DataStore search
 */
server.registerTool(
  "ckan_datastore_search",
  {
    title: "Search CKAN DataStore",
    description: `Query data from a CKAN DataStore resource.

The DataStore allows SQL-like queries on tabular data. Not all resources have DataStore enabled.

Args:
  - server_url (string): Base URL of CKAN server
  - resource_id (string): ID of the DataStore resource
  - q (string): Full-text search query (optional)
  - filters (object): Key-value filters (e.g., { "anno": 2023 })
  - limit (number): Max rows to return (default: 100, max: 32000)
  - offset (number): Pagination offset (default: 0)
  - fields (array): Specific fields to return (optional)
  - sort (string): Sort field with direction (e.g., "anno desc")
  - distinct (boolean): Return distinct values (default: false)
  - response_format ('markdown' | 'json'): Output format

Returns:
  DataStore records matching query

Examples:
  - { server_url: "...", resource_id: "abc-123", limit: 50 }
  - { server_url: "...", resource_id: "...", filters: { "regione": "Sicilia" } }
  - { server_url: "...", resource_id: "...", sort: "anno desc", limit: 100 }`,
    inputSchema: z.object({
      server_url: z.string().url(),
      resource_id: z.string().min(1),
      q: z.string().optional(),
      filters: z.record(z.any()).optional(),
      limit: z.number().int().min(1).max(32000).optional().default(100),
      offset: z.number().int().min(0).optional().default(0),
      fields: z.array(z.string()).optional(),
      sort: z.string().optional(),
      distinct: z.boolean().optional().default(false),
      response_format: ResponseFormatSchema
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params) => {
    try {
      const apiParams: Record<string, any> = {
        resource_id: params.resource_id,
        limit: params.limit,
        offset: params.offset,
        distinct: params.distinct
      };

      if (params.q) apiParams.q = params.q;
      if (params.filters) apiParams.filters = JSON.stringify(params.filters);
      if (params.fields) apiParams.fields = params.fields.join(',');
      if (params.sort) apiParams.sort = params.sort;

      const result = await makeCkanRequest<any>(
        params.server_url,
        'datastore_search',
        apiParams
      );

      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: truncateText(JSON.stringify(result, null, 2)) }],
          structuredContent: result
        };
      }

      let markdown = `# DataStore Query Results\n\n`;
      markdown += `**Server**: ${params.server_url}\n`;
      markdown += `**Resource ID**: \`${params.resource_id}\`\n`;
      markdown += `**Total Records**: ${result.total || 0}\n`;
      markdown += `**Returned**: ${result.records ? result.records.length : 0} records\n\n`;

      if (result.fields && result.fields.length > 0) {
        markdown += `## Fields\n\n`;
        markdown += result.fields.map((f: any) => `- **${f.id}** (${f.type})`).join('\n') + '\n\n';
      }

      if (result.records && result.records.length > 0) {
        markdown += `## Records\n\n`;
        
        // Create a simple table
        const fields = result.fields.map((f: any) => f.id);
        const displayFields = fields.slice(0, 8); // Limit columns for readability
        
        // Header
        markdown += `| ${displayFields.join(' | ')} |\n`;
        markdown += `| ${displayFields.map(() => '---').join(' | ')} |\n`;
        
        // Rows (limit to 50 for readability)
        for (const record of result.records.slice(0, 50)) {
          const values = displayFields.map(field => {
            const val = record[field];
            if (val === null || val === undefined) return '-';
            const str = String(val);
            return str.length > 50 ? str.substring(0, 47) + '...' : str;
          });
          markdown += `| ${values.join(' | ')} |\n`;
        }

        if (result.records.length > 50) {
          markdown += `\n... and ${result.records.length - 50} more records\n`;
        }
        markdown += '\n';
      }

      if (result.total && result.total > params.offset + (result.records?.length || 0)) {
        const nextOffset = params.offset + params.limit;
        markdown += `**More results available**: Use \`offset: ${nextOffset}\` for next page.\n`;
      }

      return {
        content: [{ type: "text", text: truncateText(markdown) }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error querying DataStore: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

/**
 * Check CKAN server status
 */
server.registerTool(
  "ckan_status_show",
  {
    title: "Check CKAN Server Status",
    description: `Check if a CKAN server is available and get version information.

Useful to verify server accessibility before making other requests.

Args:
  - server_url (string): Base URL of CKAN server

Returns:
  Server status and version information`,
    inputSchema: z.object({
      server_url: z.string().url().describe("Base URL of the CKAN server")
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params) => {
    try {
      const result = await makeCkanRequest<any>(
        params.server_url,
        'status_show',
        {}
      );

      const markdown = `# CKAN Server Status\n\n` +
        `**Server**: ${params.server_url}\n` +
        `**Status**: ✅ Online\n` +
        `**CKAN Version**: ${result.ckan_version || 'Unknown'}\n` +
        `**Site Title**: ${result.site_title || 'N/A'}\n` +
        `**Site URL**: ${result.site_url || 'N/A'}\n`;

      return {
        content: [{ type: "text", text: markdown }],
        structuredContent: result
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Server appears to be offline or not a valid CKAN instance:\n${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// ============================================================================
// Server Transport Setup
// ============================================================================

async function runStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CKAN MCP server running on stdio");
}

async function runHTTP() {
  const app = express();
  app.use(express.json());

  app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || '3000');
  app.listen(port, () => {
    console.error(`CKAN MCP server running on http://localhost:${port}/mcp`);
  });
}

// Choose transport based on environment
const transport = process.env.TRANSPORT || 'stdio';
if (transport === 'http') {
  runHTTP().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
