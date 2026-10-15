// Accès à l'espace /admin : vérification email SuperAdmin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const allowed = (process.env.ADMIN_EMAILS || 'kaneabdel@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  
  if (!allowed.includes('kaneabdel@gmail.com')) {
    allowed.push('kaneabdel@gmail.com')
  }

  return allowed.includes(email.toLowerCase())
}
