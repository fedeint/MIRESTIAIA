/**
 * Consentimiento de cookies / preferencias en páginas auth.
 * Las tipografías web (Google Fonts) solo se cargan tras aceptar o si ya hay consentimiento guardado.
 */

export const COOKIE_CONSENT_KEY = "mirest_cookie_consent_v1";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..800&family=Inter:wght@300..900&display=swap";

function readConsent() {
  try {
    return Boolean(localStorage.getItem(COOKIE_CONSENT_KEY));
  } catch {
    return false;
  }
}

export function injectAuthFonts() {
  if (document.querySelector("link[data-mirest-auth-fonts]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = FONTS_HREF;
  link.setAttribute("data-mirest-auth-fonts", "");
  document.head.appendChild(link);
}

function ensureConsentBar() {
  if (document.getElementById("cookieConsentBar")) return;

  const bar = document.createElement("div");
  bar.id = "cookieConsentBar";
  bar.className = "cookie-consent-bar";
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-modal", "false");
  bar.setAttribute("aria-labelledby", "cookieConsentTitle");
  bar.innerHTML = `
    <div class="cookie-consent-bar__inner">
      <div class="cookie-consent-bar__text">
        <p id="cookieConsentTitle" class="cookie-consent-bar__title">Cookies y privacidad</p>
        <p class="cookie-consent-bar__desc">
          Usamos almacenamiento local para el tema y, si aceptas, cargamos tipografías desde Google Fonts.
          Consulta nuestras políticas para más detalle.
        </p>
        <div class="cookie-consent-bar__links">
          <a href="./legal/privacidad.html">Privacidad</a>
          <a href="./legal/cookies.html">Cookies</a>
          <a href="./legal/terminos.html">Términos</a>
        </div>
      </div>
      <button type="button" class="btn btn--primary cookie-consent-bar__accept" id="cookieConsentAccept">
        Aceptar y continuar
      </button>
    </div>
  `;
  document.body.appendChild(bar);

  bar.querySelector("#cookieConsentAccept")?.addEventListener("click", () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ v: 1, at: Date.now() }));
    } catch {
      /* noop */
    }
    document.cookie = "mirest_consent=1;Path=/;Max-Age=31536000;SameSite=Lax";
    document.body.classList.remove("cookie-consent-visible");
    bar.remove();
    injectAuthFonts();
  });
}

/**
 * Si ya hay consentimiento: inyecta fuentes. Si no: muestra la barra y retrasa fuentes hasta aceptar.
 */
export function initCookieConsentBar() {
  if (readConsent()) {
    injectAuthFonts();
    return;
  }
  document.body.classList.add("cookie-consent-visible");
  ensureConsentBar();
}
