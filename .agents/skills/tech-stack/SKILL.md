---
name: tech-stack
description: Contains the exact technology stack constraints and reasoning for the FlashSeat system. Use this skill whenever implementing frontend features (React/Redux), backend runtime behaviors (Node/Express), database architectures (MongoDB/Redis), message pipelines (Kafka), or infrastructure setups (Docker/Nginx).
---

# Technology Stack Skill (FlashSeat Stack Blueprint)

When this skill is triggered or when you are coding/configuring the FlashSeat stack, refer to these platform requirements.

## Core Architecture Technologies

| Technology | Why Used |
| :--- | :--- |
| **React** | Renders a fast, interactive, and responsive frontend interface. |
| **Redux Toolkit** | Manages global client-side state (such as auth status, selected seat arrays, and timers). |
| **RTK Query** | Caches API response states on the client side, reducing duplicate network requests. |
| **Node.js** | Provides an asynchronous, non-blocking runtime environment for high-throughput scaling. |
| **Express** | Lightweight framework for routing, middlewares, and API controller services. |
| **MongoDB** | Schemaless database for storing stadium details, matches, and structured user records. |
| **Redis** | In-memory storage layer for microsecond-fast distributed locks (SETNX) and caching. |
| **Kafka** | Distributed streaming broker acting as a shock absorber to queue seat booking events. |
| **Socket.io** | Bidirectional real-time communication channel to push seat booking updates instantly. |
| **Docker** | Standardizes the environment for local development and scalable production deployments. |
| **Nginx** | Reverse proxy to handle load balancing, SSL termination, and static asset caching. |
