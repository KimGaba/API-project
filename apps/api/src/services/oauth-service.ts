import { getConfigValue } from './config-service.js';

export type OAuthProfile = {
  providerUserId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export async function buildGitHubAuthUrl(state: string, callbackUrl: string): Promise<string | null> {
  const clientId = await getConfigValue('GITHUB_CLIENT_ID');
  if (!clientId) return null;
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('scope', 'user:email');
  url.searchParams.set('state', state);
  return url.toString();
}

export async function buildGoogleAuthUrl(state: string, callbackUrl: string): Promise<string | null> {
  const clientId = await getConfigValue('GOOGLE_CLIENT_ID');
  if (!clientId) return null;
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'offline');
  return url.toString();
}

export async function exchangeGitHubCode(code: string, callbackUrl: string): Promise<OAuthProfile> {
  const clientId = await getConfigValue('GITHUB_CLIENT_ID');
  const clientSecret = await getConfigValue('GITHUB_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('GitHub OAuth is not configured');

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: callbackUrl }),
  });
  const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
  if (!tokenData.access_token) throw new Error(tokenData.error ?? 'GitHub token exchange failed');

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'CompanyData/1.0' },
  });
  const user = await userRes.json() as { id: number; login: string; name: string | null; avatar_url: string | null; email: string | null };

  let email = user.email;
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'CompanyData/1.0' },
    });
    const emails = await emailsRes.json() as { email: string; primary: boolean; verified: boolean }[];
    const primary = emails.find(e => e.primary && e.verified) ?? emails.find(e => e.verified);
    email = primary?.email ?? null;
  }
  if (!email) throw new Error('Could not retrieve a verified email from GitHub');

  return {
    providerUserId: String(user.id),
    email,
    name: user.name ?? user.login,
    avatarUrl: user.avatar_url ?? null,
  };
}

export async function exchangeGoogleCode(code: string, callbackUrl: string): Promise<OAuthProfile> {
  const clientId = await getConfigValue('GOOGLE_CLIENT_ID');
  const clientSecret = await getConfigValue('GOOGLE_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('Google OAuth is not configured');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    }).toString(),
  });
  const tokenData = await tokenRes.json() as { access_token?: string; error?: string; error_description?: string };
  if (!tokenData.access_token) throw new Error(tokenData.error_description ?? tokenData.error ?? 'Google token exchange failed');

  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const info = await userRes.json() as { sub: string; email: string; name: string | null; picture: string | null };

  return {
    providerUserId: info.sub,
    email: info.email,
    name: info.name ?? null,
    avatarUrl: info.picture ?? null,
  };
}
