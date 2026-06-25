---
name: websocket-events
description: Contains the complete FlashSeat WebSocket Event specification. Use this skill whenever the user asks to implement, verify, or extract information about real-time socket communication, emitting events, or handling live connections.
---

# WebSocket Events Skill (FlashSeat Blueprint)

When this skill is triggered or when you are working on the FlashSeat real-time socket backend/frontend, strictly follow the event specification below. This serves as your source of truth for all Socket.io real-time communications.

## 1. Connection
*   **Event Name:** `socket.connect`
*   **Purpose:** Emitted when a client successfully establishes a Socket.io connection with the backend server.

## 2. Seat Updates
*   **Event Name:** `seat:update`
*   **Purpose:** Emitted to broadcast changes in a specific seat's status (e.g., changing from `AVAILABLE` to `LOCKED` or `SOLD`) so all connected clients instantly see the seat become greyed out or available.

## 3. Booking Progress
*   **Event Name:** `booking:progress`
*   **Purpose:** Emitted to the specific user booking the ticket to provide live updates on their Kafka/Saga workflow (e.g., "Verifying availability...", "Processing payment...", "Booking Confirmed!").

## 4. Queue Updates
*   **Event Name:** `queue:update`
*   **Purpose:** Emitted to broadcast waitlist or queue position changes when the flash sale traffic is extremely high.

## 5. Payment
*   **Event Name:** `payment:success`
*   **Purpose:** Emitted when the Saga orchestrator successfully completes the payment flow and confirms the booking. Triggers the frontend to redirect to the ticket success page.

## 6. Notifications
*   **Event Name:** `notification:new`
*   **Purpose:** Emitted to push real-time alerts or general notifications to the user (e.g., "Your payment failed, your seat lock has been released").
