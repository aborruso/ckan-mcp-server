# Cloudflare Workers Deployment Guide

Complete step-by-step guide to deploy CKAN MCP Server on Cloudflare Workers.

## Prerequisites

- **Cloudflare account** (free): https://dash.cloudflare.com/sign-up
- **Node.js 18+** and npm installed
- **Git** (to clone the repository)

## Why Cloudflare Workers?

The server is ideal for Workers deployment:

- ✅ **Stateless**: No database or persistent state
- ✅ **Read-only**: All operations are GET-only
- ✅ **Lightweight**: Small bundle (~400KB)
- ✅ **Global edge**: Low latency worldwide
- ✅ **Free tier**: 100,000 requests/day

## Step-by-Step Deployment

### Step 1: Install Wrangler CLI

Wrangler is Cloudflare's official CLI tool for Workers.

```bash
npm install -g wrangler
```

Verify installation:

```bash
wrangler --version
```

Expected output: `wrangler 4.x.x` or higher

---

### Step 2: Authenticate with Cloudflare

Connect your local Wrangler to your Cloudflare account:

```bash
wrangler login
```

This will:
1. Open your browser
2. Ask you to log in to Cloudflare
3. Request authorization for Wrangler
4. Show "Successfully logged in" in terminal

Verify authentication:

```bash
wrangler whoami
```

Expected output: Your Cloudflare email and account info

---

### Step 3: Clone Repository

```bash
git clone https://github.com/aborruso/ckan-mcp-server.git
cd ckan-mcp-server
```

---

### Step 4: Install Dependencies

```bash
npm install
```

This installs:
- Project dependencies (@modelcontextprotocol/sdk, axios, zod, etc.)
- Wrangler CLI (local copy for reproducible builds)

---

### Step 5: Test Locally (Optional but Recommended)

Before deploying to production, test the worker locally:

```bash
npm run dev:worker
```

This starts a local Workers server on `http://localhost:8787`

**Test in another terminal**:

```bash
# Health check
curl http://localhost:8787/health

# List MCP tools
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Test real CKAN call
curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"ckan_status_show","arguments":{"server_url":"https://demo.ckan.org"}},"id":2}'
```

Stop local server: Press `x` or `Ctrl+C`

---

### Step 6: Deploy to Cloudflare Workers

```bash
npm run deploy
```

This will:
1. Build the worker (`npm run build:worker`)
2. Upload to Cloudflare
3. Show deployment URL

**Expected output**:

```
Total Upload: 541.85 KiB / gzip: 130.26 KiB
Worker Startup Time: 58 ms
Uploaded ckan-mcp-server (6.36 sec)
Deployed ckan-mcp-server triggers (4.40 sec)
  https://ckan-mcp-server.<your-account>.workers.dev
Current Version ID: <version-id>
```

**Your server is now live!** 🎉

---

### Step 7: Test Production Deployment

Test your live Workers endpoint:

```bash
# Health check
curl https://ckan-mcp-server.<your-account>.workers.dev/health

# List tools
curl -X POST https://ckan-mcp-server.<your-account>.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Test CKAN call
curl -X POST https://ckan-mcp-server.<your-account>.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"ckan_status_show","arguments":{"server_url":"https://demo.ckan.org"}},"id":2}'
```

---

### Step 8: Configure Claude Desktop

Add to `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ckan": {
      "url": "https://ckan-mcp-server.<your-account>.workers.dev/mcp"
    }
  }
}
```

Replace `<your-account>` with your actual Workers subdomain.

Restart Claude Desktop to apply changes.

---

## Configuration

### Custom Worker Name

Edit `wrangler.toml` to change the worker name:

```toml
name = "my-custom-name"
main = "dist/worker.js"
compatibility_date = "2024-01-01"

[build]
command = "npm run build:worker"
```

This changes the URL to: `https://my-custom-name.<account>.workers.dev`

### Environment Variables (Optional)

Add environment variables in `wrangler.toml`:

```toml
[vars]
DEFAULT_CKAN_SERVER = "https://demo.ckan.org"
LOG_LEVEL = "info"
```

Access in `src/worker.ts`:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    console.log('Default server:', env.DEFAULT_CKAN_SERVER);
    // ...
  }
}
```

---

## Monitoring and Debugging

### View Live Logs

```bash
wrangler tail
```

Shows real-time logs from your Workers deployment.

### Cloudflare Dashboard

Visit: https://dash.cloudflare.com → Workers & Pages → ckan-mcp-server

View:
- Request count
- Error rate
- CPU time
- Deployment history

---

## Updating Your Deployment

After making code changes:

```bash
npm run deploy
```

Cloudflare automatically:
- Builds new version
- Deploys globally
- Routes traffic to new version
- No downtime

---

## Troubleshooting

### Error: "Not authenticated"

```bash
wrangler logout
wrangler login
```

### Error: "Worker exceeded CPU time limit"

Check if you're making blocking operations. CKAN API calls are async (I/O-bound), so this should be rare.

### Error: "Script too large"

Current bundle: ~400KB (limit: 1MB). If you hit this:

```bash
# Analyze bundle size
npm run build:worker -- --metafile=meta.json
npx esbuild-visualizer --metadata meta.json
```

### Error: 404 on deployment URL

Wait 10-30 seconds after deployment. Cloudflare propagates to edge network.

### CORS errors in browser

Already configured in `src/worker.ts`. If issues persist, check browser console for specific error.

---

## Production Best Practices

### 1. Use Your Own Deployment

Don't rely on public endpoints for production. Deploy your own Workers instance:

```bash
git clone https://github.com/aborruso/ckan-mcp-server.git
cd ckan-mcp-server
npm install
wrangler login
npm run deploy
```

### 2. Monitor Usage

Free tier includes 100k requests/day. Monitor in Cloudflare dashboard.

### 3. Set Up Alerts (Optional)

In Cloudflare dashboard:
- Workers & Pages → ckan-mcp-server → Settings → Alerts
- Configure notifications for errors, CPU limits, etc.

### 4. Version Management

Tag deployments in git:

```bash
git tag -a v0.4.0 -m "Cloudflare Workers deployment"
git push origin v0.4.0
```

View deployment versions in Cloudflare dashboard.

---

## Cost Breakdown

**Free Tier** (default):
- 100,000 requests/day
- 10ms CPU time per request
- Workers KV: 1GB storage
- Automatic HTTPS

**Paid Plans** (if needed):
- **Workers Paid** ($5/month): 10M requests/month
- **Workers Unbound**: Pay-per-use beyond free tier

For most users, **free tier is sufficient**.

---

## Rollback

### To Previous Version

In Cloudflare dashboard:
1. Workers & Pages → ckan-mcp-server
2. Deployments tab
3. Select previous version → "Rollback to this deployment"

### Remove Deployment

```bash
wrangler delete ckan-mcp-server
```

**Warning**: This permanently deletes the Workers deployment.

---

## FAQ

### Q: Can I use a custom domain?

Yes. In `wrangler.toml`:

```toml
routes = [
  { pattern = "ckan-mcp.example.com", custom_domain = true }
]
```

Then configure DNS in Cloudflare dashboard.

### Q: Is my data secure?

- All traffic uses HTTPS
- Server is read-only (no data modification)
- No sensitive data stored
- CKAN portals are public data

### Q: Can multiple people use my deployment?

Yes. Share your Workers URL with team members. Free tier supports 100k requests/day.

### Q: How do I update to a new version?

```bash
git pull origin main
npm install
npm run deploy
```

---

## Support

- **Issues**: https://github.com/aborruso/ckan-mcp-server/issues
- **Cloudflare Docs**: https://developers.cloudflare.com/workers/
- **MCP SDK**: https://modelcontextprotocol.io/

---

## Next Steps

- [ ] Test all 7 CKAN tools with your deployment
- [ ] Configure Claude Desktop with Workers URL
- [ ] Monitor usage in Cloudflare dashboard
- [ ] Share endpoint with team members (optional)

**Happy deploying!** 🚀
