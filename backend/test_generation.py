import google.generativeai as genai
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '../frontend/.env.local')
load_dotenv(env_path)

api_key = os.getenv('GOOGLE_API_KEY')

if not api_key:
    print("API Key NOT FOUND")
else:
    genai.configure(api_key=api_key)
    print(f"Testing generation with gemini-flash-latest...")
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Hello, say 'The spirits are listening' if you can hear me.")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
