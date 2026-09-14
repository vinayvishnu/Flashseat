import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import redis from './config/redis';
import { connectKafka } from './config/kafka';
import authRoutes from './routes/auth';
import bookingRoutes from './routes/booking';
import eventRoutes from './routes/event';
import Booking from './models/Booking';
import { startBookingConsumer } from './workers/bookingConsumer';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for local testing
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/events', eventRoutes);

// Basic Route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    services: {
      database: 'connected',
      redis: redis.status,
    },
  });
});

// Socket Connection
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join', async (bookingId: string) => {
    socket.join(bookingId);
    console.log(`👥 Client ${socket.id} joined room ${bookingId}`);

    try {
      if (mongoose.isValidObjectId(bookingId)) {
        const booking = await Booking.findById(bookingId).populate('seatId');
        if (booking) {
          console.log(`🔍 Found existing booking ${bookingId} with status: ${booking.status}`);
          if (booking.status === 'CONFIRMED') {
            socket.emit('booking:progress', {
              bookingId,
              status: 'CONFIRMED',
              message: 'Payment successful! Your ticket has been generated.',
            });
            const seat = booking.seatId as any;
            socket.emit('payment:success', { bookingId, seatNumber: seat?.seatNumber });
          } else if (booking.status === 'FAILED') {
            socket.emit('booking:progress', {
              bookingId,
              status: 'FAILED',
              message: 'Payment failed. Your reservation has been released.',
            });
            const seat = booking.seatId as any;
            socket.emit('notification:new', {
              message: `Payment failed for seat ${seat?.seatNumber}. The seat has been released.`,
            });
          }
        }
      }
    } catch (err) {
      console.error('❌ Error checking booking status on join:', err);
    }
  });

  socket.on('request_queue_join', ({ matchId }) => {
    console.log(`👥 Client ${socket.id} requested to join queue for match ${matchId}`);
    
    let position = Math.floor(Math.random() * 4) + 3; // Queue size between 3 and 6
    let eta = position * 2; // 2 seconds per position

    // Send initial queue state
    socket.emit('queue_update', { position, eta });

    const queueInterval = setInterval(() => {
      position -= 1;
      eta = position * 2;

      if (position <= 0) {
        clearInterval(queueInterval);
        socket.emit('queue_passed');
        console.log(`✅ Client ${socket.id} passed the queue for match ${matchId}`);
      } else {
        socket.emit('queue_update', { position, eta });
      }
    }, 2000);

    const cleanup = () => {
      clearInterval(queueInterval);
    };

    socket.on('disconnect', cleanup);
    socket.on('leave_queue', cleanup);
  });

  // Admin config changes — broadcast to all other connected browsers so user
  // tabs update their Redux state in real-time without a page refresh.
  // Using socket.broadcast.emit so the admin's OWN tab does NOT receive the
  // echo (which would double-toggle and cancel the change).
  socket.on('admin:config_update', (payload: { type: string; data: any }) => {
    console.log(`⚙️  Admin config update received: ${payload.type}`);
    socket.broadcast.emit('admin:config_applied', payload);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Initialize services and start server
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Connect to Kafka
  await connectKafka();

  // Start Booking Consumer Worker
  await startBookingConsumer();

  server.listen(PORT, () => {
    console.log(`🚀 FlashSeat Server running on port ${PORT}`);
  });
};

startServer();

export { app, io };
