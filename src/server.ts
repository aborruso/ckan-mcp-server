/**
 * MCP Server configuration
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPackageTools } from "./tools/package.js";
import { registerOrganizationTools } from "./tools/organization.js";
import { registerDatastoreTools } from "./tools/datastore.js";
import { registerStatusTools } from "./tools/status.js";
import { registerAllResources } from "./resources/index.js";

export function createServer(): McpServer {
  return new McpServer({
    name: "ckan-mcp-server",
    version: "0.4.1"
  });
}

export function registerAll(server: McpServer): void {
  registerPackageTools(server);
  registerOrganizationTools(server);
  registerDatastoreTools(server);
  registerStatusTools(server);
  registerAllResources(server);
}
