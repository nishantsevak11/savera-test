import express from 'express';
import { loginUser, registerUser, getUserProfile, updateUser } from '../../controller/userController.js';
import { protect } from '../../middleware/authMiddleware.js';

const authRouter = express.Router();

// Public routes
authRouter.post('/login', async (req, res, next) => {
    try {
        await loginUser(req, res);
    } catch (error) {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

authRouter.post('/register', async (req, res, next) => {
    try {
        await registerUser(req, res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Protected routes
authRouter.use(protect); // All routes below this will require authentication
authRouter.get('/profile', getUserProfile);
authRouter.put('/profile', updateUser);

export default authRouter;