# ── Stage 1: Build Next.js frontend ──────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python runtime ───────────────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Install backend dependencies
COPY backend/pyproject.toml backend/
RUN cd backend && uv sync --no-dev

# Copy backend source
COPY backend/ backend/

# Copy static frontend output
COPY --from=frontend-builder /app/frontend/out backend/static/

# Copy templates and catalog
COPY templates/ templates/
COPY catalog.json .

EXPOSE 8000
WORKDIR /app/backend
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
