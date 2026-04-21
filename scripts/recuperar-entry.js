import { requestPasswordRecoveryEmail } from "./password-recovery-client.js?v=20260424-no-resend-recovery";
import { initializeThemeToggle } from "./navigation.js?v=20260422-recovery";
import { hydrateAuthIconPlaceholders, ICON, ICON_SPINNER } from "./auth-inline-icons.js?v=20260421-auth-icons";
import { initCookieConsentBar } from "./cookie-consent.js?v=20260421-cookies";

hydrateAuthIconPlaceholders();
initCookieConsentBar();

document.body.classList.add("page-ready");
initializeThemeToggle(document.getElementById("themeToggle"));

const form = document.getElementById("publicRecoveryForm");
const emailInput = document.getElementById("recovery_page_email");
const msg = document.getElementById("recoveryPageMessage");
const submitBtn = document.getElementById("recoveryPageSubmit");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  submitBtn.disabled = true;
  submitBtn.innerHTML = `${ICON_SPINNER} Enviando...`;
  msg.style.display = "none";

  try {
    const { message } = await requestPasswordRecoveryEmail(email);
    msg.textContent = message;
    msg.className = "request-banner request-banner--success";
    msg.style.display = "block";
  } catch (err) {
    console.error("[recovery-page]", err);
    msg.textContent =
      err?.message ||
      "Intenta de nuevo en unos minutos. Si administras el proyecto, revisa SMTP y plantillas en Supabase (Authentication → Emails).";
    msg.className = "request-banner request-banner--error";
    msg.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `${ICON.send} Enviar enlace`;
  }
});
