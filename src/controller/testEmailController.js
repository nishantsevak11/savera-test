import sendEmailService from '../service/emailService.js';
import userModel from '../models/user.model.js';

// Test sending email to a specific user
export const testSendEmail = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get user details
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create test message
        const message = `
            <h2>Test Email</h2>
            <p>This is a test email to verify the email service is working.</p>
            <p>Your current preferences:</p>
            <ul>
                <li>Send Time: ${user.sendTime}:00 ${user.meridiem}</li>
                <li>Frequency: ${user.period}</li>
                <li>Categories: ${user.categories.join(', ')}</li>
            </ul>
        `;

        // Send test email
        await sendEmailService(user.name, user.email, message);

        res.status(200).json({ 
            message: 'Test email sent successfully',
            sentTo: user.email,
            timeStamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ 
            message: 'Error sending test email', 
            error: error.message 
        });
    }
};
