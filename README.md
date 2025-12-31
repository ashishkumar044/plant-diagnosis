# Plant Diagnosis Backend MVP

A lightweight, rule-based backend service for diagnosing plant diseases. Built with Node.js, TypeScript, and Koa, designed for explainability, deterministic results, and ease of deployment.

## 🏗 Technical Architecture

The system follows a clean, single-threaded monolithic architecture with a clear separation of concerns.

```mermaid
graph TD
    User[User / Client] -->|POST /diagnose| API[API Layer (Koa)]
    API -->|Validate Data| Validation[Zod Schema]
    
    subgraph "Core Logic"
        Validation -->|Valid Input| Engine[Diagnosis Engine]
        Engine -->|Read Rules| KB[Knowledge Base (JSON)]
        Engine -->|Calculate Confidence| Scoring[Weighted Algorithm]
    end
    
    subgraph "Persistence"
        API -->|Create Session| DB[(SQLite)]
        DB -->|Log Inputs| InputsTable
        DB -->|Log Results| OutputsTable
    end

    subgraph "Response Generation"
        Scoring -->|Raw Matches| Explainer[Explanation Service]
        Explainer -->|Generate Text| FinalResult[Formatted Response]
    end

    FinalResult --> User
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **SQLite3**: For local database management (optional, app handles DB creation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashishkumar044/plant-diagnosis.git
   cd plant-diagnosis-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify Setup**
   The project includes a self-contained SQLite setup. No external DB server is needed.

### Running the Application

- **Development Mode** (with hot-reloading):
  ```bash
  npm run dev
  ```
  _Server starts at `http://localhost:3000`_

### ⚡️ Quick API Test
Copy-paste this to test the diagnosis endpoint:
```bash
curl -X POST http://localhost:3000/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "plantId": "plant_monstera_deliciosa",
    "plantConfidence": 0.9,
    "symptoms": [
      { "name": "yellow_leaves", "source": "user" },
      { "name": "mushy_roots", "source": "user" }
    ]
  }'
```

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

## 🧪 Testing

This project uses **Vitest** for unit testing the core diagnosis logic.

```bash
npm test
```

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Koa.js (Lightweight web framework)
- **Database**: SQLite (via `better-sqlite3` for synchronous speed)
- **Validation**: Zod (Runtime input validation)
- **Architecture**: Monolithic, Service-based, pattern-matcher

## 📂 Project Structure

- `src/data`: JSON Knowledge Base (Plants, Problems, Rules)
- `src/services`: Core logic (Diagnosis Engine, Explanation Service)
- `src/routes`: API endpoints
- `src/db`: SQLite connection and schema
- `test`: Unit tests