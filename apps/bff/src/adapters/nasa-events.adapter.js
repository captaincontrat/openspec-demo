import { CATEGORY_STYLES } from "../config.js";

function resolveCategory(raw, categories) {
  if (raw) {
    const id = raw.id || raw.category_id || raw.categoryId || null;
    const title = raw.title || raw.name || raw.category_name || null;
    return { id, title };
  }
  if (Array.isArray(categories) && categories.length > 0) {
    return { id: categories[0], title: categories[0] };
  }
  return { id: null, title: null };
}

function resolveCategoryStyle(categoryId) {
  if (!categoryId) return { color: "#A0AEC0", icon: "unknown" };

  const normalized = categoryId
    .replace(/[\s-]+/g, "")
    .replace(/^./, (c) => c.toLowerCase());

  return CATEGORY_STYLES[normalized] || { color: "#A0AEC0", icon: "unknown" };
}

function resolveCoordinates(geometry) {
  if (!geometry) return null;

  const coords = geometry.coordinates || geometry.coords || geometry;
  if (coords.lat !== undefined && coords.lon !== undefined) {
    return { lat: coords.lat, lon: coords.lon };
  }
  if (coords.latitude !== undefined && coords.longitude !== undefined) {
    return { lat: coords.latitude, lon: coords.longitude };
  }
  if (Array.isArray(coords) && coords.length >= 2) {
    return { lat: coords[1], lon: coords[0] };
  }
  return null;
}

function adaptEvent(raw) {
  const category = resolveCategory(raw?.category, raw?.categories);
  const style = resolveCategoryStyle(category.id);
  const geometry = raw?.geometry || raw?.geo || null;
  const location = raw?.location || null;

  return {
    id: raw?.id || raw?.event_id || null,
    title: raw?.title || raw?.name || null,
    category: { ...category, ...style },
    sources: raw?.sources || raw?.source || [],
    geometry: {
      date: geometry?.date || geometry?.timestamp || null,
      coordinates: resolveCoordinates(geometry) || resolveCoordinates(location),
    },
  };
}

export function adaptNasaEventsResponse(raw) {
  const events = raw?.events || raw?.data || raw?.items || [];
  if (!Array.isArray(events)) return [];
  return events.map(adaptEvent);
}
