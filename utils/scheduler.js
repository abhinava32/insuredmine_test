const MessageSchedule = require("../models/MessageShedule");
const Message = require("../models/Message");
const nodeSchedule = require("node-schedule");

const task = async (message) => {
  try {
    const newMessage = await new Message({
      message: message,
    });
    await newMessage.save();
  } catch (err) {
    console.log(err);
  }
};

const calculateNextOccuranceDate = (day) => {
  const targetDayNum = convertDayToNumber(day);
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const currentDayNum = convertDayToNumber(currentDay);
  const daysUntilTarget = (targetDayNum - currentDayNum + 7) % 7;

  const targetDate = new Date();
  return targetDate.setDate(currentDate.getDate() + daysUntilTarget);
};

const convertDayToNumber = (day) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days.indexOf(day);
};

const fixSchedule = async (message, day, time) => {
  try {
    const targetDate = calculateNextOccuranceDate(day);
    const targetTime = new Date(targetDate).setHours(
      time.split(":")[0],
      time.split(":")[1],
      0,
      0
    );
    const targetDateTime = new Date(targetTime);
    const job = nodeSchedule.scheduleJob(targetDateTime, () => {
      task(message);
      console.log("Task executed at", new Date());
      console.log(message);
    });
    if (job) {
      job.on("success", async () => {
        console.log(`Job completed successfully for schedule ${schedule._id}`);
      });

      job.on("error", async (error) => {
        console.error(`Job failed for schedule ${schedule._id}:`, error);
        await MessageSchedule.findByIdAndUpdate(
          schedule._id,
          { status: "failed" },
          { new: true }
        );
      });
    }
  } catch (error) {
    console.error("Error in fixSchedule:", error);
  }
};

const createSchedule = async () => {
  process.env.NODE_ENV !== "production" &&
    process.env.DEBUG_MODE === "true" &&
    console.log("createSchedule called");
  const schedules = await MessageSchedule.find({ status: "pending" });
  if (schedules.length === 0 && process.env.NODE_ENV !== "production") {
    console.log("no pending schedules");
    return;
  }
  for (const schedule of schedules) {
    await fixSchedule(schedule.message, schedule.day, schedule.time);

    // await MessageSchedule.findByIdAndUpdate(schedule._id, { status: "sent" });
  }
  process.env.NODE_ENV !== "production" &&
    console.log(
      "Found and scheduled ",
      schedules.length,
      " pending message schedules"
    );
};

module.exports = createSchedule;
