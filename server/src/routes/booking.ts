import express from 'express';
import { startBooking } from '../controllers/bookingController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

router.post('/start', startBooking);

export default router;
