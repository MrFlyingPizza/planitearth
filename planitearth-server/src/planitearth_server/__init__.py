from pathlib import Path

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from . import gemini_service

# FastAPI exposes the endpoints the frontend calls. One store is shared while
# this backend process is running.
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

@app.post("/api/client-feedback", response_model=gemini_service.ClimateFeedback)
async def generate_climate_feedback(user_answers: list[dict]):
    """Generate climate feedback based on user answers."""
    try:
        return gemini_service.generate_climate_feedback(user_answers)
    except gemini_service.GeminiNotConfiguredError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except gemini_service.GeminiResponseError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


frontend_dist = Path(__file__).resolve().parents[3] / "planitearth-client" / "dist"
if frontend_dist.is_dir():
    frontend_root = frontend_dist.resolve()

    @app.get("/", include_in_schema=False)
    async def serve_frontend_index():
        return FileResponse(frontend_root / "index.html")

    @app.get("/{frontend_path:path}", include_in_schema=False)
    async def serve_frontend_file(frontend_path: str):
        if frontend_path == "api" or frontend_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")

        requested_file = (frontend_root / frontend_path).resolve()
        if requested_file.is_relative_to(frontend_root) and requested_file.is_file():
            return FileResponse(requested_file)
        return FileResponse(frontend_root / "index.html")
