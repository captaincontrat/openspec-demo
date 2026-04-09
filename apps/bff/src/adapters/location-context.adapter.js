export function adaptLocationResponse(raw) {
  const loc = raw?.location;

  if (typeof loc === "string") {
    const parts = loc.split(", ");
    return {
      name: parts[0] || null,
      admin: parts.length > 2 ? parts[1] : null,
      country: parts.length > 2 ? parts[2] : parts[1] || null,
      countryCode: null,
    };
  }

  const src = loc || raw?.result || raw?.data || raw || {};

  return {
    name: src.name || src.city_name || src.display_name || src.city || null,
    admin: src.admin || src.state || src.region || src.admin1 || null,
    country: src.country || src.country_name || null,
    countryCode:
      src.countryCode || src.country_code || src.countryISO || null,
  };
}
