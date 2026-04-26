import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  sendAccessRevokedToUser,
  sendAccessRestoredToUser,
  sendPermissionsUpdatedToUser,
} from "../_shared/mailer.js";
import { deliverPasswordRecoveryViaSupabaseAuth } from "../_shared/recovery-delivery.js";
import { canManageUserAccess, getAuthRole, isSuperadmin } from "../_shared/auth-roles.js";

const BAN_DURATION_REVOKE = "876000h";
const PROTECTED_EMAILS = new Set(["a@a.com"]);

/** CORS con reflejo de Origin (Vercel, localhost) para preflight/respuesta. */
function getCorsHeaders(request) {
  const base = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, accept, prefer, x-supabase-api-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
  if (request) {
    const origin = request.headers.get("Origin");
    if (origin) {
      return { ...base, "Access-Control-Allow-Origin": origin, Vary: "Origin" };
    }
  }
  return { ...base, "Access-Control-Allow-Origin": "*" };
}

function jsonResponse(body, status, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(request), "Content-Type": "application/json" },
  });
}

function getFullName(user) {
  const name = user?.user_metadata?.full_name;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

/**
 * Un admin de organización no puede modificar a un usuario cuyo rol es superadmin.
 */
function isTargetSuperadmin(ut) {
  return getAuthRole(ut) === "superadmin";
}

Deno.serve(async (request) => {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: getCorsHeaders(request) });
    }

    if (request.method !== "POST") {
      return jsonResponse({ message: "Método no permitido" }, 405, request);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = request.headers.get("Authorization");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return jsonResponse({ message: "Configuración incompleta del servicio" }, 500, request);
    }

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return jsonResponse({ message: "Falta encabezado de autorización" }, 401, request);
    }

    const sessionClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: sessionError,
    } = await sessionClient.auth.getUser();

    if (sessionError || !user) {
      return jsonResponse(
        { message: "Sesión inválida o expirada. Vuelve a iniciar sesión e inténtalo de nuevo.", detail: sessionError?.message ?? null },
        401,
        request,
      );
    }

    if (!canManageUserAccess(user)) {
      return jsonResponse(
        {
          message:
            "Necesitas rol de administrador o superadmin. Si recién cambiaste la contraseña, cierra sesión y vuelve a entrar (el token debe actualizarse).",
        },
        403,
        request,
      );
    }

    let body = null;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ message: "Cuerpo JSON inválido" }, 400, request);
    }

    const action = body?.action;
    const targetId = body?.userId?.trim();

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (action === "list") {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (error) return jsonResponse({ message: error.message }, 500, request);

      const mapped = data.users
        .map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          email_confirmed_at: u.email_confirmed_at ?? u.confirmed_at ?? null,
          invited_at: u.invited_at ?? null,
          banned_until: u.banned_until ?? null,
          role:
            (typeof u.app_metadata?.role === "string" ? u.app_metadata.role : null) ||
            (typeof u.user_metadata?.role === "string" ? u.user_metadata.role : null),
          permissions: Array.isArray(u.user_metadata?.permissions)
            ? u.user_metadata.permissions
            : [],
          full_name: typeof u.user_metadata?.full_name === "string" ? u.user_metadata.full_name : null,
          protected: PROTECTED_EMAILS.has((u.email || "").toLowerCase()),
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return jsonResponse({ users: mapped }, 200, request);
    }

    if (!targetId) {
      return jsonResponse({ message: "Falta userId" }, 400, request);
    }

    if (targetId === user.id && (action === "revoke" || action === "delete")) {
      return jsonResponse(
        { message: "No puedes revocar ni eliminar tu propia cuenta de administrador." },
        400,
        request,
      );
    }

    const { data: targetData, error: targetError } = await adminClient.auth.admin.getUserById(targetId);
    if (targetError || !targetData?.user) {
      return jsonResponse({ message: "Usuario no encontrado" }, 404, request);
    }

    const targetUser = targetData.user;
    const targetEmail = (targetUser.email || "").toLowerCase();
    const targetFullName = getFullName(targetUser);
    const protectedAction = action === "revoke" || action === "delete";
    if (PROTECTED_EMAILS.has(targetEmail) && protectedAction) {
      return jsonResponse(
        { message: "Esta cuenta es de demostración y no puede ser revocada ni eliminada." },
        400,
        request,
      );
    }

    const mutating = [
      "revoke",
      "restore",
      "delete",
      "update_role",
      "update_permissions",
      "send_recovery_email",
    ];
    if (!isSuperadmin(user) && isTargetSuperadmin(targetUser) && mutating.includes(action)) {
      return jsonResponse(
        { message: "Solo un superadmin puede modificar a otro superadmin. Pide a quien tenga el rol completo de sistema." },
        403,
        request,
      );
    }

    if (action === "update_role" && (body?.role || "").trim() === "superadmin" && !isSuperadmin(user)) {
      return jsonResponse(
        { message: "Solo un superadmin puede asignar el rol superadmin." },
        403,
        request,
      );
    }

    if (action === "send_recovery_email") {
      if (!targetEmail) {
        return jsonResponse({ message: "Usuario sin correo" }, 400, request);
      }
      const { sent, reason, detail } = await deliverPasswordRecoveryViaSupabaseAuth(
        supabaseUrl,
        supabaseAnonKey,
        targetEmail,
      );
      if (!sent && reason === "recover_failed") {
        console.error("[manage-user-access] send_recovery_email", detail);
        return jsonResponse(
          { message: "No se pudo enviar el correo. Inténtalo más tarde o contacta soporte del sistema." },
          502,
          request,
        );
      }
      return jsonResponse(
        {
          message: `Enlace de recuperación enviado a ${targetEmail}.`,
          mail: { ok: true },
        },
        200,
        request,
      );
    }

    if (action === "revoke") {
      const { error } = await adminClient.auth.admin.updateUserById(targetId, {
        ban_duration: BAN_DURATION_REVOKE,
      });
      if (error) return jsonResponse({ message: error.message }, 500, request);

      const mail = targetEmail
        ? await sendAccessRevokedToUser({ email: targetEmail, fullName: targetFullName })
        : { ok: false, error: { message: "Usuario sin correo" } };

      return jsonResponse(
        {
          message: `Acceso revocado para ${targetEmail}.`,
          mail,
        },
        200,
        request,
      );
    }

    if (action === "restore") {
      const { error } = await adminClient.auth.admin.updateUserById(targetId, {
        ban_duration: "none",
      });
      if (error) return jsonResponse({ message: error.message }, 500, request);

      const mail = targetEmail
        ? await sendAccessRestoredToUser({ email: targetEmail, fullName: targetFullName })
        : { ok: false, error: { message: "Usuario sin correo" } };

      return jsonResponse(
        {
          message: `Acceso restaurado para ${targetEmail}.`,
          mail,
        },
        200,
        request,
      );
    }

    if (action === "delete") {
      const { error } = await adminClient.auth.admin.deleteUser(targetId);
      if (error) return jsonResponse({ message: error.message }, 500, request);
      return jsonResponse({ message: `Usuario ${targetEmail} eliminado permanentemente.` }, 200, request);
    }

    if (action === "update_role") {
      const newRole = body?.role?.trim();
      if (!newRole) return jsonResponse({ message: "Falta role" }, 400, request);

      const currentMetadata = targetUser.user_metadata ?? {};
      const currentApp = targetUser.app_metadata ?? {};
      const { error } = await adminClient.auth.admin.updateUserById(targetId, {
        app_metadata: { ...currentApp, role: newRole },
        user_metadata: { ...currentMetadata, role: newRole },
      });
      if (error) return jsonResponse({ message: error.message }, 500, request);

      const mail = targetEmail
        ? await sendPermissionsUpdatedToUser({
            email: targetEmail,
            fullName: targetFullName,
            role: newRole,
            permissions: Array.isArray(currentMetadata.permissions) ? currentMetadata.permissions : [],
          })
        : { ok: false, error: { message: "Usuario sin correo" } };

      return jsonResponse(
        {
          message: `Rol de ${targetEmail} actualizado a ${newRole}.`,
          mail,
        },
        200,
        request,
      );
    }

    if (action === "update_permissions") {
      const rawPermissions = body?.permissions;
      if (!Array.isArray(rawPermissions)) {
        return jsonResponse({ message: "permissions debe ser un arreglo" }, 400, request);
      }

      const cleaned = rawPermissions
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value.length > 0);

      const currentMetadata = targetUser.user_metadata ?? {};
      const currentApp = targetUser.app_metadata ?? {};
      const nextRole = body?.role?.trim() || currentMetadata.role || currentApp.role;
      if ((nextRole || "") === "superadmin" && !isSuperadmin(user)) {
        return jsonResponse(
          { message: "Solo un superadmin puede dejar a un usuario con rol completo (superadmin)." },
          403,
          request,
        );
      }
      const nextMetadata = { ...currentMetadata, permissions: cleaned };
      if (nextRole) nextMetadata.role = nextRole;
      const nextApp = { ...currentApp };
      if (nextRole) nextApp.role = nextRole;

      const { error } = await adminClient.auth.admin.updateUserById(targetId, {
        user_metadata: nextMetadata,
        app_metadata: nextApp,
      });
      if (error) return jsonResponse({ message: error.message }, 500, request);

      const mail = targetEmail
        ? await sendPermissionsUpdatedToUser({
            email: targetEmail,
            fullName: targetFullName,
            role: nextRole,
            permissions: cleaned,
          })
        : { ok: false, error: { message: "Usuario sin correo" } };

      return jsonResponse(
        {
          message: `Módulos actualizados para ${targetEmail} (${cleaned.length} habilitados).`,
          mail,
        },
        200,
        request,
      );
    }

    return jsonResponse({ message: "Acción no permitida" }, 400, request);
  } catch (err) {
    console.error("[manage-user-access]", err);
    return jsonResponse(
      { message: err?.message || "Error interno del servicio" },
      500,
      request,
    );
  }
});
