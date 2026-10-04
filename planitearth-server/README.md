# PlanitEarth Server

Serves the application.

## Setup

1. Install `uv`. https://docs.astral.sh/uv/getting-started/installation/#installation-methods

2. Install dependencies.
```sh
uv sync
```

3. Create the Python virtual environment.
```sh
uv venv
```

4. Active the venv.
```sh
source .venv/bin/activate
```

## Development

Run the FastAPI development server from this directory:
```sh
uv run fastapi dev
```

## Deploy on Render

Create a **Web Service** with the repository root as its Root Directory. Set:

**Build Command**
```sh
python -m pip install uv && cd planitearth-server && uv sync --frozen --no-dev && cd ../planitearth-client && corepack pnpm install --frozen-lockfile && corepack pnpm build
```

**Start Command**
```sh
cd planitearth-server && .venv/bin/fastapi run --host 0.0.0.0 --port $PORT
```

The repository-level Render root does not contain `uv.lock` (it is in
`planitearth-server`), so Render might not make the `uv` executable available
automatically. The build command installs it before syncing the locked Python
dependencies and building the Svelte frontend into `planitearth-client/dist`.
FastAPI serves that build, including static assets and client-side route
fallbacks, while keeping `/api` requests on the API. The server project pins
Python 3.14 in `.python-version`; configure Render to use Python 3.14 if it
does not detect that file automatically.

Set `GENAI_API_KEY` in the Render service's environment variables for feedback
generation.
