import NodeCache from "node-cache";
import { config } from "./config.js";

export const eventsCache = new NodeCache({
  stdTTL: config.cache.eventsTTL,
  checkperiod: 60,
});

export const detailCache = new NodeCache({
  stdTTL: config.cache.detailTTL,
  checkperiod: 30,
});
