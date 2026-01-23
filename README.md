# DigitalPause Backend

Backend for the **DigitalPause** Digital Wellbeing platform, designed with a **modular, privacy-first architecture** focused on **personal awareness, self-regulation, and mental wellness**.

## 🚀 Overview

---

## 🧱 System Architecture

The backend is built with **NestJS (Node.js + TypeScript)** and connects to a **PostgreSQL** database for persisting metrics, insights, and recommendations.

The system is designed to be **container-ready** and **cloud-deployable**, supporting local development, CI/CD pipelines, and production environments such as **Azure**.

### High-Level Components

* **NestJS API** — Core backend logic and REST endpoints
* **PostgreSQL** — Persistent storage for metrics and insights
* **Docker** — Production-ready containerization
* **Swagger (OpenAPI)** — API documentation
* **Android Client (Kotlin)** — Local data collection and visualization (external)

---

## 🧠 Core Concepts

1. **Single-User Model**
   The application is personal and individual. There are **no Parent/Child roles**, remote control features, or surveillance behavior.

2. **Metrics-Driven Intelligence**
   The backend receives raw behavioral data (usage time, interactions, emotions) and processes it into meaningful insights.

3. **Insights & Recommendations**
   The system identifies behavioral patterns (e.g., excessive night usage, doomscrolling) and generates **contextual recommendations** to promote healthier habits.

---

## 🔐 Privacy & Security Principles

* **Identity Only**: Authentication via **Clerk (JWT)**. No passwords are stored locally.
* **No Spyware**: No keylogging, no screen recording, no access to private messages.
* **Emotional Privacy**: Only **emotion categories** (e.g., *frustration*, *calm*) are stored — never raw context or content.
* **Environment-Based Configuration**: All secrets and credentials are injected via environment variables.

---

## 🔗 Key API Endpoints

**Global Prefix:** `/api`

### Authentication

* `POST /users/bootstrap`
  Initializes the user in the database after a successful Clerk login.

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

* `POST /metrics/usage` — Daily screen time, sessions, and night usage flags
* `POST /metrics/interactions` — Taps, scrolls, and interaction speed
* `POST /emotions` — Log an emotional state (e.g., *anxiety*, *calm*)

### 🧠 Intelligence & Insights

* `GET /insights` — Retrieve generated behavioral insights
* `GET /recommendations` — Get contextual wellness recommendations

---

## ⚙️ Setup & Running

### Prerequisites
-   Node.js v18+
-   Docker (for PostgreSQL)
-   Python 3 (for AI service)

* **Node.js v18+** (for local development)
* **Docker** (required for PostgreSQL and production-like runs)

---

## 🧪 Local Development (Without Docker)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL (Docker)

```bash
docker-compose up -d
```

### 3. Start the Backend

```bash
npm run start:dev
```

The API will be available at:

```
http://localhost:3000/api
```

---

## 🐳 Docker (Production-Ready)

The backend includes a **multi-stage, optimized Dockerfile** suitable for local testing, CI/CD, and cloud deployment.

This section documents **how to run the existing backend using Docker**, without changing the configuration model or embedding secrets into the image.

### Build the Image

```bash
docker build -t digital-pause-backend:local .
```

### Run the Container (Local DB Example)

> ⚠️ **Important**: The following values are **example placeholders only**.
> They are **not** the real values from `.env` and must be replaced with your own local or cloud configuration.

```bash
docker run --rm -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_USER=your_db_user \
  -e DB_PASS=your_db_password \
  -e DB_NAME=your_db_name \
  -e DB_SSL=false \
  digital-pause-backend:local
```

In real production environments (e.g., **Azure**), these variables are injected via **App Settings** or **Container Environment Variables**, not via the command line.

---

## ☁️ Cloud & CI/CD Readiness

* Designed for **GitHub Actions** pipelines
* Compatible with **Azure Container Registry (ACR)**
* Ready for deployment to:

  * Azure App Service (Containers)
  * Azure Container Apps
  * Kubernetes (AKS)

Configuration is **fully environment-driven**, following 12‑factor app principles.

---

## 📘 API Documentation (Swagger)

Once the server is running, visit:

```
http://localhost:3000/api
```

to explore the interactive API documentation.

---

## ✅ Project Status

* ✔ Modular NestJS architecture
* ✔ PostgreSQL integration (SSL-aware)
* ✔ Production-grade Docker image
* ✔ Privacy-first design
* ✔ Ready for CI/CD and Azure deployment

---

This backend is designed to be **transparent, ethical, and user-centric**, supporting digital wellbeing without surveillance or coercion.
