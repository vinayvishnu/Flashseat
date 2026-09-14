# 🎟️ FlashSeat

### High-Concurrency Ticket Booking Platform

> A high-concurrency ticket booking platform designed to prevent double booking, process bookings asynchronously, and provide real-time seat updates.

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📌 About the Project

FlashSeat is a high-concurrency ticket booking platform focused on solving the problem of **multiple users trying to book the same seat simultaneously**.

The system uses **Redis distributed locking** to prevent double booking, **Kafka** for asynchronous booking processing, **MongoDB** for persistent data, and **Socket.io** for real-time seat and booking updates.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **TypeScript** | Type-safe backend development |
| **Node.js** | Backend runtime |
| **Express.js** | REST API development |
| **MongoDB** | Persistent data storage |
| **Redis** | Distributed locking & caching |
| **Apache Kafka** | Asynchronous booking processing |
| **Socket.io** | Real-time communication |
| **JWT** | Authentication |
| **Docker** | Containerized services |
| **Playwright** | End-to-end testing |

---

## ✨ Core Features

- 🔐 JWT-based authentication
- 🎟️ Event and seat management
- 🔒 Redis distributed locking to prevent double booking
- ⚡ Redis caching for frequently accessed data
- 📨 Kafka-based asynchronous booking processing
- 🔄 Saga-based failure compensation
- 🔴 Real-time seat and booking updates using Socket.io
- 🗄️ MongoDB persistent storage
- 👨‍💼 Admin booking and event management
- 🧪 End-to-end testing

---

## 🔄 Booking Flow

```text
User
  ↓
Select Event & Seat
  ↓
Express API
  ↓
JWT Authentication
  ↓
Check Seat Availability
  ↓
Redis Distributed Lock
  ↓
Kafka Booking Event
  ↓
Booking Worker
  ↓
Payment / Processing
  ↓
MongoDB
  ↓
Socket.io
  ↓
Real-Time Booking Update
```

---

## ▶️ How to Run

### Prerequisites

- Node.js
- npm
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/vinayvishnu/Flashseat.git
cd Flashseat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file with the required configuration.

```env
MONGODB_URI=your_mongodb_connection
REDIS_URL=your_redis_connection
KAFKA_BROKER=your_kafka_broker
JWT_SECRET=your_jwt_secret
```

### 4. Start required services

```bash
docker compose up -d
```

### 5. Start the application

```bash
npm run dev
```

Open the local URL displayed in the terminal.

---

## 👨‍💻 Author

**Vinay Vishnu**

[GitHub](https://github.com/vinayvishnu)
