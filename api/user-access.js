/**
 * Proxy del mismo origen hacia la Edge Function manage-user-access.
 * Evita que, ante 5xx o SUPABASE_EDGE_RUNTIME_ERROR, el navegador solo
 * muestre error CORS (el gateway de funciones a veces no añade cabeceras CORS a errores).
 */
const UPSTREAM = "https://twneirdsvyxsdsneidhi.supabase.co/functions/v1/manage-user-access";

function withCors(res, origin) {
  const o = origin || "https://mires-ia.vercel.app";
  res.setHeader("Access-Control-Allow-Origin", o);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "authorization, x-client-info, apikey, content-type, accept, prefer, x-supabase-api-version"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Vary", "Origin");
}

function readBodyStream(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function getRequestBody(req) {
  if (req.body != null) {
    if (typeof req.body === "string") return req.body;
    try {
      return JSON.stringify(req.body);
    } catch {
      return String(req.body);
    }
  }
  return readBodyStream(req);
}

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  withCors(res, origin);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ message: "Método no permitido" });
  }

  const auth = req.headers.authorization;
  if (!auth || !String(auth).toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ message: "Falta encabezado de autorización" });
  }

  const key = req.headers["apikey"] || req.headers["x-api-key"];
  if (!key) {
    return res.status(400).json({ message: "Falta encabezado apikey" });
  }

  let bodyText;
  try {
    bodyText = await getRequestBody(req);
  } catch (e) {
    return res.status(400).json({ message: "Cuerpo inválido" });
  }

  let upstream;
  try {
    upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        apikey: String(key),
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: bodyText && bodyText.length ? bodyText : "{}",
    });
  } catch (e) {
    return res
      .status(502)
      .json({ message: "No se pudo contactar con el servicio (proxy).", detail: String(e?.message || e) });
  }

  const outText = await upstream.text();
  const ct = upstream.headers.get("content-type");
  if (ct) res.setHeader("Content-Type", ct);
  else if (outText && outText.trim().startsWith("{")) res.setHeader("Content-Type", "application/json");
  return res.status(upstream.status).end(outText);
};
