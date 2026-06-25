# FlashSeat - Database Schema & Seed Data Plan

This document outlines the MongoDB schema design and seed data structures for the FlashSeat backend architecture.

## 1. Users Collection
Stores user credentials, roles, and profile information.
**Schema:**
*   `_id`: ObjectId
*   `name`: String
*   `email`: String (Unique)
*   `passwordHash`: String
*   `role`: String (Enum: `USER`, `ADMIN`)

**Seed Data Example:**
```json
{
  "_id": "60d5ecb8b311234567890123",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "passwordHash": "$2b$10$hashedpasswordhere",
  "role": "USER"
}
```

## 2. Stadiums Collection
Stores physical venues where events take place.
**Schema:**
*   `_id`: ObjectId
*   `name`: String
*   `city`: String
*   `sections`: Array of Strings (e.g., ["VIP", "General", "Premium"])

**Seed Data Example:**
```json
{
  "_id": "60d5ecb8b311234567890124",
  "name": "Wankhede Stadium",
  "city": "Mumbai",
  "sections": ["North Stand", "South Stand", "VIP"]
}
```

## 3. Events Collection
Stores IPL matches and their details.
**Schema:**
*   `_id`: ObjectId
*   `stadiumId`: ObjectId (Ref: `Stadiums`)
*   `title`: String (e.g., "MI vs CSK")
*   `date`: ISODate
*   `basePrice`: Number

**Seed Data Example:**
```json
{
  "_id": "60d5ecb8b311234567890125",
  "stadiumId": "60d5ecb8b311234567890124",
  "title": "Mumbai Indians vs Chennai Super Kings",
  "date": "2026-04-15T19:30:00Z",
  "basePrice": 1500
}
```

## 4. Seats Collection
The most critical collection for high-concurrency booking. Pre-generated for every event to prevent database locks during flash sales.
**Schema:**
*   `_id`: ObjectId
*   `eventId`: ObjectId (Ref: `Events`)
*   `section`: String
*   `seatNumber`: String
*   `status`: String (Enum: `AVAILABLE`, `LOCKED`, `SOLD`)
*   `price`: Number

**Seed Data Example:**
```json
{
  "_id": "60d5ecb8b311234567890126",
  "eventId": "60d5ecb8b311234567890125",
  "section": "VIP",
  "seatNumber": "A12",
  "status": "AVAILABLE",
  "price": 5000
}
```

## 5. Bookings Collection
Tracks the transactional state of a ticket purchase for Saga orchestration.
**Schema:**
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref: `Users`)
*   `seatId`: ObjectId (Ref: `Seats`)
*   `eventId`: ObjectId (Ref: `Events`)
*   `status`: String (Enum: `PENDING`, `CONFIRMED`, `FAILED`, `CANCELLED`)
*   `paymentStatus`: String (Enum: `PENDING`, `COMPLETED`, `REFUNDED`)
*   `createdAt`: ISODate

**Seed Data Example:**
```json
{
  "_id": "60d5ecb8b311234567890127",
  "userId": "60d5ecb8b311234567890123",
  "seatId": "60d5ecb8b311234567890126",
  "eventId": "60d5ecb8b311234567890125",
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "createdAt": "2026-04-10T10:00:00Z"
}
```

---

## Database Initialization Strategy (Seed Script Workflow)
To properly seed this system for local testing, the seed script must run in this order:
1. **Clear existing collections** to avoid duplication.
2. **Create Admin & Demo Users** (`Users` collection).
3. **Insert Stadiums** (`Stadiums` collection).
4. **Insert Events** (`Events` collection).
5. **Bulk Generate Seats:** For each event, loop through the stadium sections and dynamically generate `Seats` documents (e.g., 50,000 seats per event). This bulk-insert must run *before* the sale opens to avoid heavy disk-write latency during peak traffic.
