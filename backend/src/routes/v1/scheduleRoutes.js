import express from 'express';
import { updateEmailPreferences, getEmailPreferences } from '../../controller/scheduleController.js';
import { testSendEmail } from '../../controller/testEmailController.js';
import { protect } from '../../middleware/authMiddleware.js';

const scheduleRouter = express.Router();

// Protect all routes
scheduleRouter.use(protect);

// Get and update email preferences
scheduleRouter.get('/preferences/:userId', getEmailPreferences);
scheduleRouter.put('/preferences/:userId', updateEmailPreferences);

// Test email route
scheduleRouter.post('/test-email/:userId', testSendEmail);

export default scheduleRouter;
