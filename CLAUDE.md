# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the FlashSeat AI ticket booking platform - a distributed flash-sale ticket booking system designed to handle 100k+ concurrent users during IPL ticket sales. The platform demonstrates distributed systems patterns including Redis locking, Kafka queuing, Saga pattern transactions, and WebSocket real-time updates.

## Project Structure

```
src/
├── components/           # Shared UI components (Layout, Navbar, Footer, etc.)
├── features/             # Feature-based slicing (following Redux Toolkit RTK pattern)
│   ├── auth/             # Authentication features (Login, Register, Profile)
│   ├── booking/          # Ticket booking flow (seat selection, queue, payment)
│   ├── admin/            # Admin dashboard and analytics
│   ├── tickets/          # Ticket history and management
│   └── LandingPage.tsx, Dashboard.tsx
├── services/             # Service layer (API simulation, Socket.io simulation)
│   ├── api.ts            # Mock IPL match API with RTK Query
│   └── socket.ts         # Simulated Socket.io client for real-time updates
├── store/                # Redux Toolkit store configuration
│   ├── authSlice.ts      # Authentication state management
│   ├── bookingSlice.ts   # Booking flow state (seat locking, queue, payment)
│   ├── adminSlice.ts     # Admin dashboard state
│   └── index.ts          # Store configuration
└── App.tsx               # Main application router with route guards
```

## Key Architecture Patterns Implemented

### 1. Feature-Based Redux Organization
- Uses Redux Toolkit with feature slices (`authSlice`, `bookingSlice`, `adminSlice`)
- Each feature slice contains its own state, reducers, and actions
- Centralized store configuration in `store/index.ts`

### 2. RTK Query for Data Fetching
- API service defined in `services/api.ts` using `createApi`
- Mock IPL match data with simulated network latency
- Automatic caching and tag-based invalidation

### 3. Simulated Distributed Systems
- **Redis Locking**: Simulated via Socket.io events in `StadiumSeatSelection.tsx`
  - `lock_seat_attempt` / `unlock_seat_attempt` events
  - Real-time seat locking/unlocking updates via websockets
- **Kafka Queue**: Simulated queue waiting room in `QueueWaitingRoom.tsx`
  - Position tracking and ETA calculations
  - Real-time queue position updates
- **Saga Pattern**: Payment flow with rollback simulation
  - Payment success/failure handling in `PaymentPage.tsx`
  - Seat release on payment failure (simulated)
- **WebSocket Updates**: Real-time UI updates via `SocketSimulator`
  - Live seat lock/unlock events
  - Queue position updates
  - Live ticker notifications

### 4. Protected Routing
- Route guards in `App.tsx`:
  - `ProtectedRoute`: Requires authentication
  - `AdminRoute`: Requires admin role
- Authentication state managed in `authSlice`

## Development Commands

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Starts the Vite development server at http://localhost:5173

### Production Build
```bash
npm run build
```
Creates production-ready build in `dist/` directory

### Preview Production Build
```bash
npm run preview
```
Locally preview the production build

### Linting
```bash
npm run lint
```
Runs Oxlint for TypeScript and React linting

### Type Checking
```bash
npm run type-check
```
Runs TypeScript compiler for type safety

## Common Development Tasks

### Adding a New Feature
1. Create new directory in `src/features/` (e.g., `src/features/newFeature/`)
2. Add component files (.tsx) for the feature UI
3. If state management needed, create slice in `store/` (e.g., `newFeatureSlice.ts`)
4. Add API service methods in `services/api.ts` if needed
5. Export reducer in `store/index.ts`
6. Add routes in `App.tsx` with appropriate route guards

### Modifying Existing Features
1. Locate feature in `src/features/` directory
2. Update component files as needed
3. For state logic changes, modify the corresponding slice file
4. Update API service if backend contract changes
5. Test thoroughly with related components

### Working with State Management
- All state lives in Redux Toolkit slices under `src/store/`
- Use `useSelector` and `useDispatch` hooks to interact with state
- Follow existing patterns in `authSlice.ts`, `bookingSlice.ts`, etc.
- Async logic should use RTK Query or thunks as appropriate

### Working with API/Services
- Mock API service: `src/services/api.ts`
- Real-time simulation: `src/services/socket.ts`
- Add new endpoints to `api.ts` using RTK Query patterns
- Socket events handled in components using the socket instance

## Code Style and Conventions

### TypeScript
- Strict mode enabled in `tsconfig.json`
- Interface-based typing for objects and state
- Proper typing for React component props and state

### Redux Toolkit
- Use `createSlice` for state management
- Normalize state shape following existing patterns
- Use immer-enabled reducers for immutable updates
- Selectors should be created with `useSelector` hook

### Component Structure
- Functional components with React hooks
- Export named components as `export const ComponentName: React.FC = () => {}`
- Default export at bottom of file: `export default ComponentName`
- Use Tailwind CSS for styling (already configured)
- Follow existing component patterns for consistency

### Styling
- Tailwind CSS utility-first approach
- Custom CSS in `index.css` and `App.css` for global styles
- Component-specific styling inline or in component files
- Follow existing design patterns in the codebase

## Important Files to Understand First

1. **src/App.tsx** - Main application routing and route guards
2. **src/store/index.ts** - Redux store configuration
3. **src/services/api.ts** - Mock API service definition
4. **src/services/socket.ts** - WebSocket simulation implementation
5. **src/features/booking/StadiumSeatSelection.tsx** - Seat selection with locking simulation
6. **src/features/booking/QueueWaitingRoom.tsx** - Queue simulation implementation
7. **src/features/booking/PaymentPage.tsx** - Payment processing with saga simulation
8. **src/features/admin/AnalyticsDashboard.tsx** - Analytics and monitoring dashboard

## Backend Simulation Details

This frontend-only implementation simulates backend systems for demonstration:

- **Redis Locking**: Socket.io events (`seat_locked`, `seat_unlocked`) with simulated latency
- **Kafka Queue**: Queue position tracking with simulated processing delay
- **Payment Processing**: 2-second simulated delay with success/failure randomization
- **Seat Inventory**: Shared state updates via Redux store and socket events
- **Real-time Updates**: Socket.io simulation pushing updates to all connected clients

## Database Schema Reference (Conceptual)

Though this is a frontend simulation, the conceptual backend would include:

```
Users: { _id, name, email, passwordHash, role, walletBalance, bookingLimit }
Stadiums: { _id, name, city, sections }
Events: { _id, stadiumId, title, date, price }
Seats: { _id, eventId, seatNumber, status }
Bookings: { _id, userId, seatId, status, paymentStatus }
```

## Testing Approach

This project focuses on demonstration rather than comprehensive testing. For production implementation:

1. **Unit Tests**: Test Redux slices, utility functions, component logic
2. **Integration Tests**: Test API service interactions, socket communication
3. **E2E Tests**: Test complete user flows (authentication → booking → payment → confirmation)
4. **Load Testing**: Simulate high concurrent user loads to validate scaling

## Environment Variables

Currently using hardcoded values in services. For production:
- VITE_API_BASE_URL - API endpoint URL
- VITE_WS_URL - WebSocket server URL
- VITE_APP_NAME - Application name for display

## Performance Considerations Demonstrated

1. **Database Offloading**: Kafka queue prevents direct DB writes during peak load
2. **Locking Mechanism**: Redis distributed locks prevent race conditions
3. **Caching**: RTK Query provides automatic caching and request deduplication
4. **Real-time Updates**: WebSockets eliminate polling for live data
5. **Microservices**: Separation of concerns enables independent scaling
6. **Optimistic UI**: Immediate UI updates with background sync