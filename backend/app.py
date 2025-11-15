# # backend/app.py
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List, Optional
# from dotenv import load_dotenv
# import os
# import traceback

# # load env
# load_dotenv()

# # lazy imports for model utils - imported only when used
# # from utils import ollama, gemini, codebleu

# app = FastAPI(title="Multi-model Chat Backend")

# # Allow your frontend origin(s) here (Vite default is 5173)
# origins = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Pydantic models
# class Message(BaseModel):
#     text: str
#     sender: str  # 'user' or 'bot'

# class ChatRequest(BaseModel):
#     messages: List[Message]
#     model: str

# class ChatResponse(BaseModel):
#     text: str
#     model: str
#     codebleu_score: Optional[float] = None
#     error: Optional[str] = None

# # Root and health endpoints
# @app.get("/", tags=["meta"])
# def root():
#     return {"status": "ok", "message": "Multi-model Chat Backend"}

# @app.get("/health", tags=["meta"])
# def health():
#     return {"status": "healthy"}

# # Chat endpoint
# @app.post("/chat", response_model=ChatResponse)
# async def chat_endpoint(req: ChatRequest):
#     # Basic validation
#     if not req.messages:
#         raise HTTPException(status_code=400, detail="messages cannot be empty")

#     model = req.model.lower()
#     try:
#         # Lazy import so missing deps won't crash app at import time
#         if model == "llama3.2" or model.startswith("llama"):
#             from utils import ollama as model_client
#         elif model.startswith("gemini") or model == "gemini":
#             from utils import gemini as model_client
#         else:
#             return ChatResponse(text="Requested model not supported.", model=req.model)

#         # model_client.generate_response should accept list[Message] or dicts
#         # If generate_response is synchronous, wrap in threadpool if you expect blocking I/O.
#         generated_text = model_client.generate_response(req.messages)

#         # Optional: run codebleu (if implemented)
#         try:
#             from backend.utils import sacrebleu_test
#             cb = sacrebleu_test.evaluate(req.messages, generated_text)
#         except Exception:
#             cb = None

#         return ChatResponse(text=generated_text, model=req.model, codebleu_score=cb)
#     except Exception as e:
#         # Log to server console with traceback
#         traceback.print_exc()
#         return ChatResponse(text="", model=req.model, error=str(e))

# # Optionally add a favicon route to avoid 404 logs
# @app.get("/favicon.ico")
# def favicon():
#     # return 204 (no content) so browser doesn't keep requesting
#     return "", 204


# backend/app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import traceback
import concurrent.futures

# Import CodeBLEU evaluation function
from utils.codebleu_test import evaluate as codebleu_evaluate

app = FastAPI(title="Multi-model Chat Backend")

# Allow frontend origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Message(BaseModel):
    text: str
    sender: str  # 'user' or 'bot'

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str

class ChatResponse(BaseModel):
    text: str
    model: str
    codebleu_score: Optional[float] = None
    error: Optional[str] = None

# Root and health endpoints
@app.get("/", tags=["meta"])
def root():
    return {"status": "ok", "message": "Multi-model Chat Backend"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages cannot be empty")

    model = req.model.lower()
    try:
        # Lazy import for chatbot models
        if model.startswith("llama"):
            from utils import ollama as model_client
        elif model.startswith("gemini"):
            from utils import gemini as model_client
        else:
            return ChatResponse(text="Requested model not supported.", model=req.model)

        # Generate response in a separate thread to prevent blocking
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(model_client.generate_response, req.messages)
            try:
                generated_text = future.result(timeout=20)  # 20s max, adjust as needed
            except concurrent.futures.TimeoutError:
                return ChatResponse(text="", model=req.model, error="timed out")

        # Evaluate CodeBLEU with a hardcoded reference
        try:
            cb_score = codebleu_evaluate(generated_text)
        except Exception as e:
            cb_score = None
            print("CodeBLEU evaluation error:", e)

        return ChatResponse(
            text=generated_text,
            model=req.model,
            codebleu_score=cb_score
        )
    except Exception as e:
        traceback.print_exc()
        return ChatResponse(text="", model=req.model, error=str(e))
