const express = require("express");
const app = express();
const ServerMonitor = require("./utils/serverMonitor");
const createSchedule = require("./utils/scheduler");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
require("./config/mongoose")();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.SERVER_PORT;

app.use("/", require("./routes/index"));

// app.listen(port, () => console.log(`listening on port ${port}!`));
const startServer = async () => {
  try {
    const server = app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);

      try {
        await createSchedule();
      } catch (error) {
        console.error("Error initializing scheduler:", error);
      }

      // Initialize and start monitoring
      const monitor = new ServerMonitor(70);
      monitor.startMonitoring(server);
    });

    process.on("SIGTERM", () => {
      console.log("Received SIGTERM. Performing graceful shutdown...");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
