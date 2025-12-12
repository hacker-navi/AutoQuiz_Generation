import json
from typing import List, Optional
import requests
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import os
from fastapi import File, UploadFile, Form
from fastapi.staticfiles import StaticFiles

# Pydantic models
class QuizQuestionIn(BaseModel):
    type: str = Field(..., example="mcq")
    question: str = Field(..., example="What is the capital of France?")
    options: List[str] = Field(..., example=["Paris", "London", "Berlin", "Rome"])
    correctIndex: int = Field(..., example=0)
    difficulty: Optional[str] = Field("easy", example="medium")
    explanation: Optional[str] = Field(None, example="Paris is the capital of France")

class FlashcardIn(BaseModel):
    front: str = Field(..., example="Capital of France")
    back: str = Field(..., example="Paris")

class GenerateRequest(BaseModel):
    unitId: str = Field(..., example="U101")
    text: str = Field(..., example="Paris is the capital of France.")

class GenerateResponse(BaseModel):
    summary: str
    quizQuestions: List[QuizQuestionIn]
    flashcards: List[FlashcardIn]

# Ollama config
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "mistral:7b-instruct"

def generate_mock_quiz(text: str, unit_id: str) -> GenerateResponse:
    """Fallback generator when Ollama is unavailable."""
    sentences = [s.strip() for s in text.split('.') if s.strip()]
    summary = '. '.join(sentences[:2]) + '.' if sentences else "Content processed."
    
    quiz_questions = []
    flashcards = []
    
    for i in range(min(5, len(sentences))):
        sentence = sentences[i] if i < len(sentences) else f"Point {i+1}"
        quiz_questions.append(QuizQuestionIn(
            type="mcq",
            question=f"Which statement is true about the content?",
            options=[
                sentence[:50] + "..." if len(sentence) > 50 else sentence,
                "Something different",
                "Opposite meaning",
                "Unrelated fact"
            ],
            correctIndex=0,
            difficulty="easy",
            explanation="Based on the provided content"
        ))
        
        flashcards.append(FlashcardIn(
            front=f"Key point {i+1}",
            back=sentence[:80]
        ))
    
    return GenerateResponse(
        summary=summary,
        quizQuestions=quiz_questions,
        flashcards=flashcards
    )

def call_ollama_for_quiz(text: str, unit_id: str) -> GenerateResponse:
    """Call Ollama to generate quiz questions and flashcards."""
    
    prompt = f"""Generate ONLY this JSON format with no other text:
{{
  "summary": "Brief summary",
  "quizQuestions": [
    {{"type": "mcq", "question": "Q?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "difficulty": "easy", "explanation": "Ans"}}
  ],
  "flashcards": [
    {{"front": "Q", "back": "A"}}
  ]
}}

Content: {text[:500]}"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    try:
        resp = requests.post(OLLAMA_URL, data=json.dumps(payload), timeout=45)
        resp.raise_for_status()
    except Exception as e:
        raise RuntimeError(f"Ollama failed: {str(e)[:50]}")

    try:
        out = resp.json().get("response", "")
    except:
        raise RuntimeError("Invalid Ollama response")

    # Clean JSON
    cleaned = out.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1].strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()

    try:
        data = json.loads(cleaned)
    except:
        raise RuntimeError("Cannot parse JSON response")

    # Fix options if string
    if "quizQuestions" in data:
        for q in data.get("quizQuestions", []):
            if isinstance(q.get("options"), str):
                q["options"] = q["options"].split()

    try:
        return GenerateResponse(**data)
    except:
        raise RuntimeError("Schema validation failed")

# FastAPI app
app = FastAPI(title="Quiz Generator API")

@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    try:
        return call_ollama_for_quiz(req.text, req.unitId)
    except Exception as e:
        print(f"Ollama error: {e}, using fallback...")
        try:
            return generate_mock_quiz(req.text, req.unitId)
        except Exception as e2:
            raise HTTPException(
                status_code=500,
                detail=f"Generation failed: {str(e2)[:50]}"
            )

# File upload
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), title: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    return {"fileUrl": f"http://localhost:8000/uploads/{file.filename}"}
