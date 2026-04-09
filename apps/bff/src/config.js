export const config = {
  port: process.env.BFF_PORT || 3000,

  services: {
    nasaEvents: process.env.NASA_EVENTS_URL || "http://localhost:3001",
    locationContext: process.env.LOCATION_CONTEXT_URL || "http://localhost:3002",
    weatherContext: process.env.WEATHER_CONTEXT_URL || "http://localhost:3003",
    airQuality: process.env.AIR_QUALITY_URL || "http://localhost:3004",
  },

  cache: {
    eventsTTL: 300,
    detailTTL: 120,
  },

  fetchTimeout: 5000,
};

export const CATEGORY_STYLES = {
  wildfires: { color: "#E53E3E", icon: "flame" },
  volcanoes: { color: "#DD6B20", icon: "volcano" },
  severeStorms: { color: "#805AD5", icon: "storm" },
  floods: { color: "#3182CE", icon: "water" },
  seaLakeIce: { color: "#00B5D8", icon: "snowflake" },
  snow: { color: "#E2E8F0", icon: "snowflake" },
  earthquakes: { color: "#8B6914", icon: "earthquake" },
  landslides: { color: "#6B4226", icon: "landslide" },
  drought: { color: "#D69E2E", icon: "sun" },
  dustHaze: { color: "#C4A35A", icon: "haze" },
  tempExtremes: { color: "#C53030", icon: "thermometer" },
  waterColor: { color: "#38A169", icon: "droplet" },
  manmade: { color: "#718096", icon: "alert" },
};
