import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event';
import Seat from '../models/Seat';
import Stadium from '../models/Stadium';

/**
 * Automatically seeds the cloud database with stadiums, events, and seats
 * if they do not already exist. This ensures the app is self-healing.
 */
const ensureEventsSeeded = async () => {
  try {
    const eventCount = await Event.countDocuments();
    if (eventCount > 0) {
      // Events are seeded. Now let's double check if seats are seeded for each event.
      const events = await Event.find();
      for (const event of events) {
        const seatCount = await Seat.countDocuments({ eventId: event._id });
        if (seatCount < 204) {
          console.log(`🌱 Generating missing seats for event: ${event.title}`);
          await Seat.deleteMany({ eventId: event._id });
          const seatsToInsert = [];
          
          // 24 VIP Seats
          for (let i = 1; i <= 24; i++) {
            seatsToInsert.push({
              eventId: event._id,
              section: 'VIP',
              seatNumber: `A-VIP-${i}`,
              status: 'AVAILABLE',
              price: event.basePrice * 3.0,
            });
          }

          // 60 Premium Seats
          for (let i = 1; i <= 60; i++) {
            seatsToInsert.push({
              eventId: event._id,
              section: 'Premium',
              seatNumber: `B-PREM-${i}`,
              status: 'AVAILABLE',
              price: Math.round(event.basePrice * 1.8),
            });
          }

          // 120 General Seats
          for (let i = 1; i <= 120; i++) {
            seatsToInsert.push({
              eventId: event._id,
              section: 'General',
              seatNumber: `C-GEN-${i}`,
              status: 'AVAILABLE',
              price: event.basePrice,
            });
          }
          await Seat.insertMany(seatsToInsert);
          console.log(`🌱 Seeded 204 seats successfully for event: ${event.title}`);
        }
      }
      return;
    }

    console.log('🌱 Cloud Database is empty. Running auto-seeding for matches and seats...');

    // 1. Create Stadiums
    let wankhede = await Stadium.findById('60d5ecb8b311234567890200');
    if (!wankhede) {
      wankhede = await Stadium.create({
        _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890200'),
        name: 'Wankhede Stadium',
        city: 'Mumbai',
        sections: ['VIP', 'North Stand', 'South Stand'],
      });
    }

    let chinnaswamy = await Stadium.findById('60d5ecb8b311234567890201');
    if (!chinnaswamy) {
      chinnaswamy = await Stadium.create({
        _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890201'),
        name: 'M. Chinnaswamy Stadium',
        city: 'Bengaluru',
        sections: ['VIP', 'East Stand', 'West Stand'],
      });
    }

    // 2. Create Events
    const event1 = await Event.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890300'),
      stadiumId: wankhede._id,
      title: 'Mumbai Indians vs Chennai Super Kings',
      date: new Date('2026-05-12T19:30:00Z'),
      basePrice: 1500,
    });

    const event2 = await Event.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890301'),
      stadiumId: chinnaswamy._id,
      title: 'Royal Challengers Bengaluru vs Kolkata Knight Riders',
      date: new Date('2026-05-14T19:30:00Z'),
      basePrice: 2000,
    });

    const event3 = await Event.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890302'),
      stadiumId: wankhede._id,
      title: 'Delhi Capitals vs Rajasthan Royals',
      date: new Date('2026-05-16T19:30:00Z'),
      basePrice: 1200,
    });

    // 3. Generate Seats
    const events = [event1, event2, event3];
    const seatsToInsert: any[] = [];

    for (const event of events) {
      // 24 VIP Seats
      for (let i = 1; i <= 24; i++) {
        seatsToInsert.push({
          eventId: event._id,
          section: 'VIP',
          seatNumber: `A-VIP-${i}`,
          status: 'AVAILABLE',
          price: event.basePrice * 3.0,
        });
      }

      // 60 Premium Seats
      for (let i = 1; i <= 60; i++) {
        seatsToInsert.push({
          eventId: event._id,
          section: 'Premium',
          seatNumber: `B-PREM-${i}`,
          status: 'AVAILABLE',
          price: Math.round(event.basePrice * 1.8),
        });
      }

      // 120 General Seats
      for (let i = 1; i <= 120; i++) {
        seatsToInsert.push({
          eventId: event._id,
          section: 'General',
          seatNumber: `C-GEN-${i}`,
          status: 'AVAILABLE',
          price: event.basePrice,
        });
      }
    }

    await Seat.insertMany(seatsToInsert);
    console.log('🌱 Cloud Database auto-seeding completed successfully!');
  } catch (error) {
    console.error('❌ Auto-seeding Error:', error);
  }
};

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
export const getEvents = async (req: Request, res: Response): Promise<Response> => {
  await ensureEventsSeeded();
  try {
    const events = await Event.find().populate('stadiumId');
    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: any) {
    console.error('❌ Get Events Error:', error);
    return res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
};

// @desc    Get all seats for a specific event
// @route   GET /api/v1/events/:id/seats
// @access  Public
export const getEventSeats = async (req: Request, res: Response): Promise<Response> => {
  await ensureEventsSeeded();
  const { id } = req.params;

  try {
    const seats = await Seat.find({ eventId: id }).sort({ seatNumber: 1 });
    return res.status(200).json({
      success: true,
      count: seats.length,
      data: seats,
    });
  } catch (error) {
    console.error('❌ Get Event Seats Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// @desc    Get single event details by ID
// @route   GET /api/v1/events/:id
// @access  Public
export const getEventById = async (req: Request, res: Response): Promise<Response> => {
  await ensureEventsSeeded();
  const { id } = req.params;

  try {
    const event = await Event.findById(id).populate('stadiumId');
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('❌ Get Event By ID Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
