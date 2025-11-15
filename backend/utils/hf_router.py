from dotenv import load_dotenv
import os
import traceback

load_dotenv()

ENABLE_EXTERNAL = os.getenv("ENABLE_EXTERNAL_API", "false").lower() in ("1", "true", "yes")
HF_TOKEN = os.getenv("HF_TOKEN")


def generate_response(messages, model: str = "Qwen/Qwen2.5-Coder-32B-Instruct:nscale"):
    """Generate a response using Hugging Face Router (OpenAI-compatible client).

    messages: list of objects with .text and .sender attributes (same shape used elsewhere in this project)
    model: full model identifier to pass to the HF router

    Returns a string with the model output or a short error message when not available.
    """
    if not ENABLE_EXTERNAL:
        return "External API calls are disabled on this server. Set ENABLE_EXTERNAL_API=true in .env to enable."

    if not HF_TOKEN:
        return "HF_TOKEN not configured in environment"

    try:
        # import lazily so the module is optional and the app can run without the package
        from openai import OpenAI
    except Exception as e:
        return f"OpenAI client not available: {e}"

    try:
        client = OpenAI(base_url="https://router.huggingface.co/v1", api_key=HF_TOKEN)

        # Convert messages to the expected format
        payload_messages = []
        for m in messages:
            role = "user" if getattr(m, "sender", "user") == "user" else "assistant"
            payload_messages.append({"role": role, "content": m.text})

        completion = client.chat.completions.create(
            model=model,
            messages=payload_messages,
        )

        # Try to extract plain text from the returned object
        try:
            choice = completion.choices[0]
            # Some clients return message as an object/dict
            msg = getattr(choice, "message", None)
            if msg is None:
                return str(choice)
            # msg can be a dict-like object
            if isinstance(msg, dict):
                # HF router may return {'role':..., 'content': '...'} or content could be nested
                return msg.get("content") or str(msg)
            # If message is an object with .get or .content
            content = getattr(msg, "content", None)
            if content is not None:
                return content
            # Fallback to string conversion
            return str(msg)
        except Exception:
            # fallback, return stringified completion
            return str(completion)

    except Exception:
        traceback.print_exc()
        return "Error calling HF Router"
