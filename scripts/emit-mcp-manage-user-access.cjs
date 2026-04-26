/**
 * Genera .mcp-manage-user-access-payload.json para el MCP deploy_edge_function.
 * Uso: node scripts/emit-mcp-manage-user-access.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const base = path.join(__dirname, "..", "supabase", "functions");
const files = [
  { name: "index.js", f: path.join(base, "manage-user-access", "index.js") },
  { name: "../_shared/mailer.js", f: path.join(base, "_shared", "mailer.js") },
  { name: "../_shared/recovery-delivery.js", f: path.join(base, "_shared", "recovery-delivery.js") },
  { name: "../_shared/auth-roles.js", f: path.join(base, "_shared", "auth-roles.js") },
].map(({ name, f }) => ({ name, content: fs.readFileSync(f, "utf8") }));
const out = {
  name: "manage-user-access",
  entrypoint_path: "index.js",
  verify_jwt: false,
  files,
};
const outPath = path.join(__dirname, "..", ".mcp-manage-user-access-payload.json");
fs.writeFileSync(outPath, JSON.stringify(out), "utf8");
console.log("OK", outPath, Math.round(outPath.length + JSON.stringify(out).length / 1024), "KB approx");
