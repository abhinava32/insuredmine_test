const messageSchedule = require("../models/MessageShedule");
const createSchedule = require("../utils/scheduler");

const createMessage = async (req, res) => {
  try {
    const { message, day, time } = req.body;

    // Validate input
    if (!message || !day || !time) {
      return res.status(400).json({
        success: false,
        message: "Message, day and time are required",
      });
    }

    // Validate day
    const validDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        message: "Invalid day",
      });
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time format. Use HH:mm",
      });
    }

    // Create new message
    const newMessageSchedule = new messageSchedule({
      message,
      day,
      time,
    });

    // Save to database
    await newMessageSchedule.save();
    await createSchedule();

    return res.status(201).json({
      success: true,
      message: "Message scheduled successfully",
      data: newMessageSchedule,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return res.status(500).json({
      success: false,
      message: "Error scheduling message",
      error: error.message,
    });
  }
};

module.exports = { createMessage };
