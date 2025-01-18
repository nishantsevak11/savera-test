import express from 'express';
import { getUsers } from '../../controller/userController.js';
import { protect } from '../../middleware/authMiddleware.js';

const apiRouter = express.Router();

// Apply authentication middleware to all routes
apiRouter.use(protect);

apiRouter.get('/', (req, res) => {
    res.json({ message: 'Welcome to the protected API Routes' });
});

// Check if user is admin
apiRouter.get('/admin-check', (req, res) => {
    res.json({ 
        isAdmin: req.user.isAdmin || false,
        message: req.user.isAdmin ? 'You have admin privileges' : 'You do not have admin privileges'
    });
});

// Only authenticated users with admin privileges can access all users
apiRouter.get('/users', getUsers);

export default apiRouter;