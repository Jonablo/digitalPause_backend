# DigitalPause Backend

A robust, modular backend for the Digital Wellbeing platform, designed to promote personal awareness and self-regulation without invasive monitoring. This system processes user metrics, analyzes behavioral patterns using AI, and provides personalized wellness recommendations.

## 🚀 Overview

**DigitalPause** focuses on the "Single-User Model," prioritizing privacy and user empowerment over parental control or surveillance. The backend serves as the central intelligence hub, handling data ingestion, emotional analysis, and insight generation.

### Key Features
-   **Privacy-First Architecture**: No storage of private messages, keystrokes, or screen recordings.
-   **Metric Aggregation**: Efficiently stores screen time, interaction patterns (scroll speed, taps), and emotional logs.
-   **AI-Powered Analysis**: Uses a dedicated Python microservice for sentiment analysis and pattern recognition.
-   **Contextual Insights**: Generates actionable feedback (e.g., detecting "doomscrolling" or high fatigue) based on aggregated data.

## 🛠 Tech Stack

-   **Framework**: [NestJS](https://nestjs.com/) (Node.js)
-   **Database**: PostgreSQL (via TypeORM)
-   **AI Service**: Python (Sentiment Analysis Script)
-   **Authentication**: Clerk (JWT based)
-   **Containerization**: Docker & Docker Compose

## 📡 API Endpoints Documentation

The API is prefixed with `/api` (configured in `main.ts`, assumed standard). Below is a detailed breakdown of available endpoints.

### 👤 Authentication & Users

#### `POST /users/bootstrap`
Initializes or retrieves a user's state in the database upon login.
-   **Query/Body**: `clerkId`, `email`
-   **Description**: Ensures the user exists in the local PostgreSQL database, linking their Clerk identity to internal records.

### 📊 Metrics Collection

#### `POST /metrics/usage`
Uploads daily usage statistics.
-   **Query**: `clerkId`
-   **Body**:
    ```json
    {
      "usageDate": "2024-03-20",
      "totalUsageSeconds": 14400,
      "sessionsCount": 18,
      "longestSessionSeconds": 3600,
      "nightUsage": false
    }
    ```
-   **Description**: Logs total screen time and session details to track digital habits over time.

#### `POST /metrics/interactions`
Uploads physical interaction data.
-   **Query**: `clerkId`
-   **Body**:
    ```json
    {
      "recordDate": "2024-03-20",
      "tapsCount": 1200,
      "scrollEvents": 350,
      "avgScrollSpeed": 2.5
    }
    ```
-   **Description**: Tracks physical engagement intensity. High scroll speeds or excessive taps can indicate anxiety or "doomscrolling."

#### `POST /emotions`
Logs a user's self-reported or detected emotional state.
-   **Query**: `clerkId`
-   **Body**:
    ```json
    {
      "emotion": "anxiety",
      "confidence": 0.85
    }
    ```
-   **Description**: Stores emotional data to correlate mood with digital usage patterns.

### 🧠 Intelligence & Insights

#### `GET /insights`
Retrieves generated insights for the user.
-   **Query**: `clerkId`
-   **Response**: List of insights (e.g., "High Fatigue Detected", "Night Usage Alert").
-   **Description**: Returns the latest behavioral analysis results to be displayed in the mobile app.

#### `POST /insights/generate`
Triggers the insight generation engine.
-   **Query**: `clerkId`
-   **Description**: Manually forces the backend to analyze recent metrics (usage, interactions, emotions) and generate new insights. Useful for testing or on-demand analysis.

#### `GET /analyze`
Direct access to the Python Sentiment Analysis service.
-   **Query**: `text` (The string to analyze)
-   **Response**: JSON containing sentiment score and magnitude.
-   **Description**: A utility endpoint that spawns a Python process to analyze text sentiment. Used internally but exposed for debugging.

### 💡 Recommendations

#### `GET /recommendations`
Fetches personalized wellness content.
-   **Query**: `clerkId`
-   **Description**: Returns a curated list of articles, videos, or exercises (e.g., meditation guides) tailored to the user's current state (e.g., if "anxiety" is detected, it suggests calming content).

## ⚙️ Setup & Running

### Prerequisites
-   Node.js v18+
-   Docker (for PostgreSQL)
-   Python 3 (for AI service)

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run start:dev
```

### 4. Swagger Documentation
Once running, visit **`http://localhost:3000/api`** to explore the interactive API documentation.
