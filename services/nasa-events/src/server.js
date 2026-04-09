import { buildApp } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const host = process.env.HOST ?? "0.0.0.0";

const app = buildApp({ logger: true });

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error, "Failed to start nasa-events-service");
  process.exit(1);
}
