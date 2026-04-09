import { describe, it, expect } from "vitest";
import { adaptNasaEventsResponse } from "../../../src/adapters/nasa-events.adapter.js";

describe("nasa-events adapter", () => {
  it("normalizes a standard contract response", () => {
    const raw = {
      events: [
        {
          id: "EONET_1",
          title: "Wildfire - California",
          category: { id: "wildfires", title: "Wildfires" },
          sources: [{ id: "InciWeb", url: "https://example.com" }],
          geometry: {
            date: "2026-04-08T00:00:00Z",
            coordinates: { lat: 34.05, lon: -118.24 },
          },
        },
      ],
    };

    const result = adaptNasaEventsResponse(raw);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("EONET_1");
    expect(result[0].title).toBe("Wildfire - California");
    expect(result[0].category.id).toBe("wildfires");
    expect(result[0].category.color).toBe("#E53E3E");
    expect(result[0].category.icon).toBe("flame");
    expect(result[0].geometry.coordinates).toEqual({ lat: 34.05, lon: -118.24 });
  });

  it("handles deviated field names", () => {
    const raw = {
      data: [
        {
          event_id: "EV_2",
          name: "Flood",
          category: { category_id: "floods", name: "Floods" },
          geo: {
            timestamp: "2026-04-07T12:00:00Z",
            coords: { latitude: 10.0, longitude: 20.0 },
          },
        },
      ],
    };

    const result = adaptNasaEventsResponse(raw);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("EV_2");
    expect(result[0].title).toBe("Flood");
    expect(result[0].category.id).toBe("floods");
    expect(result[0].category.color).toBe("#3182CE");
    expect(result[0].geometry.date).toBe("2026-04-07T12:00:00Z");
    expect(result[0].geometry.coordinates).toEqual({ lat: 10.0, lon: 20.0 });
  });

  it("handles array-style coordinates [lon, lat]", () => {
    const raw = {
      events: [
        {
          id: "EV_3",
          title: "Storm",
          category: { id: "severeStorms", title: "Severe Storms" },
          geometry: {
            date: "2026-04-06",
            coordinates: [-100.5, 35.2],
          },
        },
      ],
    };

    const result = adaptNasaEventsResponse(raw);
    expect(result[0].geometry.coordinates).toEqual({ lat: 35.2, lon: -100.5 });
  });

  it("returns empty array for null/undefined/missing events", () => {
    expect(adaptNasaEventsResponse(null)).toEqual([]);
    expect(adaptNasaEventsResponse(undefined)).toEqual([]);
    expect(adaptNasaEventsResponse({})).toEqual([]);
  });

  it("normalizes actual nasa-events service response (categories array + location)", () => {
    const raw = {
      source: "NASA EONET",
      events: [
        {
          id: "EONET_6388",
          title: "Wildfire - California",
          description: null,
          link: "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_6388",
          categories: ["wildfires"],
          sources: ["https://inciweb.wildfire.gov"],
          location: { lat: 34.05, lon: -118.24 },
        },
      ],
    };

    const result = adaptNasaEventsResponse(raw);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("EONET_6388");
    expect(result[0].title).toBe("Wildfire - California");
    expect(result[0].category.id).toBe("wildfires");
    expect(result[0].category.color).toBe("#E53E3E");
    expect(result[0].category.icon).toBe("flame");
    expect(result[0].geometry.coordinates).toEqual({ lat: 34.05, lon: -118.24 });
    expect(result[0].sources).toEqual(["https://inciweb.wildfire.gov"]);
  });

  it("assigns fallback style for unknown categories", () => {
    const raw = {
      events: [
        {
          id: "EV_4",
          title: "Unknown Event",
          category: { id: "unknownCategory", title: "Unknown" },
          geometry: { date: null, coordinates: { lat: 0, lon: 0 } },
        },
      ],
    };

    const result = adaptNasaEventsResponse(raw);
    expect(result[0].category.color).toBe("#A0AEC0");
    expect(result[0].category.icon).toBe("unknown");
  });
});
