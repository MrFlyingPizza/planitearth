from typing import Literal

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from . import gemini_service

# FastAPI exposes the endpoints the frontend calls. One store is shared while
# this backend process is running.
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/client-feedback")
async def generate_climate_feedback(user_answers: list[dict]):
    """Generate climate feedback based on user answers."""
    return gemini_service.generate_climate_feedback(user_answers)

@app.post("/client-feedback")
async def generate_climate_feedback(user_answers: list[dict]):
    """Generate climate feedback based on user answers."""
    return gemini_service.generate_climate_feedback(user_answers)
