export interface FacebookProfile {
  id: string;
  email: string | null;
  name: string;
  picture?: string;
}

interface DebugTokenResponse {
  data?: {
    app_id?: string;
    is_valid?: boolean;
    error?: { message?: string };
  };
}

interface MeResponse {
  id?: string;
  name?: string;
  picture?: { data?: { url?: string } };
  error?: { message?: string };
}

function getAppCredentials(): { appId: string; appSecret: string } {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) throw new Error('FACEBOOK_APP_ID/FACEBOOK_APP_SECRET is not set');
  return { appId, appSecret };
}

// Only requests public_profile (no email permission) — Facebook accounts sign in with
// just id/name/picture, and email is optionally added later via PUT /api/auth/set-email.
export async function verifyFacebookAccessToken(accessToken: string): Promise<FacebookProfile> {
  const { appId, appSecret } = getAppCredentials();

  // Confirm the token is valid and was issued for THIS app, not some other Facebook app
  // (otherwise anyone with a valid Facebook token for a different app could log in as anyone).
  const debugUrl = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`;
  const debugRes = await fetch(debugUrl);
  const debugBody = (await debugRes.json()) as DebugTokenResponse;
  if (!debugRes.ok || !debugBody.data?.is_valid || debugBody.data.app_id !== appId) {
    throw new Error(debugBody.data?.error?.message ?? 'Invalid Facebook access token');
  }

  const meUrl = `https://graph.facebook.com/me?fields=id,name,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`;
  const meRes = await fetch(meUrl);
  const me = (await meRes.json()) as MeResponse;
  if (!meRes.ok || me.error || !me.id) {
    throw new Error(me.error?.message ?? 'Could not fetch Facebook profile');
  }

  return {
    id: me.id,
    email: null,
    name: me.name ?? `Facebook-användare ${me.id}`,
    picture: me.picture?.data?.url,
  };
}
