import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routes/authRoute/authRoute.js';
import scheduleRouter from './routes/v1/scheduleRoutes.js';
import connectDb from './utils/databaseConnnect.js';
import { initializeSchedules } from './service/schedulerService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/schedule', scheduleRouter);

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDb();
        console.log('Connected to MongoDB');

        // Initialize email schedules
        await initializeSchedules();
        console.log('Email schedules initialized successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();