import { Router } from "express";
import { config } from "../config.js";

const router = Router();
const startTime = Date.now();

const SERVICE_ENTRIES = [
  { name: "nasa-events", url: config.services.nasaEvents },
  { name: "location-context", url: config.services.locationContext },
  { name: "weather-context", url: config.services.weatherContext },
  { name: "air-quality", url: config.services.airQuality },
];

async function pingService(entry) {
  const start = Date.now();
  try {
    const res = await fetch(`${entry.url}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    const responseTime = Date.now() - start;

    if (res.ok) {
      return { status: "up", responseTime };
    }
    return { status: "down", responseTime, error: `HTTP ${res.status}` };
  } catch (err) {
    return {
      status: "down",
      error: err.name === "TimeoutError" ? "timeout" : err.message,
    };
  }
}

router.get("/health", async (_req, res) => {
  const results = await Promise.all(
    SERVICE_ENTRIES.map(async (entry) => ({
      name: entry.name,
      ...(await pingService(entry)),
    })),
  );

  const services = {};
  for (const { name, ...rest } of results) {
    services[name] = rest;
  }

  const upCount = results.filter((r) => r.status === "up").length;
  let status;
  if (upCount === results.length) status = "healthy";
  else if (upCount > 0) status = "degraded";
  else status = "unhealthy";

  res.json({
    status,
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services,
  });
});

export default router;
