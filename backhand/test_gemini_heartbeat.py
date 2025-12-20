
import google.generativeai as genai

KEY = "AIzaSyBdG9ERty6YWZ_e3VMoGHFSn6woIeGGYOk"

try:
    genai.configure(api_key=KEY)
    model = genai.GenerativeModel('gemini-pro-latest')
    print("Testing connection to Google Gemini with NEW KEY...")
    response = model.generate_content("Hello! Are you working?")
    print("SUCCESS: Gemini is responding with the NEW KEY!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"FAILED: Gemini error - {e}")
