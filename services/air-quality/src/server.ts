import { loadConfig } from "./config.js";
import { buildApp } from "./app.js";
import { pathToFileURL } from "node:url";

export async function startServer() {
  const config = loadConfig();
  const app = buildApp({ config });

  await app.listen({
    host: config.host,
    port: config.port,
  });

  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
