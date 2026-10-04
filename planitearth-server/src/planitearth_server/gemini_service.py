import json
import os
from typing import Any, Literal

from google import genai
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

MODEL_NAME = "gemini-3.8-flash"


class GeminiNotConfiguredError(RuntimeError):
    """Raised when the server has no Gemini API key configured."""


class GeminiResponseError(RuntimeError):
    """Raised when Gemini returns no usable text."""

class ClimateFeedback(BaseModel):
    """Validated feedback returned to the client."""

    model_config = ConfigDict(extra="forbid")

    image: Literal["fallen", "sick", "usual", "healing"]
    feedback: str = Field(min_length=1)
    title: str = Field(min_length=1)

    @field_validator("title")
    @classmethod
    def title_has_at_most_five_words(cls, value: str) -> str:
        if len(value.split()) > 5:
            raise ValueError("The title must not exceed five words.")
        return value


def generate_climate_feedback(user_answers: list[dict[str, Any]]) -> ClimateFeedback:
    """Generate educational feedback from the user's submitted survey answers."""
    api_key = os.environ.get("GENAI_API_KEY")
    if not api_key:
        raise GeminiNotConfiguredError(
            "Set the GENAI_API_KEY environment variable on the backend."
        )

    answers_json = json.dumps(user_answers, ensure_ascii=False)
    prompt = f"""
The user has submitted the follow data to evaluate how their choices affect the earth.
{answers_json}

We have 4 keys presenting images to display to the user about how the earth is doing.
- "fallen"
- "sick"
- "usual"
- "healing"

Descriptions of the images:
"fallen": This image shows a stylized globe with a dark, earthy brown color and a rough, mottled land pattern that resembles a heavily polluted or damaged world. Instead of normal eyes, it has two large black X marks across the center, giving it a “dead” or “sick” appearance. Around the lower edge, there are gray smoke/cloud-like puffs circling the planet, suggesting pollution, decay, or an apocalyptic atmosphere. Overall, it feels like a grim, environmentally ruined planet.
"sick": This image shows a stylized globe with a blue ocean and simplified landmasses, with most of the visible land concentrated in the Americas. The map is abstract and cartoon-like, with a teal ocean, pale yellow land, and dark gray/transparent smoke-like cloud shapes drifting across parts of the globe. The overall visual suggests environmental themes, especially air pollution or climate change, because the dark gray cloud formations appear to be smothering sections of the world, especially over North and South America. It feels like a symbolic warning image about pollution, emissions, or global environmental impact.
"usual": This image shows a stylized cartoon globe against a black background. The globe is mostly blue with green landmasses shaped like North and South America, and it has a friendly face drawn on it: two large white circular eyes with a small smile-like brow/face expression. The overall look is simple, playful, and slightly cheerful or curious, like a personified Earth.
"healing": The image uses a soothing palette of blue, green, and pink to turn the world into a symbol of healing and renewal, where the globe feels gentle and life-affirming, suggesting a planet that is not only beautiful but also restorative, connected, and full of balance and hope.

You need to produce a JSON object with the following keys:
- "image": one of the 4 keys above, representing the image that best matches the user's answers.
- "feedback": a short paragraph of educational feedback to the user about how their choices affect the earth, and what they can do to improve their impact. The feedback should be concise, clear, and actionable, and should be written in a friendly and encouraging tone. It should not be longer than 3 sentences. It should be written in English.
- "title": a short title for the feedback, no longer than 5 words. It should be written in English, and tie into the feedback and image.

Example outputs:
{{
    "image": "sick",
    "feedback": "Your choices are impacting the planet negatively. Consider reducing waste and conserving energy. Small changes can make a big difference!",
    "title": "Your Impact Matters"
}}

{{
    "image": "healing",
    "feedback": "Great job! Your choices are helping the planet recover. Keep up the good work and continue making sustainable decisions!",
    "title": "Positive Change"
}}

{{
    "image": "fallen",
    "feedback": "Your choices are harming the planet. It's important to take action to reduce your environmental impact. Consider adopting more sustainable habits and supporting eco-friendly initiatives.",
    "title": "We need your help"
}}

{{
    "image": "usual",
    "feedback": "Your choices are having a neutral impact on the planet. Keep making conscious decisions and consider ways to further reduce your environmental footprint. Every action counts!",
    "title": "Keep it up"
}}

You MUST provide the JSON only and no additional text. The JSON must be valid and parsable.
"""

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
    if not response.text or not response.text.strip():
        raise GeminiResponseError("Gemini returned an empty response.")
    try:
        return ClimateFeedback.model_validate_json(response.text)
    except (ValidationError, ValueError) as error:
        raise GeminiResponseError(
            "Gemini returned feedback that does not match the required JSON schema."
        ) from error


__all__ = [
    "GeminiNotConfiguredError",
    "GeminiResponseError",
    "ClimateFeedback",
    "generate_climate_feedback",
]
