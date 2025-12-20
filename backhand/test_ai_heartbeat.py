
import os
from openai import OpenAI

KEY = "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"

try:
    client = OpenAI(api_key=KEY)
    print("Testing connection to OpenAI...")
    response = client.chat.completions.create(
        model="gpt-4o-mini", # Using mini for a fast test
        messages=[{"role": "user", "content": "Hello"}],
        max_tokens=5
    )
    print("SUCCESS: AI is responding!")
    print(f"Response: {response.choices[0].message.content}")
except Exception as e:
    print(f"FAILED: Connection error - {e}")
