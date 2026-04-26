/**
 * Elimina (si existe) y vuelve a crear un usuario con rol superadmin.
 * Usa la API de administración de GoTrue; requiere la clave service_role.
 *
 * NO pases la contraseña en el repo. En PowerShell (misma consola, sin guardar en archivos):
 *
 *   $env:SUPABASE_URL = "https://twneirdsvyxsdsneidhi.supabase.co"
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "<pegar desde Supabase: Settings → API → service_role>"
 *   $env:MIREST_EMAIL = "tu@correo.com"
 *   $env:MIREST_PASSWORD = "nuevaClaveSegura"
 *   node scripts/recreate-superadmin.cjs
 */
const { env } = process;
const supabaseUrl = (env.SUPABASE_URL || "").replace(/\/$/, "");
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const email = (env.MIREST_EMAIL || env.MIREST_SUPER_EMAIL || "").trim();
const password = env.MIREST_PASSWORD || env.MIREST_SUPER_PASSWORD;

function need(name) {
  console.error(`Falta variable de entorno: ${name}`);
  process.exit(1);
}

if (!supabaseUrl) need("SUPABASE_URL");
if (!serviceKey) need("SUPABASE_SERVICE_ROLE_KEY (project Settings → API)");
if (!email) need("MIREST_EMAIL");
if (!password || !String(password).length) need("MIREST_PASSWORD");

const base = `${supabaseUrl}/auth/v1`;
const headers = {
  Authorization: `Bearer ${serviceKey}`,
  apikey: serviceKey,
  "Content-Type": "application/json",
};

async function listAllUsers() {
  const all = [];
  let page = 1;
  const perPage = 200;
  for (let i = 0; i < 20; i += 1) {
    const r = await fetch(
      `${base}/admin/users?page=${page}&per_page=${perPage}`,
      { headers }
    );
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`List users ${r.status}: ${t}`);
    }
    const j = await r.json();
    const u = j.users || j || [];
    all.push(...u);
    if (!j.users || u.length < perPage) break;
    page += 1;
  }
  return all;
}

async function deleteUserById(id) {
  const r = await fetch(`${base}/admin/users/${id}`, {
    method: "DELETE",
    headers,
  });
  if (r.status === 404) return;
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Delete user ${r.status}: ${t}`);
  }
  console.log("Usuario anterior eliminado (auth), id:", id);
}

async function createUser() {
  const r = await fetch(`${base}/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: email.toLowerCase(),
      password: String(password),
      email_confirm: true,
      app_metadata: { role: "superadmin" },
      user_metadata: { role: "superadmin" },
    }),
  });
  const t = await r.text();
  if (!r.ok) {
    throw new Error(`Crear usuario ${r.status}: ${t}`);
  }
  let u;
  try {
    u = JSON.parse(t);
  } catch {
    throw new Error(`Respuesta inesperada: ${t.slice(0, 200)}`);
  }
  return u;
}

async function main() {
  const users = await listAllUsers();
  const found = users.find(
    (x) => (x.email || "").toLowerCase() === email.toLowerCase()
  );
  if (found) {
    await deleteUserById(found.id);
  } else {
    console.log("No había un usuario con ese email en auth (se crea uno nuevo).");
  }

  const u = await createUser();
  console.log("Listo. Superadmin creado / actualizado. Id:", u.id || u.user?.id);
  console.log("Vuelve a entrar en la app con el nuevo correo y contraseña.");
}

main().catch((e) => {
  console.error("Error:", e?.message || e);
  process.exit(1);
});
