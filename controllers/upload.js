const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs");

const uploadFile = async (req, res) => {
  process.env.NODE_ENV !== "production" && console.log("uploadFile called");
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();
    if (!["xlsx", "csv"].includes(fileExtension)) {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ message: "Only XLSX and CSV files are allowed" });
    }

    const worker = new Worker(
      path.join(__dirname, "../workers/dataProcessor.js"),
      {
        workerData: {
          filePath: req.file.path,
          fileType: fileExtension,
        },
      }
    );

    worker.on("message", (message) => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      // Clean up the uploaded file
      if (message.success) {
        res.json({
          success: true,
          message: "File processed successfully",
          processedCount: message.processedCount,
        });
      } else {
        res.status(500).json({ error: message.error });
      }
    });

    worker.on("error", (error) => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: `Worker error: ${error.message}` });
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        fs.unlinkSync(req.file.path);
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  } catch (error) {
    console.error("Error in uploadFile:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadFile };
