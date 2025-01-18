# Subh Chintak - Daily Motivation Service

A Node.js service that sends personalized daily motivation and productivity messages to users.

## Features

- User registration and authentication
- Personalized daily motivational messages using Google's Gemini AI
- Customizable delivery time for each user
- Multiple categories: motivation, productivity, success, mindfulness
- Secure email delivery using Gmail SMTP

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- Google Gemini AI for content generation
- Nodemailer for email delivery
- JWT for authentication
- Node-cron for scheduling

## Environment Variables

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
GEMINI_API_KEY=your_gemini_api_key
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Run the development server: `npm run dev`
5. For production: `npm start`

## API Endpoints

- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- PUT `/schedule/update` - Update user schedule
- GET `/schedule/status` - Get user schedule status

## Deployment

The service is deployed on Render.com. The deployment is configured using `render.yaml`.
