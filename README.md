# DigitalPause Backend (Single-User Wellness)

Backend for the Digital Wellbeing platform, designed with a modular architecture focused on **personal awareness, self-regulation, and privacy**.

> **"The focus is on awareness and wellness, not coercion or remote control."**

## System Architecture

The system uses **NestJS** as the main backend, connected to a **PostgreSQL** database for persisting metrics and insights. The Android client (Kotlin) is responsible for local monitoring and displaying notifications.

### Core Concepts

1.  **Single-User Model**: The application is personal. There are no Parent/Child roles.
2.  **Metrics-Driven**: The backend receives raw data (usage time, interactions, emotions) and processes it.
3.  **Insights & Recommendations**: The system analyzes patterns (e.g., night usage, doomscrolling) and suggests content to improve wellbeing.

### Privacy & Security

-   **Identity Only**: Authentication via Clerk (JWT). No passwords stored locally.
-   **No Spyware**: No keylogging, no screen recording, no reading of private messages.
-   **Emotional Privacy**: Only emotional categories (e.g., "frustration") are stored, never the context or content that caused them.

## Key API Endpoints

Global Prefix: `/api`

### Auth

*   `POST /users/bootstrap`: Initializes the user in the database after Clerk login.

### Metrics Collection

*   `POST /metrics/usage`: Submit daily screen time, session counts, and night usage flags.
*   `POST /metrics/interactions`: Submit taps, scroll events, and speed.
*   `POST /emotions`: Log an emotional state (e.g., "anxiety", "calm").

### Intelligence

*   `GET /insights`: Retrieve generated insights (e.g., "You've been scrolling for 2 hours straight").
*   `GET /recommendations`: Get contextual wellness content (articles, videos) based on your recent patterns.

## Setup & Running

### Prerequisites

*   Node.js v18+
*   Docker (for PostgreSQL)

### 1. Database

Start PostgreSQL using Docker:

```bash
docker-compose up -d
```

### 2. Backend (NestJS)

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev
```

## Documentation (Swagger)

Once the server is running, visit:
**`http://localhost:3000/api`**
To view the interactive documentation for all endpoints.
