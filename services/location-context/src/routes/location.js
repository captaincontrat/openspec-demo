const { Router } = require("express");
const { createNominatimClient, NominatimError } = require("../services/nominatim");

const router = Router();
const client = createNominatimClient();

router.get("/", async (req, res) => {
  const { lat, lon } = req.query;

  if (lat === undefined || lon === undefined) {
    return res.status(400).json({
      error: "Missing required query parameters: lat and lon",
    });
  }

  const latNum = Number(lat);
  const lonNum = Number(lon);

  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
    return res.status(400).json({
      error: "lat and lon must be valid numbers",
    });
  }

  try {
    const location = await client.reverseGeocode(latNum, lonNum);
    return res.json({ lat: latNum, lon: lonNum, location });
  } catch (err) {
    if (err instanceof NominatimError) {
      return res.status(503).json({
        error: err.timeout
          ? "Upstream geocoding service timed out"
          : "Upstream geocoding service is unavailable",
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
