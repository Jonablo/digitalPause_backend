# DigitalPause Backend (NestJS + Python AI)

Robust backend for the Digital Wellbeing platform, designed with a modular architecture and focused on privacy, replicating features similar to "Google Family Link".

> **"The `/api/users/bootstrap` endpoint is used to initialize the user state within the application domain once authenticated by the external identity provider."**

## System Architecture

The system uses **NestJS** as the main orchestrator, connected to a **PostgreSQL** database for domain entity persistence and a **Python** microservice for lightweight emotional analysis.

### Core Concepts (Family Link Model)

Unlike traditional parent-child models where the child is just a sub-entity, **DigitalPause treats every user as a first-class citizen**.

1.  **Users**: Every person (Parent or Child) is a `User`. They authenticate independently via Clerk.
2.  **Family Relations**: A directional link connecting two Users (`Parent` -> `Child`).
    *   This allows the Child to have their own device, email, and session.
    *   The Parent gains control permissions over the linked Child's account.
3.  **Roles**: Dynamic roles determined by relations:
    *   `parent`: A user who supervises others.
    *   `child`: A user who is supervised.
    *   `new_user`: A user with no links yet.

### Privacy & Security

-   **Delegated Authentication**: We do not store passwords. We rely on validated JWT tokens (Clerk).
-   **Data Privacy**: Language analysis is performed in memory or via the AI service, storing only metadata (risk category, severity) and **NEVER the literal text content** of conversations.

## Key API Endpoints

Global Prefix: `/api`

### Auth & Bootstrap

*   `POST /users/bootstrap`:
    *   **Input**: Clerk ID & Email.
    *   **Logic**: Checks if the user exists locally. If not, creates them. Checks if the user was previously invited via email (Shadow User) and claims the profile.
    *   **Output**: User profile + **Calculated Role** (`parent`, `child`, `new_user`).

### Family Linking

*   `POST /family/link`:
    *   **Action**: A Parent invites a Child by their Google Email.
    *   **Logic**: Creates a `FamilyRelation`. If the Child doesn't exist yet, a "Shadow User" is created waiting for them to sign up.
*   `GET /family/children`: Returns the list of children linked to the authenticated parent.

### Device Control

*   `POST /family/device/:deviceId/lock`:
    *   **Action**: Remote Lock/Unlock of a child's device.
    *   **Security**: Verifies that the requester is the parent of the device's owner.

## Setup & Running

### Prerequisites

*   Node.js v18+
*   Python 3.8+
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

### 3. AI Service (Python)

The Python environment is required for the sentiment analysis module.

```bash
cd ai_service
pip install -r requirements.txt
```
*Note: The backend automatically invokes the Python script for analysis.*

## Documentation (Swagger)

Once the server is running, visit:
**`http://localhost:3000/api`**
To view the interactive documentation for all endpoints.
