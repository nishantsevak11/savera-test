import userModel from '../models/user.model.js';
import { updateSchedule } from '../service/schedulerService.js';

// Get email preferences
export const getEmailPreferences = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format time for response
        const minute = user.sendMinute.toString().padStart(2, '0');

        res.status(200).json({
            preferences: {
                hour: user.sendTime,
                minute: user.sendMinute,
                meridiem: user.meridiem,
                formattedTime: `${user.sendTime}:${minute} ${user.meridiem}`,
                period: user.period,
                categories: user.categories,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error getting preferences', error: error.message });
    }
};

// Update email preferences
export const updateEmailPreferences = async (req, res) => {
    try {
        const { hour, minute, meridiem, period, categories, status } = req.body;
        const userId = req.params.userId;

        // Validate user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update time if provided
        if (hour !== undefined) {
            const hourNum = parseInt(hour);
            if (hourNum < 1 || hourNum > 12) {
                return res.status(400).json({ message: 'Hour must be between 1 and 12' });
            }
            user.sendTime = hourNum;
        }

        if (minute !== undefined) {
            const minuteNum = parseInt(minute);
            if (minuteNum < 0 || minuteNum > 59) {
                return res.status(400).json({ message: 'Minute must be between 0 and 59' });
            }
            user.sendMinute = minuteNum;
        }

        if (meridiem !== undefined) {
            const meridiemUpper = meridiem.toUpperCase();
            if (!['AM', 'PM'].includes(meridiemUpper)) {
                return res.status(400).json({ message: 'Meridiem must be either AM or PM' });
            }
            user.meridiem = meridiemUpper;
        }

        // Update other fields if provided
        if (period) {
            if (!['daily', 'weekly', 'monthly'].includes(period)) {
                return res.status(400).json({ message: 'Period must be daily, weekly, or monthly' });
            }
            user.period = period;
        }
        
        if (categories) user.categories = categories;
        if (typeof status !== 'undefined') user.status = status;

        // Save changes
        await user.save();

        // Update schedule
        await updateSchedule(userId);

        // Format time for response
        const minuteStr = user.sendMinute.toString().padStart(2, '0');

        res.status(200).json({
            message: 'Preferences updated successfully',
            preferences: {
                hour: user.sendTime,
                minute: user.sendMinute,
                meridiem: user.meridiem,
                formattedTime: `${user.sendTime}:${minuteStr} ${user.meridiem}`,
                period: user.period,
                categories: user.categories,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating preferences', error: error.message });
    }
};
