from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../frontend/.env.local'))

# Add current directory to path to import saju_engine
sys.path.append(os.path.dirname(__file__))
from saju_engine import SajuEngine
from datetime import datetime

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "https://your-frontend-deployment-url.vercel.app" # Placeholder for future deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = SajuEngine()

class AnalyzeRequest(BaseModel):
    birthDate: str
    birthTime: str = "00:00"

class DeepAnalyzeRequest(BaseModel):
    birthDate: str
    birthTime: str = "00:00"
    paymentId: Optional[str] = None # For future PayPal integration

@app.get("/")
def read_root():
    return {"message": "Saju Backend API is running"}

@app.post("/analyze")
def analyze_saju(request: AnalyzeRequest):
    try:
        dt = datetime.strptime(f"{request.birthDate} {request.birthTime}", "%Y-%m-%d %H:%M")
        pillars = engine.compute_saju(dt.year, dt.month, dt.day, dt.hour, dt.minute)
        analysis = engine.analyze_stats(pillars)
        
        # Remove 'meta' from pillars for cleaner response
        pillars_clean = {k: v for k, v in pillars.items() if k != "meta"}
        
        return {**analysis, "pillars": pillars_clean}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD and HH:MM")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/deep")
def analyze_deep(request: DeepAnalyzeRequest):
    try:
        # Check paymentId here in the future
        # if not verify_payment(request.paymentId):
        #     raise HTTPException(status_code=402, detail="Payment required")

        dt = datetime.strptime(f"{request.birthDate} {request.birthTime}", "%Y-%m-%d %H:%M")
        pillars = engine.compute_saju(dt.year, dt.month, dt.day, dt.hour, dt.minute)
        
        # We need the meta data for deep report, so we pass the full pillars object
        # saju_engine.py's generate_deep_report implementation might need pillars with meta
        # Looking at saju_engine.py, analyze_stats adds dominant_element and class to the dict, 
        # but generate_deep_report takes 'pillars_data'.
        # Let's see how saju_engine.py handles it.
        # It seems generate_deep_report expects pillars_data to have 'dominant_element' and 'class' keys 
        # which are added by analyze_stats.
        
        analysis = engine.analyze_stats(pillars)
        
        # Combine pillars and analysis for the report generator
        # The SajuEngine.generate_deep_report method uses pillars_data['year'], etc. 
        # AND pillars_data.get('dominant_element').
        # So we need to merge them.
        
        full_data = {**pillars, **analysis}
        
        deep_report = engine.generate_deep_report(full_data)
        
        return {"deep_report": deep_report}

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    except Exception as e:
        print(f"Error generating deep report: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
