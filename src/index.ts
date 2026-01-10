#!/usr/bin/env node
/**
 * CKAN MCP Server - Entry Point
 * 
 * Provides MCP tools to interact with any CKAN-based open data portal.
 * Supports searching datasets, querying metadata, exploring organizations,
 * and accessing the DataStore API.
 */

import { createServer, registerAll } from "./server.js";
import { runStdio } from "./transport/stdio.js";
import { runHTTP } from "./transport/http.js";

// Create and configure server
const server = createServer();

// Register all tools and resources
registerAll(server);

// Choose transport based on environment
const transport = process.env.TRANSPORT || 'stdio';
if (transport === 'http') {
  runHTTP(server).catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio(server).catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
