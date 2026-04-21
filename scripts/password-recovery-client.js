import { supabase, supabaseUrl, supabaseKey } from "./supabase.js";

/**
 * Solicita recuperación de contraseña:
 * 1) Intenta la Edge Function (correo con plantilla MiRest vía Resend).
 * 2) Si falla la red o el servidor (p. ej. Resend no configurado), usa el correo de Supabase Auth (SMTP que tengas en el panel de Supabase).
 */
export async function requestPasswordRecoveryEmail(rawEmail) {
  const email = String(rawEmail || "")
    .trim()
    .toLowerCase();
  if (!email) {
    throw new Error("Indica un correo válido.");
  }

  const redirectTo = `${window.location.origin}/activate.html`;

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-recovery-email`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const payload = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        channel: "branded",
        message:
          payload?.message ||
          "Si el correo está registrado, enviamos un enlace. Revisa la bandeja principal, spam y la carpeta Promociones (Gmail).",
      };
    }
    console.warn("[password-recovery] send-recovery-email respondió", res.status, payload?.message);
  } catch (err) {
    console.warn("[password-recovery] Edge Function no alcanzable, se usará correo de Auth.", err);
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    throw new Error(
      error.message ||
        "No se pudo enviar la recuperación. Revisa en Supabase (Authentication → Emails / SMTP) que el envío esté activo.",
    );
  }

  return {
    channel: "auth",
    message:
      "Hemos pedido el envío por el sistema de correo de Supabase (Auth). Revisa entrada, spam y Promociones; si es la primera vez, en Gmail a veces debes aceptar o marcar como seguro al remitente del dominio que configuraste en Supabase.",
  };
}
