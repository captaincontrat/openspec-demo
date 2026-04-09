import app from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`bff-nasa-monitor listening on port ${config.port}`);
});
