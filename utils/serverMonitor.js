const os = require("os");
const { exec } = require("child_process");

class ServerMonitor {
  constructor(threshold = 70) {
    this.threshold = threshold;
    this.checkInterval = 5000; // Check every 5 seconds
    this.cpuHistory = [];
    this.historyLength = 5; // Keep track of last 5 readings
    this.environment = process.env.NODE_ENV || "development";
    this.restartAttempts = 0;
    this.maxRestartAttempts = 5;
  }

  // Get CPU usage percentage
  async getCPUUsage() {
    return new Promise((resolve) => {
      const startMeasure = this.getCPUInfo();

      // Wait 100ms for accurate measurement
      setTimeout(() => {
        const endMeasure = this.getCPUInfo();
        const percentageCPU = this.calculateCPUUsage(startMeasure, endMeasure);
        resolve(percentageCPU);
      }, 100);
    });
  }

  getCPUInfo() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return { idle: totalIdle, total: totalTick };
  }

  calculateCPUUsage(start, end) {
    const idleDifference = end.idle - start.idle;
    const totalDifference = end.total - start.total;
    const percentageCPU =
      100 - Math.floor((100 * idleDifference) / totalDifference);
    return percentageCPU;
  }

  // Start monitoring
  async startMonitoring(server) {
    console.log(`Starting CPU monitoring (Threshold: ${this.threshold}%)`);

    setInterval(async () => {
      try {
        const usage = await this.getCPUUsage();
        this.cpuHistory.push(usage);

        // Keep only recent history
        if (this.cpuHistory.length > this.historyLength) {
          this.cpuHistory.shift();
        }

        // Calculate average CPU usage
        const avgUsage =
          this.cpuHistory.reduce((a, b) => a + b, 0) / this.cpuHistory.length;

        process.env.DEBUG_MODE === "true" &&
          console.log(
            `Current CPU Usage: ${usage}% | Average: ${avgUsage.toFixed(2)}%`
          );

        // If average CPU usage is above threshold
        if (avgUsage > this.threshold) {
          console.log(
            `\x1b[31mHigh CPU Usage Detected (${avgUsage.toFixed(
              2
            )}%)! Restarting Server...\x1b[0m`
          );
          await this.restartServer(server);
        }
      } catch (error) {
        console.error("Error monitoring CPU:", error);
      }
    }, this.checkInterval);
  }

  // Restart server
  async restartServer(server) {
    try {
      // Close existing connections
      server.close(() => {
        console.log("Server closed. Restarting...");

        // Restart process
        if (this.environment === "production") {
          // For production, use PM2 to restart
          exec("pm2 restart all", (error, stdout, stderr) => {
            if (error) {
              console.error(`Error restarting server: ${error}`);
              return;
            }
            console.log("Server restarting...");
          });
        } else {
          // For development, use Node's process.exit()
          process.exit(1);
        }
      });
    } catch (error) {
      console.error("Error during server restart:", error);
    }
  }
}

module.exports = ServerMonitor;
