export function adaptLocationResponse(raw) {
  const src = raw?.location || raw?.result || raw?.data || raw || {};

  return {
    name: src.name || src.city_name || src.display_name || src.city || null,
    admin: src.admin || src.state || src.region || src.admin1 || null,
    country: src.country || src.country_name || null,
    countryCode:
      src.countryCode || src.country_code || src.countryISO || null,
  };
}
