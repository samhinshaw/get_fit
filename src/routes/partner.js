// This will contain all '/user/' routes
import express from 'express';

import ensureAuthenticated from '../methods/auth';

import { updateEntry, getEntryPage, getWeightData } from '../methods/users';
import asyncMiddleware from '../middlewares/async-middleware';

const router = express.Router();

// Middleware to tell the route which user to populate information for
function getDataForPartner(req, res, next) {
  req.getDataFor = 'user';
  next();
}
// Route to User's Calorie & Exercise Data
router.get('/', ensureAuthenticated, getDataForPartner, asyncMiddleware(getEntryPage));
// update entry for date(s)
router.post('/:date', ensureAuthenticated, getDataForPartner, asyncMiddleware(updateEntry));
// Route to Weight Data
router.get('/weight', ensureAuthenticated, getDataForPartner, getWeightData);

export default router;
