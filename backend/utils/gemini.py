from google.genai import Client
from google.genai.types import Content
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Read API key
API_KEY = os.getenv("GEMINI_API_KEY")  # rename to a backend-safe key

def generate_response(messages):
    client = Client(api_key=API_KEY)

    # Convert messages to new Content format
    history = [
        Content(
            role="user" if msg.sender == "user" else "model",
            parts=[{"text": msg.text}]
        )
        for msg in messages
    ]

    chat = client.chats.create(
        model="gemini-2.0-flash",   # recommended model now
        history=history
    )

    result = chat.send_message(messages[-1].text)

    return result.text
