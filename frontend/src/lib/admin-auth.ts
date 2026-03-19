export const ADMIN_SESSION_COOKIE = 'the_suit_admin_session';

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL || 'admin@thesuite.com';
  const password = process.env.ADMIN_PASSWORD || 'SuiteAdmin123!';
  const secret = process.env.ADMIN_SESSION_SECRET || 'change-this-secret';

  return { email, password, secret };
}

export function buildAdminSessionValue() {
  const { email, secret } = getAdminCredentials();
  return `${email}:${secret}`;
}

export function isValidAdminSession(value?: string) {
  return value === buildAdminSessionValue();
}
