# MCP Server Testing Guide

## Quick Test Commands

### 1. Check Server Status
```bash
curl https://xmcp-sigma.vercel.app
```
**Expected:** HTML landing page (200 OK)

### 2. Initialize MCP Connection
```bash
curl -X POST https://xmcp-sigma.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    },
    "id": 1
  }'
```
**Expected:** Server capabilities and info

### 3. List Available Tools
```bash
curl -X POST https://xmcp-sigma.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 2
  }'
```
**Expected:** List of available tools (currently: `greet`)

### 4. Test a Tool
```bash
curl -X POST https://xmcp-sigma.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "greet",
      "arguments": {
        "name": "TestUser"
      }
    },
    "id": 3
  }'
```
**Expected:** `{"result":{"content":[{"type":"text","text":"Hello, TestUser!!"}]}}`

### 5. List Available Prompts
```bash
curl -X POST https://xmcp-sigma.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "prompts/list",
    "params": {},
    "id": 4
  }'
```
**Expected:** List of available prompts (currently: `review-code`)

### 6. Test a Prompt
```bash
curl -X POST https://xmcp-sigma.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "prompts/get",
    "params": {
      "name": "review-code",
      "arguments": {
        "code": "function hello() { console.log(\"world\") }"
      }
    },
    "id": 5
  }'
```
**Expected:** Code review prompt template

### 7. List Available Resources
```bash
curl -X POST https://xmcp-sigma.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "resources/list",
    "params": {},
    "id": 6
  }'
```
**Expected:** List of available resources (currently: `config://app`)

### 8. Test a Resource
```bash
curl -X POST https://xmcp-sigma.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "resources/read",
    "params": {
      "uri": "config://app"
    },
    "id": 7
  }'
```
**Expected:** Resource content

## Server Endpoint
```
https://xmcp-sigma.vercel.app/mcp
```

## Expected Server Capabilities
- **Protocol Version:** 2024-11-05
- **Tools:** greet (requires name parameter)
- **Prompts:** review-code (requires code argument)
- **Resources:** config://app (application configuration)

## Troubleshooting
- **405 Method Not Allowed:** Use POST requests, not GET
- **Not Acceptable:** Include `Accept: application/json` header
- **Connection refused:** Check if server is deployed and running

## Success Indicators
- All commands return JSON-RPC 2.0 responses
- No error codes in responses
- Tools execute and return expected content
- Prompts return formatted templates
- Resources return data content

