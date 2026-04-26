/**
 * Proxy del mismo origen hacia manage-user-access.
 * Soporta token en el cuerpo (clave __mirest_bearer) para no enviar
 * Authorization con JWT largo + demasiadas cookies = 494 en el edge.
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

function sendJson(res, status, body) {
  if (!res.getHeader("content-type")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  res.statusCode = status;
  res.end(JSON.stringify(body));
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
  const method = (req.method || "GET").toUpperCase();
  const origin = req.headers.origin;
  withCors(res, origin);

  if (method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { message: "Método no permitido" });
  }

  const key = req.headers["apikey"] || req.headers["x-api-key"];
  if (!key) {
    return sendJson(res, 400, { message: "Falta encabezado apikey" });
  }

  let bodyText;
  try {
    bodyText = await getRequestBody(req);
  } catch (e) {
    return sendJson(res, 400, { message: "Cuerpo inválido" });
  }

  let parsed;
  try {
    parsed = bodyText && bodyText.length ? JSON.parse(bodyText) : {};
  } catch (e) {
    return sendJson(res, 400, { message: "JSON inválido" });
  }

  const BROWSER_TOKEN_KEY = "__mirest_bearer";
  let tokenFromHeader = req.headers.authorization;
  let bodyForUpstream = { ...parsed };
  if (Object.prototype.hasOwnProperty.call(bodyForUpstream, BROWSER_TOKEN_KEY)) {
    const t = String(bodyForUpstream[BROWSER_TOKEN_KEY] || "");
    delete bodyForUpstream[BROWSER_TOKEN_KEY];
    if (t && t.toLowerCase().startsWith("bearer ")) {
      tokenFromHeader = t;
    } else if (t) {
      tokenFromHeader = `Bearer ${t}`;
    }
  }

  if (!tokenFromHeader || !String(tokenFromHeader).toLowerCase().startsWith("bearer ")) {
    return sendJson(res, 401, { message: "Falta encabezado de autorización" });
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
      body: outBody.length ? outBody : "{}",
    });
  } catch (e) {
    return sendJson(res, 502, {
      message: "No se pudo contactar con el servicio (proxy).",
      detail: String(e?.message || e),
    });
  }

  const outText = await upstream.text();
  const ct = upstream.headers.get("content-type");
  if (ct) res.setHeader("Content-Type", ct);
  else if (outText && outText.trim().startsWith("{")) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  }
  res.statusCode = upstream.status;
  res.end(outText);
};
