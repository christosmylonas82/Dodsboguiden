declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } | null; status?: string }) => void,
        options?: { scope?: string; fallback_redirect_uri?: string },
      ) => void;
    };
  }
}

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;
const OAUTH_STATE_KEY = 'fb_oauth_state';

let sdkPromise: Promise<void> | null = null;

function loadFacebookSdk(): Promise<void> {
  if (!FACEBOOK_APP_ID) {
    return Promise.reject(new Error('Facebook-inloggning är inte konfigurerad'));
  }
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve) => {
      window.fbAsyncInit = function () {
        window.FB?.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v21.0' });
        resolve();
      };
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/sv_SE/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    });
  }
  return sdkPromise;
}

// Starts loading the SDK ahead of time (e.g. on mount of the login page) so the
// actual FB.login() click doesn't have to wait for the script + FB.init round trip.
// Only useful on desktop — the mobile redirect path below never touches the SDK.
export function preloadFacebookSdk(): void {
  loadFacebookSdk().catch(() => {
    // Swallowed — a real failure surfaces again (with a user-facing message) when
    // loginWithFacebookPopup() is actually called from a button click.
  });
}

export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function loginWithFacebookPopup(): Promise<string> {
  return loadFacebookSdk().then(
    () =>
      new Promise<string>((resolve, reject) => {
        if (!window.FB) {
          reject(new Error('Facebook-inloggning kunde inte laddas. Prova igen om en stund.'));
          return;
        }
        window.FB.login(
          (response) => {
            if (response.authResponse?.accessToken) {
              resolve(response.authResponse.accessToken);
            } else {
              reject(new Error('Inloggningen med Facebook avbröts'));
            }
          },
          {
            scope: 'public_profile',
            // Extra safety net for desktop popup-blockers — see redirectToFacebookLogin
            // below for the actual mobile path (a JS-opened popup never triggers the
            // native app, even when it does successfully open, so this alone isn't
            // enough for mobile).
            fallback_redirect_uri: window.location.origin + window.location.pathname,
          },
        );
      }),
  );
}

// Mobile path: skips the JS SDK and popup entirely and navigates the current page
// straight to Facebook's OAuth dialog. A JS-opened popup window never triggers
// Facebook's native-app handoff (Universal/App Links only fire on a real top-level
// navigation), so this is the only reliable way to get "open the Facebook app if
// installed, otherwise continue in the mobile browser" behavior. Requires the exact
// redirect_uri to be listed in the Facebook app's "Valid OAuth Redirect URIs".
export function redirectToFacebookLogin(): void {
  if (!FACEBOOK_APP_ID) {
    throw new Error('Facebook-inloggning är inte konfigurerad');
  }
  const state = crypto.randomUUID();
  sessionStorage.setItem(OAUTH_STATE_KEY, state);

  const redirectUri = window.location.origin + window.location.pathname;
  const url = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  url.searchParams.set('client_id', FACEBOOK_APP_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('scope', 'public_profile');
  url.searchParams.set('state', state);

  window.location.href = url.toString();
}

// Called once on the login/register page's mount to pick up an access token that
// Facebook appended to the URL after a redirect-based login (either the manual mobile
// flow above, or a desktop fallback_redirect_uri round trip).
// Returns null when there's nothing to consume (the normal, non-redirect case).
export function consumeFacebookRedirectToken(): string | null {
  const sources = [window.location.hash.replace(/^#/, ''), window.location.search.replace(/^\?/, '')];
  for (const source of sources) {
    const params = new URLSearchParams(source);
    const token = params.get('access_token');
    if (!token) continue;

    const returnedState = params.get('state');
    const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    history.replaceState(null, '', window.location.pathname);

    if (expectedState && returnedState !== expectedState) {
      return null;
    }
    return token;
  }
  return null;
}
