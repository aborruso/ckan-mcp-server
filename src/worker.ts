/**
 * CKAN MCP Server - Cloudflare Workers Entry Point
 *
 * Provides MCP tools via HTTP for global edge deployment.
 */

import { createServer } from "./server.js";
import { registerPackageTools } from "./tools/package.js";
import { registerOrganizationTools } from "./tools/organization.js";
import { registerDatastoreTools } from "./tools/datastore.js";
import { registerStatusTools } from "./tools/status.js";
import { registerAllResources } from "./resources/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

// Create and configure MCP server (singleton for Workers)
const server = createServer();
registerPackageTools(server);
registerOrganizationTools(server);
registerDatastoreTools(server);
registerStatusTools(server);
registerAllResources(server);

// Create transport (stateless mode for Workers)
const transport = new WebStandardStreamableHTTPServerTransport({
  sessionIdGenerator: undefined,  // Stateless mode
  enableJsonResponse: true         // Use JSON instead of SSE for simplicity
});

// Connect server to transport
await server.connect(transport);

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        version: '0.4.0',
        tools: 7,
        resources: 3,
        runtime: 'cloudflare-workers'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // MCP protocol endpoint - delegate to transport
    if (url.pathname === '/mcp') {
      try {
        const response = await transport.handleRequest(request);

        // Add CORS headers
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } catch (error) {
        console.error('Worker error:', error);
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal error',
            data: error instanceof Error ? error.message : String(error)
          },
          id: null
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // 404 for all other routes
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
