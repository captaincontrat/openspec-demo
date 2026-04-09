import { Router } from "express";
import { eventsCache, detailCache } from "../cache.js";
import { fetchEvents } from "../services/nasa-events.service.js";
import { fetchLocation } from "../services/location-context.service.js";
import { fetchWeather } from "../services/weather-context.service.js";
import { fetchAirQuality } from "../services/air-quality.service.js";

const router = Router();

router.get("/api/events", async (_req, res) => {
  const cacheKey = "events";
  const cached = eventsCache.get(cacheKey);
  if (cached) return res.json(cached);

  const result = await fetchEvents();

  if (result.status === "error") {
    return res.status(502).json({ error: result.error });
  }

  const body = { events: result.data };
  eventsCache.set(cacheKey, body);
  res.json(body);
});

router.get("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { lat, lon } = req.query;

  if (lat == null || lon == null) {
    return res
      .status(400)
      .json({ error: "lat and lon query parameters are required" });
  }

  const cacheKey = `detail:${id}:${lat}:${lon}`;
  const cached = detailCache.get(cacheKey);
  if (cached) return res.json(cached);

  const [locationResult, weatherResult, airQualityResult] =
    await Promise.allSettled([
      fetchLocation(lat, lon),
      fetchWeather(lat, lon),
      fetchAirQuality(lat, lon),
    ]);

  function wrapResult(settled) {
    if (settled.status === "rejected") {
      return { status: "error", error: settled.reason?.message || "Unknown error", data: null };
    }
    const val = settled.value;
    if (val.status === "error") {
      return { status: "error", error: val.error, data: null };
    }
    return { status: "ok", data: val.data };
  }

  const body = {
    event: { id, lat: Number(lat), lon: Number(lon) },
    location: wrapResult(locationResult),
    weather: wrapResult(weatherResult),
    airQuality: wrapResult(airQualityResult),
  };

  const hasAnyData =
    body.location.status === "ok" ||
    body.weather.status === "ok" ||
    body.airQuality.status === "ok";

  if (hasAnyData) {
    detailCache.set(cacheKey, body);
  }

  res.json(body);
});

export default router;
