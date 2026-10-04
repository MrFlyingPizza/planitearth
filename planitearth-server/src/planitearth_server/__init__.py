from typing import Literal

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from planitearth_server.database import MessageStore

# FastAPI exposes the endpoints the frontend calls. One store is shared while
# this backend process is running.
app = FastAPI()
message_store = MessageStore()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class QuestionCreate(BaseModel):
    """Data the frontend sends when adding a new question."""

    text: str = Field(min_length=1, max_length=2000)
    options: list[str] = Field(min_length=1)
    responses: dict[str, str] = Field(default_factory=dict)


class MessageCreate(BaseModel):
    """Data for directly adding one message to the conversation."""

    question_id: int | None = None
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=10000)


class AnswerCreate(BaseModel):
    """A question id and the exact option text clicked by the user."""

    question_id: int
    answer: str


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/questions")
async def list_questions():
    """Give the frontend the questions and options to display."""
    return message_store.get_questions()


@app.post("/questions", status_code=201)
async def create_question(question: QuestionCreate):
    """Add a question and return the new question."""
    return message_store.add_question(
        question.text, question.options, question.responses
    )


@app.get("/messages")
async def list_messages():
    """Return the conversation messages in the order they were saved."""
    return message_store.get_messages()


@app.post("/messages", status_code=201)
async def create_message(message: MessageCreate):
    """Save a user or assistant message without automatically replying."""
    if message.question_id is not None and not message_store.has_question(
        message.question_id
    ):
        raise HTTPException(status_code=404, detail="Question not found")
    return message_store.add_message(
        message.question_id,
        message.role,
        message.content,
    )


@app.post("/answers")
async def answer_question(answer: AnswerCreate):
    """Save a button choice and return the assistant reply for that choice."""
    response = message_store.answer_question(answer.question_id, answer.answer)
    if response is None:
        raise HTTPException(
            status_code=404,
            detail="Question not found or answer is not one of its options",
        )
    return response
