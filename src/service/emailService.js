import nodemailer from 'nodemailer';

const sendEmailService = async (name, email, message) => {
    try {
        // Create a transporter with secure settings
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            debug: true // Enable debug logs
        });

        // Test the connection
        await transporter.verify();
        console.log('SMTP connection verified successfully');

        // Email options
        const mailOptions = {
            from: {
                name: 'Savera Daily Motivation',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Your Daily Inspiration from Savera',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Hello ${name}!</h2>
                    <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin: 20px 0;">
                        ${message}
                    </div>
                    <p style="color: #7f8c8d; font-size: 0.9em;">
                        Best regards,<br>
                        Savera Team
                    </p>
                </div>
            `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${name} at ${email}`);
        console.log('Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('Detailed email error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            command: error.command
        });
        throw error;
    }
};

export default sendEmailService;