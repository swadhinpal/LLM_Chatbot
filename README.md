# LLM_Chatbot
LLM based chatbot
# Multi-Model Chatbot

A web-based chatbot powered by **Ollama (Llama 3.2)** and **Google Gemini AI**, with frontend in **React + Vite** and backend in **FastAPI**. Supports multi-model selection and optional CodeBLEU evaluation.

---

## 🏗 Project Structure

LLM_Chatbot/
├─ backend/ # FastAPI backend
│ ├─ app.py
│ ├─ utils/
│ │ ├─ ollama.py
│ │ ├─ gemini.py
│ │ └─ codebleu.py
│ ├─ venv/
│ └─ requirements.txt
├─ frontend/ # React frontend
│ ├─ package.json
│ ├─ vite.config.js
│ └─ src/
│ ├─ components/
│ │ ├─ Chatbot.jsx
│ │ └─ ModelSelector.jsx
│ └─ App.jsx
└─ .env


---

## Backend Setup (FastAPI)

### 1. Create virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

2. Install dependencies

pip install -r requirements.txt

3. Setup environment variables

Create a .env file in backend/:

VITE_GEMINI_API_KEY=your_google_gemini_api_key_here

4. Run the backend server

uvicorn app:app --reload --host 0.0.0.0 --port 8000

    Health check: http://localhost:8000/health

Chat endpoint: http://localhost:8000/chat
5. Test with curl

curl -X POST "http://localhost:8000/chat" \
-H "Content-Type: application/json" \
-d '{
  "model": "llama3.2",
  "messages": [{"text": "Hello backend", "sender": "user"}]
}'

Frontend Setup (React + Vite)
1. Install Node.js (v20+) and npm

node -v
npm -v

2. Install dependencies

cd frontend
npm install

    ⚠ If you see ENOSPC: System limit for number of file watchers reached, run:

sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl -p

3. Create .env file for frontend (optional)

VITE_BACKEND_URL=http://localhost:8000

4. Run the frontend

npm run dev

    By default: http://localhost:5173

    You should see the chatbot UI with:

        Message input box

        Send button

        Model selector (Llama 3.2 / Gemini)

Features

    Multi-model support: Llama 3.2 (Ollama) and Gemini (Google AI)

    CORS-enabled FastAPI backend

    Optional CodeBLEU evaluation for code-based responses

    Scrollable chat interface with loading indicators

    Environment variable support for API keys

Troubleshooting

    Backend cannot connect to Gemini API:

        Ensure your API key is correct in .env.

        Make sure you are using a supported model name (check ListModels from Google AI Studio).

    Frontend white screen:

        Check console for Module not found errors.

        Ensure all components are exported with export default.

    ENOSPC errors on Linux:

sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl -p

CORS issues:

    Ensure origins in backend/app.py includes your frontend URL