import cron from "node-cron";
import sendEmailService from "./emailService.js"; // Ensure the file path ends with .js

// Map to store scheduled cron jobs for users
const scheduledJobs = new Map();

// Function to convert 12-hour format to 24-hour format
function convertTo24HourFormat(hour, period) {
  if (period === "AM" || period === "am") {
    if (hour === 12) {
      return 0; // 12 AM is 00:00 in 24-hour format
    } else {
      return hour; // Keep hour as is for AM (1-11 AM)
    }
  } else if (period === "PM" || period === "pm") {
    if (hour === 12) {
      return 12; // 12 PM is 12:00 in 24-hour format
    } else {
      return hour + 12; // Convert PM hour (1-11 PM) to 24-hour format (13-23)
    }
  }
  return hour; // Default to the original hour if the period is not AM/PM
}

// Function to schedule email for a specific user (useful for new users)
async function scheduleEmailForUser(user) {
  let hour = parseInt(user.sendTime, 10); // Converts '9' (string) to 9 (number)
  let period = user.period.toUpperCase(); // Ensure period is in uppercase ('AM' or 'PM')

  // Convert the 12-hour time format to 24-hour format
  const convertedHour = convertTo24HourFormat(hour, period);

  // Prevent scheduling multiple emails for the same time
  const cronTime = `${0} ${convertedHour} * * *`; // Assuming you want to send at the top of the hour

  // Check if job is already scheduled for this user
  if (scheduledJobs.has(user.email)) {
    console.log(`Email for ${user.name} is already scheduled.`);
    return;
  }

  // Schedule the task using node-cron
  const job = cron.schedule(cronTime, () => {
    console.log(`Sending email to ${user.name} with email ${user.email}`);
    sendEmailService(user.name, user.email);
  });

  // Store the job in the Map for later cancellation
  scheduledJobs.set(user.email, job);

  // Log the schedule
  console.log(`Scheduled email for ${user.name} at ${convertedHour}:00`);
}

// Function to unschedule email for a specific user (useful for deleting or updating user)
async function unscheduleEmailForUser(user) {
  const job = scheduledJobs.get(user.email);

  if (job) {
    // Stop the cron job
    job.stop();
    scheduledJobs.delete(user.email); // Remove from the map
    console.log(`Unscheduled email for ${user.name}`);
  } else {
    console.log(`No scheduled email found for ${user.name}`);
  }
}

// Function to schedule emails for all users (called at server start)
async function scheduleEmailsForAllUsers(users) {
  // Using a Set to track the times already scheduled (to avoid duplicates)
  const scheduledTimes = new Set();

  users.forEach((user) => {
    if (user.status) {
      let hour = parseInt(user.sendTime, 10); // Converts '9' (string) to 9 (number)
      let period = user.period.toUpperCase(); // Ensure period is in uppercase ('AM' or 'PM')

      // Convert the 12-hour time format to 24-hour format
      const convertedHour = convertTo24HourFormat(hour, period);

      // Prevent scheduling multiple emails for the same time
      const cronTime = `${0} ${convertedHour} * * *`; // Assuming you want to send at the top of the hour

      // If this cron time has already been scheduled, skip it
      if (scheduledTimes.has(cronTime)) {
        console.log(
          `Email for ${user.name} at ${convertedHour}:00 already scheduled.`
        );
        return;
      }

      // Schedule the task using node-cron
      const job = cron.schedule(cronTime, () => {
        console.log(`Sending email to ${user.name} with email ${user.email}`);
        sendEmailService(user.name, user.email);
      });

      // Store the job in the Map for later cancellation
      scheduledJobs.set(user.email, job);

      // Log the schedule
      console.log(`Scheduled email for ${user.name} at ${convertedHour}:00`);

      // Mark this cron time as scheduled
      scheduledTimes.add(cronTime);
    }
  });
}


export const scheduleService = {
    scheduleEmailForUser,
    scheduleEmailsForAllUsers,
    
  };