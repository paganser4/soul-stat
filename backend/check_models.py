import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load env from frontend/.env.local
env_path = os.path.join(os.path.dirname(__file__), '../frontend/.env.local')
load_dotenv(env_path)

api_key = os.getenv('GOOGLE_API_KEY')
print(f"Loaded API Key: {api_key[:5]}..." if api_key else "API Key NOT FOUND")

if api_key:
    genai.configure(api_key=api_key)
    print("Listing available models:")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")
