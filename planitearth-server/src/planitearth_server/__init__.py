from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
