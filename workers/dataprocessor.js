const { parentPort, workerData } = require("worker_threads");
const { parseXLSX, parseCSV } = require("../utils/fileParser");
const connectDB = require("../config/mongoose");

const Agent = require("../models/Agent");
const User = require("../models/User");
const Account = require("../models/Users_Account");
const PolicyCategory = require("../models/Policy_Category");
const PolicyCarrier = require("../models/Policy_Carrier");
const PolicyInfo = require("../models/PolicyInfo");

async function processData() {
  try {
    await connectDB();

    const { filePath, fileType } = workerData;
    let data;

    if (fileType === "xlsx") {
      data = parseXLSX(filePath);
    } else if (fileType === "csv") {
      data = await parseCSV(filePath);
    } else {
      throw new Error("Unsupported file type");
    }

    const processedCount = {
      agents: 0,
      users: 0,
      accounts: 0,
      categories: 0,
      carriers: 0,
      policies: 0,
    };
    const seenAgents = new Set();
    const seenCategories = new Set();
    const seenCarriers = new Set();
    const seenUsers = new Set();
    let count = 0;
    const size = data.length;
    // const size = 300;
    const onePercent = Math.floor(size / 100);
    const currentPercent = 0;
    for (const row of data) {
      if (count % onePercent === 0) {
        const percent = Math.floor((count / size) * 100);
        if (percent > currentPercent) {
          process.stdout.write(`Progress: ${percent}%\r`);
        }
      }
      count++;

      try {
        //Process Agent
        if (!seenAgents.has(row.agent)) {
          const agent = await Agent.findOne({ Agent_Name: row.agent });
          if (!agent) {
            processedCount.agents++;
          }
          await Agent.findOneAndUpdate(
            { Agent_Name: row.agent },
            { $setOnInsert: { Agent_Name: row.agent } },
            { upsert: true, new: true }
          );
          seenAgents.add(row.agent);
          processedCount.agents++;
        }

        // Process Policy Category
        if (!seenCategories.has(row.category_name)) {
          const category = await PolicyCategory.findOneAndUpdate(
            { category_name: row.category_name },
            { $setOnInsert: { name: row.category_name } },
            { upsert: true, new: true }
          );
          seenCategories.add(row.category_name);
          processedCount.categories++;
        }

        // Process Policy Carrier
        if (!seenCarriers.has(row.company_name)) {
          const carrier = await PolicyCarrier.findOneAndUpdate(
            { company_name: row.company_name },
            { $setOnInsert: { name: row.company_name } },
            { upsert: true, new: true }
          );
          seenCarriers.add(row.company_name);
          processedCount.carriers++;
        }

        // Process User (if email not seen)
        if (!seenUsers.has(row.email)) {
          const agent = await Agent.findOne({ Agent_Name: row.agent });

          const user = await User.findOneAndUpdate(
            { email: row.email.toLowerCase() },
            {
              firstName: row.firstname,
              dob: new Date(row.dob),
              address: row.address,
              phone: row.phone,
              state: row.state,
              zipCode: row.zip,
              email: row.email.toLowerCase(),
              gender: row.gender,
              userType: row.userType,
              city: row.city,
              accountType: row.account_type,
              agentId: agent._id,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          seenUsers.add(row.email);
          processedCount.users++;

          // Process Account
          const account = await Account.findOneAndUpdate(
            { account_name: row.account_name, userId: user._id },
            { $setOnInsert: { name: row.account_name, userId: user._id } },
            { upsert: true, new: true }
          );
          processedCount.accounts++;
        }

        //Process Policy Info
        const user = await User.findOne({ email: row.email.toLowerCase() });
        const category = await PolicyCategory.findOne({
          category_name: row.category_name,
        });
        const carrier = await PolicyCarrier.findOne({
          company_name: row.company_name,
        });

        await PolicyInfo.findOneAndUpdate(
          { policyNumber: row.policy_number },
          {
            policyNumber: row.policy_number,
            policyStartDate: new Date(row.policy_start_date),
            policyEndDate: new Date(row.policy_end_date),
            policyMode: row.policy_mode,
            policyType: row.policy_type,
            premiumAmountWritten: row.premiumAmountWritten
              ? parseFloat(row.premium_amount_written)
              : null,
            premiumAmount: parseFloat(row.premium_amount),
            policyCategoryId: category._id,
            policyCarrierId: carrier._id,
            userId: user._id,
            csr: row.csr,
            hasActiveClientPolicy: row.hasActive === "true",
          },
          { upsert: true }
        );
        processedCount.policies++;
      } catch (error) {
        console.error(`Error processing row: ${JSON.stringify(row)}`, error);
      }
    }

    parentPort.postMessage({ success: true, processedCount });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  } finally {
    if (
      process.env.NODE_ENV === "development" &&
      process.env.DEBUG_MODE === "true"
    ) {
      console.log("success");
    }
  }
}

processData();
