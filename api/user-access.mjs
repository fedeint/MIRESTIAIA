/**
 * Proxy Edge: Request.json() fiable. El handler Node anterior podía
 * leer el stream con req.on inexistente o duplicar lectura → 400 Cuerpo inválido.
 */
const UPSTREAM = "https://twneirdsvyxsdsneidhi.supabase.co/functions/v1/manage-user-access";
const BROWSER_TOKEN_KEY = "__mirest_bearer";

const cors = (origin) => {
  const o = origin || "https://mires-ia.vercel.app";
  return {
    "Access-Control-Allow-Origin": o,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, accept, prefer, x-supabase-api-version",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};

export const config = { runtime: "edge" };

export default async function handler(request) {
  const origin = request.headers.get("origin");
  const ch = (name) => request.headers.get(name);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ message: "Método no permitido" }), {
      status: 405,
      headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8", Allow: "POST, OPTIONS" },
    });
  }

  const key = ch("apikey") || ch("x-api-key");
  if (!key) {
    return new Response(JSON.stringify({ message: "Falta encabezado apikey" }), {
      status: 400,
      headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  let parsed;
  try {
    const ct = (ch("content-type") || "").toLowerCase();
    if (ct.includes("application/json")) {
      parsed = await request.json();
    } else {
      const t = await request.text();
      parsed = t ? JSON.parse(t) : {};
    }
  } catch {
    return new Response(JSON.stringify({ message: "JSON inválido" }), {
      status: 400,
      headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (!parsed || typeof parsed !== "object") {
    parsed = {};
  }

  let bodyForUpstream = { ...parsed };
  let tokenFromHeader = ch("authorization");

  if (Object.prototype.hasOwnProperty.call(bodyForUpstream, BROWSER_TOKEN_KEY)) {
    const t = String(bodyForUpstream[BROWSER_TOKEN_KEY] || "");
    delete bodyForUpstream[BROWSER_TOKEN_KEY];
    if (t && t.toLowerCase().startsWith("bearer ")) {
      tokenFromHeader = t;
    } else if (t) {
      tokenFromHeader = `Bearer ${t}`;
    }
  }

  if (!tokenFromHeader || !tokenFromHeader.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ message: "Falta encabezado de autorización" }), {
      status: 401,
      headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const outBody = JSON.stringify(bodyForUpstream);
  let upstream;
  try {
    upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        apikey: String(key),
        Authorization: String(tokenFromHeader).trim(),
        "Content-Type": "application/json",
      },
      body: outBody.length > 2 ? outBody : "{}",
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ message: "No se pudo contactar con el servicio (proxy).", detail: String(e?.message || e) }),
      { status: 502, headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  const outText = await upstream.text();
  const outh = new Headers(cors(origin));
  const uct = upstream.headers.get("content-type");
  if (uct) outh.set("Content-Type", uct);
  else if (outText && outText.trim().startsWith("{")) outh.set("Content-Type", "application/json; charset=utf-8");

  return new Response(outText, { status: upstream.status, headers: outh });
}
