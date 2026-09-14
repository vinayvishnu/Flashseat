import express from 'express';
import { getEvents, getEventSeats, getEventById } from '../controllers/eventController';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/:id/seats', getEventSeats);

export default router;
