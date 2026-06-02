# Maya Voice Agent Frontend

React dashboard for browser-native AI voice sessions in healthcare appointment operations. Clinic teams can create patient sessions, choose an AI architecture, speak with the AI assistant through the browser microphone, monitor transcripts, review summaries, and manage appointment outcomes.

This branch replaces Twilio phone-call UI with web-based AI voice sessions.

![Dashboard screenshot](docs/images/dashboard.png)

## Real Use Case

Maya Voice Agent is designed for a real clinic workflow where staff repeatedly call patients to confirm appointments, collect reschedule preferences, answer basic logistics questions, and update appointment records. The original production version used Twilio Voice for real outbound automated calls to patients. The AI agent handled the conversation, produced transcripts and summaries, updated outcomes, and escalated uncertain or sensitive cases to humans.

This branch keeps that same workflow but turns it into a browser-native demo experience. A reviewer can create a patient session, speak with the AI in the web app, and see the same transcript, summary, outcome, appointment update, and analytics flow without needing a live phone number.

## Product Experience

Maya Voice Agent turns repetitive appointment confirmation and rescheduling into a guided AI workflow. A clinic operator creates a patient session, selects Realtime AI or Modular AI, starts a browser voice session, and reviews the final transcript, summary, sentiment, outcome, and appointment update.

The UI is designed for healthcare operations teams who need to quickly launch sessions, monitor live AI conversations, identify failed or escalated interactions, and keep appointment records current.

## Screens

- **Authentication**: signup, login, email OTP verification, and session persistence.
- **Dashboard**: session totals, active sessions, appointment outcomes, and AI system analytics.
- **Create Session**: patient details, appointment context, preferred language, and AI system selection.
- **Voice Session Room**: browser microphone controls, live transcript, active speaker, duration, latency, AI audio playback, and end-session flow.
- **Session History**: searchable completed sessions with transcripts, summaries, outcomes, AI system used, duration, and latency.
- **Appointments**: upcoming, confirmed, rescheduled, cancelled, and failed appointment management.

## UI Screenshots

![Create session](docs/images/create-call.png)
![Appointments](docs/images/appointments.png)

## Architecture

![Frontend architecture](docs/images/frontend-architecture.png)

The frontend is a Vite React application that communicates with the FastAPI backend over HTTP for authenticated CRUD workflows and WebSockets for voice-session audio.

At a high level:

- React Router controls protected app routes and public auth routes.
- Axios sends authenticated REST requests with JWT bearer tokens.
- Browser `MediaRecorder` captures modular audio segments.
- Browser `AudioContext` captures PCM audio for Realtime AI and plays AI responses.
- WebSocket connections stream microphone audio and receive audio, transcript, speaker, latency, duration, and completion events.
- TailwindCSS and local UI components keep the interface consistent across the dashboard.

## Tech Stack

- React
- Vite
- TailwindCSS
- React Router
- Axios
- WebSockets
- Browser MediaRecorder
- Browser AudioContext
- Lucide icons
- Local shadcn-style UI components

## Setup

Run these commands from the `frontend/` directory:

```bash
npm install
cp .env.example .env.local
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Configure the backend API URL in `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Backend Connection

The frontend expects the backend to be available at `VITE_API_URL`. For local development, start the backend on `http://localhost:8000`, then start this app on `http://localhost:5173`.

The voice WebSocket URL is derived from the same base URL:

```text
http://localhost:8000 -> ws://localhost:8000
https://api.example.com -> wss://api.example.com
```
