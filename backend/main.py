from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../frontend/.env.local'))

# Import from the new modular engine package
from engine import SajuEngine
from datetime import datetime

app = FastAPI(title="Soul Stat API", version="0.3.1")

# Configure CORS
origins = [
    "http://localhost:3000",
    "https://soul-stat-z6lj.vercel.app",
    "https://soul-stat.vercel.app"
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
    paymentId: Optional[str] = None


@app.get("/")
def read_root():
    return {"message": "Soul Stat API v0.3.1 is running", "status": "ok"}


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
        dt = datetime.strptime(f"{request.birthDate} {request.birthTime}", "%Y-%m-%d %H:%M")
        pillars = engine.compute_saju(dt.year, dt.month, dt.day, dt.hour, dt.minute)
        analysis = engine.analyze_stats(pillars)

        # Merge pillars and analysis for the report generator
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
