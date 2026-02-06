# DigitalPause Backend (Single-User Wellness)

Backend for the **DigitalPause** Digital Wellbeing platform, designed with a **modular, privacy-first architecture** focused on **personal awareness, self-regulation, and mental wellness**.

> **"Si la tecnología domina y ordena tu vida eres su esclavo, si es una herramienta que no te aleja de las personas que amas, es tu aliada."**

---

## 🧱 System Architecture

The backend is built with **NestJS (Node.js + TypeScript)** and connects to a **PostgreSQL** database for persisting metrics, insights, and recommendations.

The system is designed to be **container-ready** and **cloud-deployable**, supporting local development, CI/CD pipelines, and production environments such as **Azure**.

### High-Level Components

* **NestJS API** — Core backend logic and REST endpoints
* **PostgreSQL** — Persistent storage for metrics and insights
* **Docker** — Production-ready containerization
* **Swagger (OpenAPI)** — API documentation
* **AI Service** — Python-based intelligent recommendation engine
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

### Metrics Collection

* `POST /metrics/usage` — Daily screen time, sessions, and night usage flags
* `POST /metrics/interactions` — Taps, scrolls, and interaction speed
* `POST /emotions` — Log an emotional state (e.g., *anxiety*, *calm*)

### Intelligence

* `GET /insights` — Retrieve generated behavioral insights
* `GET /recommendations` — Get contextual wellness recommendations

---

## ⚙️ Setup & Running

### Prerequisites

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

## 🚀 CI/CD Pipeline

The project implements a **fully automated CI/CD pipeline** using **GitHub Actions** for quality assurance, container building, and deployment to Azure infrastructure.

### Pipeline Overview

**Workflow File:** `.github/workflows/ci-cd.yml`

The pipeline is triggered on:
- Push events to the `feat/add-programs-api` branch
- Pull requests targeting the `feat/add-programs-api` branch

### Pipeline Stages

#### 1️⃣ **QA — Automated Testing**
- **Runtime:** Ubuntu Latest
- **Node Version:** 18
- **Test Framework:** Jest (End-to-End Tests)
- **Features:**
  - Dependency caching for faster builds (`npm` cache)
  - Clean installation with `npm ci`
  - Environment-based test configuration
  - Silent logging for cleaner test output

#### 2️⃣ **Build — Docker Image Creation**
- **Depends on:** QA stage (only runs if tests pass)
- **Registry:** Docker Hub
- **Actions:**
  - Authenticates with Docker Hub using secured credentials
  - Builds production Docker image
  - Tags image as `latest`
  - Pushes to Docker Hub registry

#### 3️⃣ **Deploy — Azure VM Deployment**
- **Depends on:** Build stage
- **Target:** Azure Virtual Machine
- **Deployment Method:** SSH-based remote execution
- **Actions:**
  - Establishes secure SSH connection to Azure VM
  - Installs Docker if not present
  - Pulls latest Docker image from registry
  - Stops and removes previous container
  - Deploys new container with environment variables
  - Cleans up unused Docker images

### Required Secrets

The pipeline requires the following GitHub Secrets to be configured:

**Database Configuration:**
- `DB_HOST` — PostgreSQL host address
- `DB_PORT` — PostgreSQL port (default: 5432)
- `DB_USER` — Database username
- `DB_PASS` — Database password
- `DB_NAME` — Database name
- `DB_SSL` — SSL connection flag (true/false)

**Docker Registry:**
- `DOCKER_USERNAME` — Docker Hub username
- `DOCKER_PASSWORD` — Docker Hub password/token

**Azure VM Access:**
- `VM_SSH_KEY` — Private SSH key for VM access
- `VM_USER` — SSH username for VM
- `VM_HOST` — VM IP address or hostname

### Pipeline Features

✅ **Automated Testing** — Every code change is validated with end-to-end tests  
✅ **Dependency Caching** — Faster builds through intelligent npm cache management  
✅ **Zero-Downtime Deployment** — Container replacement strategy ensures service continuity  
✅ **Security-First** — All credentials managed through GitHub Secrets  
✅ **Auto-Cleanup** — Removes unused Docker images to optimize VM storage  
✅ **Idempotent Deployment** — Safe to re-run without side effects

---

## ☁️ Cloud & Deployment Architecture

### Current Infrastructure

* **Azure Virtual Machine** — Primary hosting environment
* **Docker Hub** — Container registry for image storage
* **GitHub Actions** — CI/CD orchestration
* **PostgreSQL** — Managed database instance

### Configuration Management

Configuration is **fully environment-driven**, following **12-factor app principles**:
- No hardcoded credentials in source code
- All sensitive data injected via environment variables
- Separate configurations for development, testing, and production

### Deployment Flexibility

The containerized architecture is compatible with multiple Azure deployment targets:
- ✅ **Azure Virtual Machines** (current)
- Azure App Service (Containers)
- Azure Container Apps
- Azure Kubernetes Service (AKS)

---

## 🧪 Testing

### Running Tests Locally

```bash
# Run end-to-end tests
npm run test:e2e
```

### Test Environment

Tests run with:
- `NODE_ENV=test`
- Silent logging (`LOG_LEVEL=silent`)
- Database credentials from environment variables

---

## 📘 API Documentation (Swagger)

Once the server is running, visit:

```
http://localhost:3000/api
```

to explore the interactive API documentation.

---

## 📁 Project Structure

```
digitalPause_backend/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # CI/CD pipeline configuration
├── ai_service/                # Python-based AI recommendation engine
├── src/                       # NestJS application source code
├── .dockerignore              # Docker build exclusions
├── .gitignore                 # Git exclusions
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local PostgreSQL setup
├── nest-cli.json              # NestJS CLI configuration
├── package.json               # Node.js dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```
---
## ✅ Project Status

* ✔ Modular NestJS architecture
* ✔ PostgreSQL integration (SSL-aware)
* ✔ Production-grade Docker image
* ✔ Automated CI/CD pipeline with GitHub Actions
* ✔ End-to-end testing with Jest
* ✔ Automated deployment to Azure VM
* ✔ Docker Hub integration
* ✔ Privacy-first design
* ✔ Zero-downtime deployment strategy

---

## 🤝 Contributing

This project follows a structured development workflow:

1. Create feature branches from `main`
2. Push changes trigger automated tests
3. Successful tests trigger Docker image build
4. Successful builds trigger deployment to Azure VM
5. Submit pull requests for code review

---
