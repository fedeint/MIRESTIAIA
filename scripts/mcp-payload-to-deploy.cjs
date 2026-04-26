/* Genera carga con rutas `functions/...` como en el panel de Supabase, sin index.ts. */
const fs = require("node:fs");
const path = require("node:path");
const base = path.join(__dirname, "..", "supabase", "functions");
const out = {
  name: "manage-user-access",
  entrypoint_path: "functions/manage-user-access/index.js",
  verify_jwt: false,
  files: [
    { name: "functions/manage-user-access/index.js", f: "manage-user-access/index.js" },
    { name: "functions/_shared/mailer.js", f: "_shared/mailer.js" },
    { name: "functions/_shared/recovery-delivery.js", f: "_shared/recovery-delivery.js" },
    { name: "functions/_shared/auth-roles.js", f: "_shared/auth-roles.js" },
  ].map((x) => ({ name: x.name, content: fs.readFileSync(path.join(base, x.f), "utf8") })),
};
const outPath = path.join(__dirname, "..", ".mcp-func-fspath.json");
fs.writeFileSync(outPath, JSON.stringify(out), "utf8");
console.log(outPath, Buffer.byteLength(JSON.stringify(out), "utf8"), "bytes");
