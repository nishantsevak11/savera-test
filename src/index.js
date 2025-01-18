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

// CORS Configuration
app.use(cors({
    origin: '*', // Allow requests from any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

// Explicit handling for preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route configurations
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
