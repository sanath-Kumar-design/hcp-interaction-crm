# HCP Interaction CRM

An AI-assisted CRM for pharmaceutical sales reps to log and track interactions with Healthcare Professionals (HCPs) — through natural language chat instead of manual forms.

## Overview

Sales reps typically log interactions with doctors and hospitals through tedious structured forms. This project replaces that with a conversational AI assistant: reps describe an interaction in plain language, and the system uses a **LangGraph ReAct agent** to parse the conversation, auto-fill structured fields (HCP name, hospital, specialty, sentiment, notes), and save it — while also answering natural-language questions about interaction history.

## Features

- **Conversational interaction logging** — describe a visit/call in plain English; the AI agent extracts structured data automatically
- **HCP Directory** — grouped, de-duplicated view of all HCPs a rep has interacted with, showing hospital, specialty, and latest sentiment
- **HCP detail view** — full interaction history and timeline for a specific HCP
- **JWT-based authentication** — secure per-user data isolation (reps only see their own logged interactions)
- **Sentiment tracking** — automatically surfaces the latest sentiment reading per HCP relationship

## Tech Stack

**Backend**
- FastAPI
- LangGraph (ReAct agent for conversational parsing)
- SQLAlchemy + SQL database
- JWT authentication (`python-jose`)

**Frontend**
- React
- Redux Toolkit (state management, including auth state)
- Fetch API for backend communication

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app, route definitions
│   ├── models.py            # SQLAlchemy models (Interaction, User)
│   ├── auth.py              # JWT creation & validation
│   ├── agent/                # LangGraph ReAct agent logic
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── DirectoryPage.jsx
│   │   ├── features/
│   │   │   └── authSlice.js  # Redux auth state
│   │   └── ...
│   └── ...
└── README.md
```

> Adjust the structure above to match your actual repo layout.

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A SQL database (e.g. PostgreSQL or SQLite for local dev)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file with:
```
SECRET_KEY=your-secret-key
ALGORITHM=HS256
DATABASE_URL=your-database-url
OPENAI_API_KEY=your-openai-key
```

Run the server:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints (Sample)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Authenticate user, returns JWT |
| GET | `/hcps` | List all HCPs for the logged-in rep (grouped, de-duplicated) |
| GET | `/hcps/{hcp_name}` | Full interaction history for a specific HCP |
| POST | `/chat` | Conversational endpoint for logging interactions via AI agent |

## Authentication

The app uses JWT bearer tokens. On login, the token is stored client-side and sent as an `Authorization: Bearer <token>` header on subsequent requests. Tokens expire after 24 hours.

## Roadmap / Known Issues

- [ ] History auto-fill routing needs refinement for edge cases
- [ ] Add `redux-persist` (or localStorage rehydration) for full auth state persistence across refresh
- [ ] Expand sentiment analysis granularity

## License

Add your preferred license here (e.g. MIT).