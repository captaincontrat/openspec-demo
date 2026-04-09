import test from "node:test";
import assert from "node:assert/strict";

import { normalizeEvent } from "../../src/normalize-event.js";

test("normalizeEvent returns the latest valid point and simplified fields", () => {
  const result = normalizeEvent({
    id: "EONET_1",
    title: "Storm Alpha",
    description: "Open storm event",
    link: "https://example.test/events/EONET_1",
    categories: [
      { id: "severeStorms", title: "Severe Storms" },
      { id: "wildfires", title: "Wildfires" },
    ],
    sources: [
      { id: "SRC1", url: "https://source.test/1" },
      { id: "SRC2", url: "https://source.test/2" },
    ],
    geometry: [
      {
        date: "2026-04-09T00:00:00Z",
        type: "Point",
        coordinates: [10, 20],
      },
      {
        date: "2026-04-10T00:00:00Z",
        type: "Point",
        coordinates: [11, 21],
      },
    ],
  });

  assert.deepEqual(result, {
    id: "EONET_1",
    title: "Storm Alpha",
    description: "Open storm event",
    link: "https://example.test/events/EONET_1",
    categories: ["severeStorms", "wildfires"],
    sources: ["https://source.test/1", "https://source.test/2"],
    location: {
      lat: 21,
      lon: 11,
    },
  });
});

test("normalizeEvent omits events without a valid point geometry", () => {
  const polygonOnly = normalizeEvent({
    id: "EONET_2",
    geometry: [
      {
        type: "Polygon",
        coordinates: [],
      },
    ],
  });

  const invalidPoint = normalizeEvent({
    id: "EONET_3",
    geometry: [
      {
        type: "Point",
        coordinates: ["bad", 12],
      },
    ],
  });

  assert.equal(polygonOnly, null);
  assert.equal(invalidPoint, null);
});
