export const ADMIN_EMAIL = 'admin@pyeonhangil.com'

export function isAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === ADMIN_EMAIL
}
