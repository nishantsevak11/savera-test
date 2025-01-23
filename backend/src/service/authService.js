import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import sendEmailService from './emailService.js';
import { scheduleForUser } from './schedulerService.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Parse time string in format "HH:MMAM/PM"
const parseTimeString = (timeString) => {
    if (!timeString) return { hour: 9, minute: 0, meridiem: 'AM' }; // Default time

    const match = timeString.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
    if (!match) {
        throw new Error('Invalid time format. Please use format like "9:30AM" or "2:45PM"');
    }

    const hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    const meridiem = match[3].toUpperCase();

    if (hour < 1 || hour > 12) {
        throw new Error('Hour must be between 1 and 12');
    }
    if (minute < 0 || minute > 59) {
        throw new Error('Minutes must be between 0 and 59');
    }

    return { hour, minute, meridiem };
};

// Register user service
export const registerUserService = async (userData) => {
    const { name, email, password, sendTime } = userData;

    if (!name || !email || !password) {
        throw new Error('Please fill all required fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    // Parse time string if provided
    let timeData;
    try {
        timeData = parseTimeString(sendTime);
    } catch (error) {
        throw new Error(`Time format error: ${error.message}`);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set admin status for specific email
    const isAdmin = email === 'nsevak61@gmail.com';

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        sendTime: timeData.hour,
        sendMinute: timeData.minute,
        meridiem: timeData.meridiem,
        period: 'daily',
        status: true,
        isAdmin,
        categories: userData.categories || ['motivation', 'productivity']
    });

    if (user) {
        // Schedule emails for the new user
        try {
            console.log(`Setting up email schedule for new user ${email}`);
            await scheduleForUser(user);
        } catch (error) {
            console.error('Error setting up email schedule:', error);
            // Continue with registration even if scheduling fails
        }

        // Send welcome email
        const welcomeMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Welcome to Savera, ${name}! 🎉</h2>
                <p>Thank you for joining our community. We're excited to have you on board!</p>
                
                <h3 style="color: #34495e;">Your Email Preferences:</h3>
                <ul style="list-style-type: none; padding: 0;">
                    <li>📅 Schedule: ${timeData.hour}:${timeData.minute.toString().padStart(2, '0')} ${timeData.meridiem}</li>
                    <li>🔄 Frequency: daily</li>
                    <li>📝 Categories: ${user.categories.join(', ')}</li>
                </ul>

                <p>You can update your preferences anytime through your account settings.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Tip:</strong> Your first scheduled email will arrive at ${timeData.hour}:${timeData.minute.toString().padStart(2, '0')} ${timeData.meridiem} according to your preferences!</p>
                </div>

                <p>If you have any questions or need assistance, feel free to reach out to us.</p>
                
                <p style="color: #7f8c8d; font-size: 0.9em;">
                    Best regards,<br>
                    The Savera Team
                </p>
            </div>
        `;

        try {
            await sendEmailService(name, email, welcomeMessage);
            console.log('Welcome email sent successfully');
        } catch (error) {
            console.error('Error sending welcome email:', error);
            // Don't throw error here, as we still want to return user data even if email fails
        }

        return {
            _id: user.id,
            name: user.name,
            email: user.email,
            sendTime: user.sendTime,
            sendMinute: user.sendMinute,
            meridiem: user.meridiem,
            period: user.period,
            categories: user.categories,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Invalid user data');
    }
};

// Login user service
export const loginUserService = async (email, password) => {
    if (!email || !password) {
        throw new Error('Please fill all required fields');
    }

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Invalid credentials');
    }

    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        sendTime: user.sendTime,
        sendMinute: user.sendMinute,
        meridiem: user.meridiem,
        period: user.period,
        categories: user.categories,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
    };
};


export const getUserDataService = async (userId) => {
    const user = await User.findById(userId).select('-password');

    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
