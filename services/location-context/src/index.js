const express = require("express");
const healthRouter = require("./routes/health");
const locationRouter = require("./routes/location");

const app = express();
const PORT = process.env.PORT || 3002;

app.use("/health", healthRouter);
app.use("/location", locationRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`location-context-service listening on port ${PORT}`);
  });
}

module.exports = { app };
