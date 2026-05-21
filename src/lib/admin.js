export const ADMIN_EMAIL = 'admin@pyeonhangil.com'
export const ADMIN_PASSWORD = 'admin123!'

export function isAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === ADMIN_EMAIL
}
