import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import Stadium from '../models/Stadium';
import Event from '../models/Event';
import Seat from '../models/Seat';
import Booking from '../models/Booking';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/flashseat';

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('🗳️ Connected.');

    // 1. Clear existing collections
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Stadium.deleteMany({});
    await Event.deleteMany({});
    await Seat.deleteMany({});
    await Booking.deleteMany({});
    console.log('🧹 Collections cleared.');

    // 2. Create Users
    console.log('👤 Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const userPasswordHash = await bcrypt.hash('user123', salt);

    const admin = await User.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890123'),
      name: 'Admin User',
      email: 'admin@flashseat.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    });

    const demoUser = await User.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890124'),
      name: 'Demo User',
      email: 'demo@example.com',
      passwordHash: userPasswordHash,
      role: 'USER',
    });
    console.log(`👤 Users seeded: admin (${admin.email}), user (${demoUser.email})`);

    // 3. Create Stadiums
    console.log('🏟️ Seeding Stadiums...');
    const wankhede = await Stadium.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890200'),
      name: 'Wankhede Stadium',
      city: 'Mumbai',
      sections: ['VIP', 'North Stand', 'South Stand'],
    });

    const chinnaswamy = await Stadium.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890201'),
      name: 'M. Chinnaswamy Stadium',
      city: 'Bengaluru',
      sections: ['VIP', 'East Stand', 'West Stand'],
    });
    console.log('🏟️ Stadiums seeded.');

    // 4. Create Events
    console.log('🏏 Seeding Events...');
    const event1 = await Event.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890300'),
      stadiumId: wankhede._id,
      title: 'Mumbai Indians vs Chennai Super Kings',
      date: new Date('2026-04-15T19:30:00Z'),
      basePrice: 1500,
    });

    const event2 = await Event.create({
      _id: new mongoose.Types.ObjectId('60d5ecb8b311234567890301'),
      stadiumId: chinnaswamy._id,
      title: 'Royal Challengers Bengaluru vs Kolkata Knight Riders',
      date: new Date('2026-04-18T19:30:00Z'),
      basePrice: 2000,
    });
    console.log('🏏 Events seeded.');

    // 5. Bulk Generate Seats for Events (Aligned with React Frontend IDs)
    console.log('🪑 Bulk Generating Seats matching frontend layout...');
    const events = [event1, event2];
    const seatsToInsert: any[] = [];

    for (const event of events) {
      // 24 VIP Seats (A-VIP-1 to A-VIP-24)
      for (let i = 1; i <= 24; i++) {
        seatsToInsert.push({
          eventId: event._id,
          section: 'VIP',
          seatNumber: `A-VIP-${i}`,
          status: 'AVAILABLE',
          price: Math.round(event.basePrice * 3.0),
        });
      }

      // 60 Premium Seats (B-PREM-1 to B-PREM-60)
      for (let i = 1; i <= 60; i++) {
        seatsToInsert.push({
          eventId: event._id,
          section: 'Premium',
          seatNumber: `B-PREM-${i}`,
          status: 'AVAILABLE',
          price: Math.round(event.basePrice * 1.8),
        });
      }

      // 120 General Seats (C-GEN-1 to C-GEN-120)
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

    console.log(`🪑 Inserting ${seatsToInsert.length} pre-generated seats into MongoDB...`);
    await Seat.insertMany(seatsToInsert);
    console.log('🪑 Seats successfully pre-generated.');

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
