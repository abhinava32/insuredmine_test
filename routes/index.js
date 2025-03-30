const router = require("express").Router();
const { uploadFile } = require("../controllers/upload");
const upload = require("../config/multer");
const { createMessage } = require("../controllers/messageController");
const { insert } = require("../controllers/simpleinsert");
const { search } = require("../controllers/search_policy");
const { getPoliciesByUser } = require("../controllers/policyList_user");

router.get("/search-policy/:name", search);
router.get("/getpolicybyuser", getPoliciesByUser);
router.post("/message-schedule", createMessage);
router.post(
  "/upload",
  upload.single("file"),
  (req, res, next) => {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }
    next();
  },

  (err, req, res, next) => {
    // Handle Multer errors specifically
    if (err) {
      return res.status(400).json({
        error: err.message,
      });
    }
    next();
  },
  uploadFile
);
router.get("/hello", (req, res) => {
  res.send("Hello World!");
});

module.exports = router;
