/**
 * Rol privilegiado para RLS y gates en Edge: solo app_metadata (lo escribe
 * service role / Dashboard). No usar user_metadata para autorización.
 */
export function isSuperadmin(user) {
  const role = typeof user?.app_metadata?.role === "string" ? user.app_metadata.role.trim() : "";
  return role === "superadmin";
}
