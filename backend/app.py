# # backend/app.py
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List, Optional
# import traceback
# import concurrent.futures

# # Import CodeBLEU evaluation function
# from utils.codebleu_test import evaluate as codebleu_evaluate

# app = FastAPI(title="Multi-model Chat Backend")

# # Allow frontend origins
# origins = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
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

# @app.get("/health")
# def health():
#     return {"status": "healthy"}

# # Chat endpoint
# @app.post("/chat", response_model=ChatResponse)
# async def chat_endpoint(req: ChatRequest):
#     if not req.messages:
#         raise HTTPException(status_code=400, detail="messages cannot be empty")

#     model = req.model.lower()
#     try:
#         # Lazy import for chatbot models
#         if model.startswith("llama"):
#             from utils import ollama as model_client
#         elif model.startswith("gemini"):
#             from utils import gemini as model_client
#         else:
#             return ChatResponse(text="Requested model not supported.", model=req.model)

#         # Generate response in a separate thread to prevent blocking
#         with concurrent.futures.ThreadPoolExecutor() as executor:
#             future = executor.submit(model_client.generate_response, req.messages)
#             try:
#                 generated_text = future.result(timeout=20)  # 20s max, adjust as needed
#             except concurrent.futures.TimeoutError:
#                 return ChatResponse(text="", model=req.model, error="timed out")

#         # Evaluate CodeBLEU with a hardcoded reference
#         try:
#             cb_score = codebleu_evaluate(generated_text)
#         except Exception as e:
#             cb_score = None
#             print("CodeBLEU evaluation error:", e)

#         return ChatResponse(
#             text=generated_text,
#             model=req.model,
#             codebleu_score=cb_score
#         )
#     except Exception as e:
#         traceback.print_exc()
#         return ChatResponse(text="", model=req.model, error=str(e))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import traceback
import concurrent.futures

from utils.codebleu_test import evaluate as codebleu_evaluate

app = FastAPI(title="Multi-model Chat Backend")

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    text: str
    sender: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str

class ChatResponse(BaseModel):
    text: str
    model: str
    codebleu_score: Optional[float] = None
    error: Optional[str] = None

# CodeBLEU endpoint
class CodeBleuRequest(BaseModel):
    generated_code: str
    reference_code: str

class CodeBleuResponse(BaseModel):
    codebleu_score: float

@app.post("/codebleu", response_model=CodeBleuResponse)
def codebleu_endpoint(req: CodeBleuRequest):
    try:
        score = codebleu_evaluate(req.generated_code, req.reference_code)
        return CodeBleuResponse(codebleu_score=score)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"CodeBLEU evaluation error: {str(e)}")

@app.get("/", tags=["meta"])
def root():
    return {"status": "ok", "message": "Multi-model Chat Backend"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages cannot be empty")

    model = req.model.lower()
    try:
        if model.startswith("llama"):
            from utils import ollama as model_client
        elif model.startswith("code"):
            from utils import ollama1 as model_client
        elif model.startswith("gemini"):
            from utils import gemini as model_client
        elif model.startswith("qwen"):
            from utils import hf_router as model_client
        else:
            return ChatResponse(text="Requested model not supported.", model=req.model)

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(model_client.generate_response, req.messages)
            try:
                generated_text = future.result(timeout=40)
            except concurrent.futures.TimeoutError:
                return ChatResponse(text="", model=req.model, error="timed out")

        return ChatResponse(text=generated_text, model=req.model)
    except Exception as e:
        traceback.print_exc()
        return ChatResponse(text="", model=req.model, error=str(e))
