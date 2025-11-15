import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"

def generate_response(messages):
    conversation = "\n".join(
        f"{msg.sender.capitalize()}: {msg.text}" for msg in messages
    )
    prompt = f"{conversation}\nAssistant:"

    response = httpx.post(OLLAMA_URL, json={
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False
    }, timeout=60.0 )
    response.raise_for_status()
    return response.json().get("response", "")
