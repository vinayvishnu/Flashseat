# FlashSeat - Interview Demonstration & Explanation Guide

This guide provides a step-by-step walkthrough to demonstrate the **FlashSeat** ticket booking platform to an interviewer, highlighting the high-concurrency architectures (Redis distributed locking, Kafka event queueing, Saga rollback, and WebSockets).

---

## 🛠️ Step 1: Open the Frontend Application
1. **Launch the site**: Navigate to `http://localhost:5173`.
2. **Branding Highlight**: Point out the modern, premium dark-theme UI, optimized with smooth micro-animations. Mention that the frontend is built using **React, Redux Toolkit, and Vite**.

---

## 🧪 Step 2: Show the Interactive Test Lab (The Core Demo)
Navigate directly to `/analytics` (or click **Analytics** in the navbar) to access the **Interactive E2E Simulation & Testing Lab**. This is your primary tool to explain backend engineering live.

### Demo A: Test Concurrency Lock (Redis Distributed Locking)
1. **Explain the problem to the interviewer**: 
   * *"When 10 users click the exact same seat at the exact same millisecond, we must prevent double-booking without slowing down the database."*
2. **Execute the test**: Click the **Test Concurrency Lock** button.
3. **What happens on the screen**: 
   * The terminal log fires **10 parallel requests** to the backend API (`POST /booking/start`) for the same seat.
   * Exactly **1 request** returns `202 Accepted` (acquires the Redis lock).
   * The other **9 requests** fail immediately with `409 Conflict` (rejected by Redis).
4. **How to explain the tech**:
   * *"We use Redis Distributed Locking (`SETNX` with a 5-minute lease TTL). Since Redis is single-threaded, it handles seat lock reservations atomically. The first request sets the key, and all others are blocked instantly, protecting database write capacity."*

### Demo B: Test Saga Rollback (Kafka Event Stream & Compensations)
1. **Explain the problem to the interviewer**:
   * *"In high-concurrency systems, writing to databases and calling external payment gateways synchronously blocks web threads. We need asynchronous processing and transaction recovery (Saga pattern) if a payment fails."*
2. **Execute the test**: Click the **Test Saga Rollback** button.
3. **What happens on the screen**:
   * The client locks a test seat ending in `09` (configured to fail payment) and gets a `202 Accepted` response.
   * The client connects to Socket.io and joins the transaction room.
   * The background Kafka consumer worker pulls the job, simulates a payment gateway call, and triggers a **Saga Rollback**.
   * The terminal log streams the live updates: `[Saga Status: FAILED] - Payment failed. Your reservation has been released.`
4. **How to explain the tech**:
   * *"When a booking starts, the web server only checks the Redis lock and publishes a message to Kafka, returning `202 Accepted` immediately. A separate worker consumes messages sequentially. If payment fails, a Saga Rollback is triggered: it marks the booking as FAILED, resets the seat status to AVAILABLE, deletes the Redis lock, and broadcasts a Socket.io message to make the seat bookable again."*

---

## 🎟️ Step 3: Show the Real-Time Booking Walkthrough
Go back to the homepage and run a manual booking to show how it feels for a customer:

1. **Join waiting room**:
   * Log in as a user (`demo@example.com` / `user123` via quick login).
   * Click **Join Live Queue** on any active match.
   * Explain: *"The page connects to Socket.io. The backend places the socket connection in a virtual waiting room queue, decrementing their position in real-time."*
2. **Choose a Seat**:
   * Once redirected to the stadium map, click a seat (e.g., `A-VIP-3`).
   * Explain: *"Clicking this seat calls the backend to secure a 5-minute Redis lease lock. The seat turns yellow (locked) on our screen, and Socket.io broadcasts this state to turn it yellow on all other users' maps in real-time."*
3. **Complete Checkout**:
   * Fill in attendee details and select **Simulated Wallet**.
   * Click **Settle Ticket Payment**.
   * Point to the spinner and explain: *"The transaction is queued in Kafka. The WebSocket room streams the live processing updates directly from the background worker until the ticket is confirmed and the cryptographic QR pass is generated!"*
