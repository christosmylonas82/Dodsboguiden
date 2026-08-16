import { useEffect, useState } from 'react';

const STORAGE_KEY = 'dodsboguiden_cookie_consent';

export function useCookieConsent() {
  const [shouldShowBanner, setShouldShowBanner] = useState(false);

  useEffect(() => {
    setShouldShowBanner(localStorage.getItem(STORAGE_KEY) !== 'dismissed');
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    setShouldShowBanner(false);
  }

  return { shouldShowBanner, dismiss };
}
