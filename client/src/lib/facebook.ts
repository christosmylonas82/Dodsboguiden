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
export function preloadFacebookSdk(): void {
  loadFacebookSdk().catch(() => {
    // Swallowed — a real failure surfaces again (with a user-facing message) when
    // loginWithFacebookPopup() is actually called from a button click.
  });
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
            // If the popup fails to open (e.g. blocked by the browser), the SDK
            // redirects the whole page to Facebook's login dialog instead of just
            // failing. Requires this exact URL to be listed in the Facebook app's
            // "Valid OAuth Redirect URIs".
            fallback_redirect_uri: window.location.origin + window.location.pathname,
          },
        );
      }),
  );
}

// Called once on the login/register page's mount to pick up an access token that
// Facebook appended to the URL after a fallback_redirect_uri round trip (see above).
// Returns null when there's nothing to consume (the normal, non-redirect case).
export function consumeFacebookRedirectToken(): string | null {
  const sources = [window.location.hash.replace(/^#/, ''), window.location.search.replace(/^\?/, '')];
  for (const source of sources) {
    const params = new URLSearchParams(source);
    const token = params.get('access_token');
    if (token) {
      history.replaceState(null, '', window.location.pathname);
      return token;
    }
  }
  return null;
}
