function isValidCoordinate(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function getLatestPointGeometry(geometry) {
  if (!Array.isArray(geometry)) {
    return null;
  }

  const pointEntries = geometry.filter((entry) => {
    if (entry?.type !== "Point" || !Array.isArray(entry.coordinates)) {
      return false;
    }

    const [lon, lat] = entry.coordinates;
    return isValidCoordinate(lat) && isValidCoordinate(lon);
  });

  if (pointEntries.length === 0) {
    return null;
  }

  return pointEntries.reduce((latest, entry) => {
    const latestTimestamp = Date.parse(latest.date ?? 0);
    const entryTimestamp = Date.parse(entry.date ?? 0);

    return entryTimestamp >= latestTimestamp ? entry : latest;
  });
}

function normalizeCategories(categories) {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories
    .map((category) => category?.id)
    .filter((categoryId) => typeof categoryId === "string" && categoryId.length > 0);
}

function normalizeSources(sources) {
  if (!Array.isArray(sources)) {
    return [];
  }

  return sources
    .map((source) => source?.url)
    .filter((url) => typeof url === "string" && url.length > 0);
}

export function normalizeEvent(event) {
  const point = getLatestPointGeometry(event?.geometry);

  if (!point) {
    return null;
  }

  const [lon, lat] = point.coordinates;

  return {
    id: event?.id ?? null,
    title: event?.title ?? null,
    description: event?.description ?? null,
    link: event?.link ?? null,
    categories: normalizeCategories(event?.categories),
    sources: normalizeSources(event?.sources),
    location: {
      lat,
      lon,
    },
  };
}
