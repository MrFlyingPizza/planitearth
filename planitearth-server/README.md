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
