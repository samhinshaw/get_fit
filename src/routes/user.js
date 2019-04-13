// This will contain all '/user/' routes
import express from 'express';

import ensureAuthenticated from '../methods/auth';

import { updateEntry, getEntryPage, getWeightData } from '../methods/users';

// Define Async middleware wrapper to avoid try-catch
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router();

// Route to User's Calorie & Exercise Data
router.get('/', ensureAuthenticated, asyncMiddleware(getEntryPage('user')));

// Route to Weight Data
router.get('/weight', ensureAuthenticated, getWeightData('user'));

router.post('/:date', ensureAuthenticated, asyncMiddleware(updateEntry('user')));

export default router;
