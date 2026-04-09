# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation has user auth, AI chat for the Mutual NDA, per-user chat and document persistence, and a live document preview. Multi-document support is not yet implemented.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira and move the issue to **In Progress**
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools and move the issue to **In Review**
5. Once the PR is merged / work is accepted, move the issue to **Done**

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
The frontend is statically built (`next build` with `output: export`) and served by FastAPI from `backend/static/`.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme

The frontend uses a dark luxury palette defined as CSS custom properties in `frontend/app/globals.css`:
- Background: `#09090e`
- Surface: `#111118`
- Gold accent: `#c9a84c` (buttons, highlights, focus states)
- Foreground: `#f2ede4`
- Muted text: `#6b6b80`
- Document paper: `#fefdf9`

## Implementation Status

### Completed (PL-4 — V1 Foundation)
- **Backend**: FastAPI uv project in `backend/`. SQLite DB (dropped and recreated on each container start). Auth via JWT stored in httpOnly cookie (`prelegal_session`). Endpoints: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- **Frontend**: Next.js statically exported (`output: export`, `trailingSlash: true`) and served by FastAPI from `backend/static/`. Login (`/login/`) and signup (`/signup/`) pages. Home page gated behind auth — redirects to `/login/` if unauthenticated.
- **Docker**: Multi-stage `Dockerfile` (Node builds frontend, Python serves it). `docker-compose.yml` with `SECRET_KEY`, `CORS_ORIGINS`, and `OPENROUTER_API_KEY` env vars.
- **Scripts**: `scripts/start|stop-{mac,linux}.sh` and `scripts/start|stop-windows.ps1` wrapping `docker compose`.

### Completed (PL-5 — AI Chat for Mutual NDA)
- **AI Chat**: Left panel replaced with a tab-toggle UI: **AI Chat** (default) and **Edit** (manual form). Chat uses message bubbles and a typing indicator. Enter sends; Shift+Enter adds a newline.
- **AI Service**: `backend/app/services/ai.py` — LiteLLM via OpenRouter/Cerebras (`openrouter/openai/gpt-oss-120b`). Structured output returns both a conversational `reply` and `NdaFieldUpdates` (partial field values). Document preview updates in real-time.
- **Persistence**: New DB tables `chat_messages` and `nda_documents` store conversation history and field values per user. Survives page refresh and sign-out/sign-in.
- **Auto-greeting**: `GET /api/chat/history` generates the AI's opening message on first load. `POST /api/chat/reset` clears history and restarts.
- **Safe writes**: User message is only persisted after a successful AI response. AI failures return 502 and leave the DB clean; error states surface as assistant bubbles.

### Not yet implemented
- Support for all 12 document types (only Mutual NDA currently)
