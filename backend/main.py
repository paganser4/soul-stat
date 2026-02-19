from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../frontend/.env.local'))

# Import from the new modular engine package
from engine import SajuEngine
from datetime import datetime

# PayPal Configuration
PAYPAL_CLIENT_ID = os.getenv("NEXT_PUBLIC_PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"  # Change to "https://api-m.paypal.com" for production

def verify_payment(payment_id: str) -> bool:
    """Verifies the payment with PayPal API."""
    if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
        print("PayPal credentials missing")
        return False
    
    try:
        # 1. Get Access Token
        auth_response = requests.post(
            f"{PAYPAL_API_BASE}/v1/oauth2/token",
            auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
            data={"grant_type": "client_credentials"}
        )
        if auth_response.status_code != 200:
            print(f"Failed to get access token: {auth_response.text}")
            return False
            
        access_token = auth_response.json().get("access_token")
        
        # 2. Verify Order Details
        order_response = requests.get(
            f"{PAYPAL_API_BASE}/v2/checkout/orders/{payment_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if order_response.status_code != 200:
            print(f"Failed to get order details: {order_response.text}")
            return False
            
        order_data = order_response.json()
        status = order_data.get("status")
        
        # Check if completed or approved (depending on flow, simplified to captured/completed here)
        if status == "COMPLETED":
            return True
        elif status == "APPROVED":
            # If strictly checking for capture, this might be insufficient, but for now we accept it and assume capture happens on client
            # Ideally we should trigger capture here if not captured, but the client code calls capture.
            # Let's check logic: Client capture() -> onSuccess with details -> Backend verify.
            # So status should be COMPLETED.
            return False
            
        print(f"Payment status invalid: {status}")
        return False
        
    except Exception as e:
        print(f"Payment verification error: {e}")
        return False

app = FastAPI(title="Soul Stat API", version="0.4.0")

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
    paymentId: str  # Made mandatory


@app.get("/")
def read_root():
    return {"message": "Soul Stat API v0.4.0 is running", "status": "ok"}


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
        # Verify Payment
        if not verify_payment(request.paymentId):
             raise HTTPException(status_code=402, detail="Payment verification failed or payment required.")

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
