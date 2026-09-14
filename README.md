# 🎟️ FlashSeat

### High-Concurrency Ticket Booking Platform

> A backend-focused ticket booking system designed to handle concurrent seat reservations, prevent double booking, process bookings asynchronously, and provide real-time updates.

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-Backend-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Locking%20%26%20Caching-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-Events-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerization-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📌 About the Project

FlashSeat is a high-concurrency ticket booking platform focused on solving backend challenges that occur when multiple users try to book limited seats simultaneously.

The system uses **Redis distributed locking** to prevent duplicate seat reservations, **Kafka** for asynchronous booking processing, **MongoDB** for persistent data storage, and **Socket.io** for real-time updates.

---

## ⚡ Core Backend Features

- 🔒 Redis distributed locking for concurrent seat booking
- 📨 Kafka-based asynchronous booking processing
- 🗄️ MongoDB persistent data storage
- 🔴 Socket.io real-time booking updates
- 🔐 JWT-based authentication
- 🔄 Saga-style failure compensation
- ⚡ Redis caching
- 🧩 RESTful backend APIs
- 🐳 Docker-based infrastructure

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
Redis Seat Lock
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
