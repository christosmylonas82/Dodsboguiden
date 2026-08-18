import geoip from 'geoip-lite';

export interface GeoLocation {
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function getGeolocation(ipAddress: string | undefined): GeoLocation {
  if (!ipAddress) {
    return { country: null, city: null, latitude: null, longitude: null };
  }

  const geo = geoip.lookup(ipAddress);
  if (!geo) {
    return { country: null, city: null, latitude: null, longitude: null };
  }

  return {
    country: geo.country ?? null,
    city: geo.city || null,
    latitude: geo.ll ? geo.ll[0] : null,
    longitude: geo.ll ? geo.ll[1] : null,
  };
}
