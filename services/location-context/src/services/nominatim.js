const USER_AGENT = "location-context-service/1.0";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/reverse";
const REQUEST_INTERVAL_MS = 1_000;
const REQUEST_TIMEOUT_MS = 10_000;
const COORDINATE_PRECISION = 4;

class NominatimError extends Error {
  constructor(message, { timeout = false } = {}) {
    super(message);
    this.name = "NominatimError";
    this.timeout = timeout;
  }
}

function roundCoord(value) {
  return Number(Number(value).toFixed(COORDINATE_PRECISION));
}

function cacheKey(lat, lon) {
  return `${roundCoord(lat)},${roundCoord(lon)}`;
}

function formatLocation(address) {
  const parts = [
    address.city || address.town || address.village || address.hamlet,
    address.state || address.region,
    address.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Unknown location";
}

function createNominatimClient() {
  const cache = new Map();
  const queue = [];
  let draining = false;
  let lastRequestTime = 0;

  async function fetchFromNominatim(lat, lon) {
    const url = `${NOMINATIM_BASE}?lat=${lat}&lon=${lon}&format=json&accept-language=fr`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res;
    try {
      res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new NominatimError("Nominatim request timed out", { timeout: true });
      }
      throw new NominatimError(`Nominatim request failed: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      throw new NominatimError(
        `Nominatim responded with HTTP ${res.status}`
      );
    }

    const data = await res.json();
    return formatLocation(data.address || {});
  }

  async function drain() {
    if (draining) return;
    draining = true;

    while (queue.length > 0) {
      const elapsed = Date.now() - lastRequestTime;
      if (elapsed < REQUEST_INTERVAL_MS) {
        await new Promise((r) => setTimeout(r, REQUEST_INTERVAL_MS - elapsed));
      }

      const { lat, lon, resolve, reject } = queue.shift();
      const key = cacheKey(lat, lon);

      if (cache.has(key)) {
        resolve(cache.get(key));
        continue;
      }

      lastRequestTime = Date.now();
      try {
        const location = await fetchFromNominatim(lat, lon);
        cache.set(key, location);
        resolve(location);
      } catch (err) {
        reject(err);
      }
    }

    draining = false;
  }

  function reverseGeocode(lat, lon) {
    const key = cacheKey(lat, lon);
    if (cache.has(key)) {
      return Promise.resolve(cache.get(key));
    }

    return new Promise((resolve, reject) => {
      queue.push({ lat: roundCoord(lat), lon: roundCoord(lon), resolve, reject });
      drain();
    });
  }

  return { reverseGeocode, _cache: cache, _queue: queue };
}

module.exports = {
  createNominatimClient,
  NominatimError,
  formatLocation,
  roundCoord,
  cacheKey,
};
