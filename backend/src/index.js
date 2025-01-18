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

// Allow all CORS - wide open
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

// Handle OPTIONS
app.options('*', (req, res) => {
    res.sendStatus(200);
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