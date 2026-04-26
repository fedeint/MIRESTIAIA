import { supabase } from "./supabase.js";

/** Recuperación vía Auth: correo con enlace a activate.html */
export async function requestPasswordRecoveryEmail(rawEmail) {
  const email = String(rawEmail || "")
    .trim()
    .toLowerCase();
  if (!email) {
    throw new Error("Indica un correo válido.");
  }

  const redirectTo = `${window.location.origin}/activate.html`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    throw new Error(
      "No se pudo enviar el enlace. Inténtalo de nuevo en unos minutos.",
    );
  }

  return {
    channel: "auth",
    message:
      "Si el correo está en el sistema, te llegará un enlace para elegir una contraseña nueva. Revisa también la carpeta de no deseados o promociones.",
  };
}
