import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import healthRouter from "./routes/health.js";
import eventsRouter from "./routes/events.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(healthRouter);
app.use(eventsRouter);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
