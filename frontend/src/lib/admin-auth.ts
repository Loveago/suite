export const ADMIN_SESSION_COOKIE = 'the_suit_admin_session';

export type AdminRole = 'master' | 'property';

export interface AdminAccount {
  id: string;
  username: string;
  password: string;
  role: AdminRole;
  propertySlug?: string;
  displayName: string;
}

export interface AdminSession {
  id: string;
  username: string;
  role: AdminRole;
  propertySlug?: string;
  displayName: string;
}

function getAdminSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'change-this-secret';
}

export function getAdminAccounts(): AdminAccount[] {
  return [
    {
      id: 'master-admin',
      username: (process.env.ADMIN_EMAIL || 'admin@thesuite.com').trim().toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'SuiteAdmin123!',
      role: 'master',
      displayName: 'Master Admin',
    },
    {
      id: 'the-suite-reception',
      username: (process.env.THE_SUITE_ADMIN_USERNAME || 'suite.reception').trim().toLowerCase(),
      password: process.env.THE_SUITE_ADMIN_PASSWORD || 'SuiteReception123!',
      role: 'property',
      propertySlug: 'the-suite-tema',
      displayName: 'The Suite Reception',
    },
    {
      id: 'kingstel-escape-reception',
      username: (process.env.KINGSTEL_ESCAPE_ADMIN_USERNAME || 'kingstel.reception').trim().toLowerCase(),
      password: process.env.KINGSTEL_ESCAPE_ADMIN_PASSWORD || 'KingstelReception123!',
      role: 'property',
      propertySlug: 'kingstel-escape-accra',
      displayName: 'Kingstel Escape Reception',
    },
  ];
}

export function getAdminAccountByIdentifier(identifier?: string) {
  const normalizedIdentifier = identifier?.trim().toLowerCase();

  if (!normalizedIdentifier) {
    return null;
  }

  return getAdminAccounts().find((account) => account.username === normalizedIdentifier) || null;
}

export function buildAdminSessionValue(account: AdminAccount) {
  return `${account.id}:${getAdminSecret()}`;
}

export function getAdminSession(value?: string): AdminSession | null {
  if (!value) {
    return null;
  }

  const [accountId, secret] = value.split(':');

  if (!accountId || secret !== getAdminSecret()) {
    return null;
  }

  const account = getAdminAccounts().find((item) => item.id === accountId);

  if (!account) {
    return null;
  }

  return {
    id: account.id,
    username: account.username,
    role: account.role,
    propertySlug: account.propertySlug,
    displayName: account.displayName,
  };
}

export function isValidAdminSession(value?: string) {
  return Boolean(getAdminSession(value));
}
