import { supabase } from "./supabase.js";

const statusEl = document.getElementById("activateStatus");
const formEl = document.getElementById("activateForm");
const fallbackEl = document.getElementById("activateFallback");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const passwordConfirmEl = document.getElementById("passwordConfirm");
const submitBtn = document.getElementById("activateSubmit");

function setStatus(message, variant = "info") {
  statusEl.textContent = message;
  statusEl.style.display = "block";
  statusEl.dataset.variant = variant;
  statusEl.classList.toggle("error-banner--success", variant === "success");
}

function showFallback() {
  fallbackEl.hidden = false;
}

/** Lee parámetros típicos del callback de Supabase (hash y/o query). */
function parseAuthCallbackParams() {
  const query = new URLSearchParams(window.location.search || "");
  const hashRaw = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
  const hash = new URLSearchParams(hashRaw);
  const pick = (key) => hash.get(key) ?? query.get(key);

  let errorDescription = pick("error_description");
  if (errorDescription) {
    try {
      errorDescription = decodeURIComponent(String(errorDescription).replace(/\+/g, " "));
    } catch {
      // mantener texto crudo
    }
  }

  return {
    error: pick("error"),
    errorCode: pick("error_code"),
    errorDescription,
    type: pick("type"),
  };
}

function isAuthFailureParams(parsed) {
  if (parsed.error) return true;
  const code = String(parsed.errorCode || "").toLowerCase();
  return code === "otp_expired" || code === "flow_state_not_found";
}

async function clearLocalAuth() {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // ignorar
  }
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("sb-") && key.endsWith("-auth-token"))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignorar
  }
}

function bindPasswordToggles() {
  document.querySelectorAll(".password-toggle[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.toggle;
      const input = document.getElementById(targetId);
      if (!input) return;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  });
}

function waitForSession(timeoutMs = 5000) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (session) => {
      if (settled) return;
      settled = true;
      try {
        subscription?.unsubscribe?.();
      } catch {
        // ignore
      }
      clearTimeout(timer);
      resolve(session);
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish(session);
    });
    const subscription = data?.subscription;

    supabase.auth.getSession().then(({ data: payload }) => {
      if (payload?.session) finish(payload.session);
    }).catch(() => {
      // ignoramos; onAuthStateChange o el timeout resolverán
    });

    const timer = setTimeout(() => finish(null), timeoutMs);
  });
}

async function bootstrap() {
  bindPasswordToggles();
  if (window.lucide) window.lucide.createIcons();

  const parsed = parseAuthCallbackParams();

  // Si el enlace expiró o es inválido, NO debemos reutilizar otra sesión abierta
  // en el mismo navegador (p. ej. superadmin): eso mostraba el formulario equivocado
  // o redirigía al panel sin activar la cuenta nueva.
  if (isAuthFailureParams(parsed)) {
    await clearLocalAuth();

    const desc = (parsed.errorDescription || "").toLowerCase();
    const expired =
      String(parsed.errorCode || "").toLowerCase() === "otp_expired" ||
      desc.includes("expired") ||
      desc.includes("invalid");

    const msg = expired
      ? "El enlace de activación caducó o ya se usó. Pide al administrador que reenvíe la invitación desde «Accesos». Si tu cuenta ya existe, usa «Olvidé mi contraseña» en el inicio de sesión."
      : parsed.errorDescription || "El enlace de activación no es válido. Solicita un nuevo enlace al administrador.";

    setStatus(msg, "error");
    showFallback();
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  const session = await waitForSession();

  if (!session?.user) {
    setStatus(
      "No detectamos un enlace de activación válido. Revisa el correo que recibiste y vuelve a abrir el enlace.",
      "error",
    );
    showFallback();
    return;
  }

  emailEl.value = session.user.email ?? "";
  formEl.hidden = false;

  const label = parsed.type === "recovery" ? "Restablece tu contraseña" : "Activa tu cuenta";
  const titleEl = document.getElementById("activateTitle");
  if (titleEl) titleEl.textContent = label;

  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  const password = passwordEl.value.trim();
  const confirm = passwordConfirmEl.value.trim();

  if (password.length < 8) {
    setStatus("La contraseña debe tener al menos 8 caracteres.", "error");
    return;
  }

  if (password !== confirm) {
    setStatus("Las contraseñas no coinciden. Revisa e inténtalo de nuevo.", "error");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Guardando tu contraseña...", "info");

  const { error: updateError } = await supabase.auth.updateUser({ password });

  if (updateError) {
    setStatus(updateError.message || "No pudimos guardar tu contraseña. Vuelve a intentarlo.", "error");
    submitBtn.disabled = false;
    return;
  }

  setStatus("¡Listo! Te llevamos al inicio de sesión para que entres con tu correo y contraseña.", "success");

  const mail = emailEl.value.trim();
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // seguimos igual: el login forzará credenciales nuevas
  }

  const next = new URLSearchParams({ activado: "1" });
  if (mail) next.set("email", mail);

  window.setTimeout(() => {
    window.location.href = `./login.html?${next.toString()}`;
  }, 900);
});

bootstrap();
