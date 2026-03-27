const ADMIN_SESSION_COOKIE = 'the_suit_admin_session';

const getAdminSecret = () => process.env.ADMIN_SESSION_SECRET || 'change-this-secret';

const getAdminAccounts = () => [
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

const parseCookieHeader = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((acc, cookie) => {
      const separatorIndex = cookie.indexOf('=');

      if (separatorIndex === -1) {
        return acc;
      }

      const key = cookie.slice(0, separatorIndex).trim();
      const value = cookie.slice(separatorIndex + 1).trim();

      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

const getAdminSessionFromValue = (value) => {
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
};

const getAdminSessionFromRequest = (req) => {
  const cookies = parseCookieHeader(req.headers.cookie || '');
  return getAdminSessionFromValue(cookies[ADMIN_SESSION_COOKIE]);
};

module.exports = {
  ADMIN_SESSION_COOKIE,
  getAdminAccounts,
  getAdminSessionFromRequest,
  getAdminSessionFromValue,
};
