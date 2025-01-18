import cron from 'node-cron';
import userModel from '../models/user.model.js';
import sendEmailService from './emailService.js';
import { generateContent } from './geminiService.js';

// Store active cron jobs for each user
const userCronJobs = new Map();

// Convert 12-hour time to 24-hour format
const convertTo24Hour = (hour, minute, meridiem) => {
    hour = parseInt(hour);
    if (meridiem === 'PM' && hour !== 12) {
        return { hour: hour + 12, minute };
    }
    if (meridiem === 'AM' && hour === 12) {
        return { hour: 0, minute };
    }
    return { hour, minute };
};

// Convert user time to cron expression
const createCronExpression = (sendTime, sendMinute, meridiem, period) => {
    const { hour: hour24, minute } = convertTo24Hour(sendTime, sendMinute, meridiem);
    
    switch(period.toLowerCase()) {
        case 'daily':
            return `${minute} ${hour24} * * *`;
        case 'weekly':
            return `${minute} ${hour24} * * 1`; // Monday
        case 'monthly':
            return `${minute} ${hour24} 1 * *`; // 1st of month
        default:
            return `${minute} ${hour24} * * *`; // Default to daily
    }
};

// Format time for display
const formatTime = (hour, minute, meridiem) => {
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${hour}:${formattedMinute} ${meridiem}`;
};

// Schedule email for a single user
const scheduleForUser = async (user) => {
    try {
        // Cancel existing job if any
        if (userCronJobs.has(user._id.toString())) {
            userCronJobs.get(user._id.toString()).stop();
            userCronJobs.delete(user._id.toString());
            console.log(`Cancelled existing schedule for user ${user.email}`);
        }

        // Only schedule if user is active
        if (!user.status) {
            console.log(`User ${user.email} is inactive, not scheduling emails`);
            return;
        }

        const cronExpression = createCronExpression(user.sendTime, user.sendMinute, user.meridiem, user.period);
        console.log(`Creating schedule for ${user.email} with cron expression: ${cronExpression}`);
        
        // Create new cron job
        const job = cron.schedule(cronExpression, async () => {
            try {
                console.log(`Executing scheduled email for ${user.email} at ${new Date().toISOString()}`);
                
                // Generate personalized content using Gemini
                console.log(`Generating content for ${user.name} with categories:`, user.categories);
                const content = await generateContent(user.categories, user.name);
                
                // Send email with personalized content
                await sendEmailService(user.name, user.email, content);
                console.log(`Successfully sent scheduled email to ${user.email}`);
            } catch (error) {
                console.error(`Error sending scheduled email to ${user.email}:`, error);
            }
        });

        // Store the job reference
        userCronJobs.set(user._id.toString(), job);
        console.log(`Successfully scheduled emails for ${user.email} at ${formatTime(user.sendTime, user.sendMinute, user.meridiem)} ${user.period}`);
    } catch (error) {
        console.error(`Error scheduling for user ${user.email}:`, error);
    }
};

// Initialize schedules for all active users
const initializeSchedules = async () => {
    try {
        console.log('Starting to initialize schedules for all active users...');
        const users = await userModel.find({ status: true });
        console.log(`Found ${users.length} active users`);
        
        for (const user of users) {
            await scheduleForUser(user);
        }
        
        console.log(`Successfully initialized schedules for ${users.length} active users`);
        
        // Log all active schedules
        console.log('\nCurrent Active Schedules:');
        for (const [userId, job] of userCronJobs.entries()) {
            const user = users.find(u => u._id.toString() === userId);
            if (user) {
                console.log(`- ${user.email}: ${formatTime(user.sendTime, user.sendMinute, user.meridiem)} ${user.period}`);
            }
        }
    } catch (error) {
        console.error('Error initializing schedules:', error);
        throw error;
    }
};

// Update schedule for a user
const updateSchedule = async (userId) => {
    try {
        console.log(`Updating schedule for user ${userId}`);
        const user = await userModel.findById(userId);
        if (user) {
            await scheduleForUser(user);
        } else {
            console.log(`User ${userId} not found`);
        }
    } catch (error) {
        console.error(`Error updating schedule for user ${userId}:`, error);
        throw error;
    }
};

export { initializeSchedules, updateSchedule, scheduleForUser };
