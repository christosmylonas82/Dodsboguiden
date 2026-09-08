declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string } | null; status?: string }) => void,
        options?: { scope?: string },
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
          { scope: 'public_profile' },
        );
      }),
  );
}
