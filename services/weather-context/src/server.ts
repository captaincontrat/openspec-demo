import express from "express";
import { validateCoordinates } from "./validator.js";
import { fetchWeather } from "./adapter.js";
import { mapToDTO } from "./mapper.js";

const PORT = 3003;

export const app = express();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/weather", async (req, res) => {
  const result = validateCoordinates(req.query.lat, req.query.lon);
  if (!result.valid) {
    res.status(result.status).json(result.body);
    return;
  }

  try {
    const raw = await fetchWeather(result.lat, result.lon);
    const dto = mapToDTO(result.lat, result.lon, raw);
    res.json(dto);
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream_unavailable";
    if (message === "upstream_invalid_response") {
      res.status(502).json({ error: "upstream_invalid_response" });
    } else {
      res.status(502).json({ error: "upstream_unavailable" });
    }
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`weather-context-service listening on port ${PORT}`);
  });
}
