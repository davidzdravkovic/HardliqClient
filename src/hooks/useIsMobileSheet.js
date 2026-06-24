import { useEffect, useState } from 'react';

const MOBILE_SHEET_QUERY = '(max-width: 768px)';

export function useIsMobileSheet() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_SHEET_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_SHEET_QUERY);
    const onChange = () => setIsMobile(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
