---
name: verification-plan
description: Contains the complete FlashSeat verification, testing, and non-functional load-testing strategy. Use this skill whenever implementing, verifying, running tests, checking concurrency, or running browser E2E tests via the browser subagent.
---

# Verification Plan Skill (FlashSeat QA Blueprint)

When this skill is triggered or when you are testing the FlashSeat backend/frontend, follow this specification to verify both functional and non-functional features.

## 1. Functional Verification Plan

### A. Authentication & Core REST APIs
*   **Method:** Integration tests using Jest and Supertest.
*   **Verification Checklist:**
    1.  `POST /api/v1/auth/register` successfully inserts a user with a hashed password.
    2.  `POST /api/v1/auth/login` returns a valid JWT token.
    3.  `POST /api/v1/booking/start` rejects unauthenticated requests.
    4.  Admin routes successfully restrict access based on roles.

### B. Database Schema & Data Integrity
*   **Method:** Mongoose schema validators and Jest validation test suite.
*   **Verification Checklist:**
    1.  Ensure all database fields (e.g., unique email, seat status enum) reject malformed payloads.
    2.  Run the seed script and verify that seats are pre-generated successfully for events.

### C. Live Socket.io Updates
*   **Method:** Socket.io-client automated scripts.
*   **Verification Checklist:**
    1.  Connect client sockets to the backend.
    2.  Trigger a seat purchase and verify that all connected clients receive the `seat:update` event within 100ms.
    3.  Verify the specific booking client receives the `booking:progress` sequence.

### D. End-to-End Browser UI Testing
*   **Method:** Automated browser testing using the `browser_subagent` (Playwright).
*   **Verification Checklist:**
    1.  Open the web application, navigate to the register/login pages, and complete sign-in.
    2.  Navigate to the stadium layout, select an available seat (e.g., `A12`), and click "Book".
    3.  Verify the payment page displays and successfully transition to the ticket success page.
    4.  Verify the seat turns red (sold) on the UI in real-time.

---

## 2. Non-Functional Verification Plan (High Concurrency & Load)

### A. Race Conditions & Distributed Locking (Redis Lock)
*   **Method:** Concurrent request script sending 100 requests to lock the same seat simultaneously.
*   **Verification Checklist:**
    1.  Only 1 request succeeds in creating the Redis lock key (`lock:seat:<eventId>:<seatNumber>`).
    2.  The remaining 99 requests receive a `409 Conflict` (or `423 Locked`) response with the error "Seat is currently locked".
    3.  Verify that if the lock expires (TTL hits 5 minutes) without payment, it automatically releases and becomes available again.

### B. High Traffic Load Testing (Kafka Queueing)
*   **Method:** Load testing using Artillery or Autocannon (simulating 10,000+ RPS).
*   **Verification Checklist:**
    1.  Spike traffic on `POST /booking/start`.
    2.  Verify the API server remains responsive and does not drop requests or crash.
    3.  Confirm Kafka queues all booking requests, and MongoDB writes are rate-limited to consumer worker processing speed (no database crashes).

### C. Saga Transaction & Rollback Resiliency
*   **Method:** Automated failure injection tests.
*   **Verification Checklist:**
    1.  **Scenario: Payment Failure.** Force a failure in the Payment Gateway mock.
    2.  Verify the Saga Orchestrator triggers rollback:
        *   Booking status in MongoDB is updated to `FAILED`.
        *   Seat status in MongoDB resets to `AVAILABLE`.
        *   Redis lock key is deleted.
        *   Real-time event `seat:update` is emitted to make the seat clickable again on the frontend.

---

## 3. Automation Test Suites (Implemented)

The following test suites have been implemented and are ready to run:

### A. Backend Tests (`server/` directory)
*   **Jest Integration Tests (Supertest)**: `tests/api.test.ts`
    *   *Verify*: Auth registration, login, profile routing, and match queries.
    *   *Run*: `npm run test`
*   **Authentication API Script**: `tests/integration/auth.test.ts`
    *   *Verify*: Basic REST endpoints using Node native fetch.
    *   *Run*: `npx ts-node tests/integration/auth.test.ts`
*   **Concurrency Race Conditions**: `tests/concurrency/redisLock.test.ts`
    *   *Verify*: Redis distributed locking with parallel requests.
    *   *Run*: `npx ts-node tests/concurrency/redisLock.test.ts`
*   **Live Saga E2E Script**: `tests/e2e/bookingFlow.test.ts`
    *   *Verify*: Seat locking, room joining, and background Saga updates via Socket.io.
    *   *Run*: `npx ts-node tests/e2e/bookingFlow.test.ts`
*   **Artillery Performance Config**: `tests/load/artillery-config.yml`
    *   *Verify*: Concurrency throughput limits under heavy load.
    *   *Run*: `artillery run tests/load/artillery-config.yml`

### B. Frontend E2E Tests (Root directory)
*   **Playwright Browser E2E Test**: `tests/e2e/bookingFlow.spec.ts`
    *   *Verify*: Navigating to page, login redirection, queue countdown wait, stadium seat selection, attendee form submission, wallet payment, and confirmation screen.
    *   *Run*: `npx playwright test`
