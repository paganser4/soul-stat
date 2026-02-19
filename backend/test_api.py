# -*- coding: utf-8 -*-
import sys
import httpx
import json
import time

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*50)
    print("  " + title)
    print("="*50)

def test_health_check():
    print_section("1. Health Check (GET /)")
    try:
        r = httpx.get(f"{BASE_URL}/", timeout=5)
        print(f"  Status: {r.status_code}")
        print(f"  Response: {r.text[:300]}")
        return r.status_code == 200
    except Exception as e:
        print(f"  [FAIL] Connection error: {e}")
        return False

def test_saju_analysis():
    print_section("2. Saju Analysis (POST /analyze)")
    # API uses camelCase fields: birthDate, birthTime
    payload = {
        "birthDate": "1990-01-15",
        "birthTime": "09:00"
    }
    try:
        print(f"  Request: {json.dumps(payload)}")
        start = time.time()
        r = httpx.post(f"{BASE_URL}/analyze", json=payload, timeout=60)
        elapsed = time.time() - start
        print(f"  Status: {r.status_code} ({elapsed:.1f}s)")

        if r.status_code == 200:
            data = r.json()
            print(f"  [PASS] Analysis successful!")
            print(f"  Response keys: {list(data.keys())}")

            # Pillars
            if "pillars" in data:
                fp = data["pillars"]
                print("\n  [Four Pillars (Saju)]")
                for pillar in ["year_pillar", "month_pillar", "day_pillar", "hour_pillar"]:
                    if pillar in fp:
                        print(f"    {pillar}: {fp[pillar]}")
                # fallback
                if not any(k in fp for k in ["year_pillar","month_pillar","day_pillar","hour_pillar"]):
                    print(f"    {fp}")

            # Stats / Elements
            if "element_counts" in data:
                print("\n  [Element Distribution]")
                for elem, count in data["element_counts"].items():
                    print(f"    {elem}: {count}")
            elif "elements" in data:
                print("\n  [Element Distribution]")
                for elem, count in data["elements"].items():
                    print(f"    {elem}: {count}")

            # Interpretation
            if "basic_interpretation" in data:
                interp = str(data["basic_interpretation"])
                print(f"\n  [AI Interpretation (first 300 chars)]")
                print(f"    {interp[:300]}...")

            return True
        else:
            print(f"  [FAIL] {r.text[:500]}")
            return False
    except Exception as e:
        print(f"  [FAIL] Error: {e}")
        return False

def test_api_docs():
    print_section("3. API Docs (GET /docs)")
    try:
        r = httpx.get(f"{BASE_URL}/docs", timeout=5)
        print(f"  Status: {r.status_code}")
        status = "[PASS]" if r.status_code == 200 else "[FAIL]"
        print(f"  {status} FastAPI Swagger UI accessible")
        return r.status_code == 200
    except Exception as e:
        print(f"  [FAIL] Error: {e}")
        return False

def test_openapi_schema():
    print_section("4. OpenAPI Schema - List all endpoints")
    try:
        r = httpx.get(f"{BASE_URL}/openapi.json", timeout=5)
        if r.status_code == 200:
            schema = r.json()
            paths = schema.get("paths", {})
            print(f"  [PASS] Found {len(paths)} endpoint(s):")
            for path, methods in paths.items():
                for method in methods:
                    print(f"    {method.upper()} {path}")
            return True
        else:
            print(f"  [FAIL] Status: {r.status_code}")
            return False
    except Exception as e:
        print(f"  [FAIL] Error: {e}")
        return False

if __name__ == "__main__":
    print("\n*** Soul Stat API Auto Test ***")
    results = {}

    results["Health Check"] = test_health_check()
    if results["Health Check"]:
        results["OpenAPI Schema"] = test_openapi_schema()
        results["Saju Analysis"] = test_saju_analysis()
        results["API Docs"] = test_api_docs()
    else:
        print("\n[WARN] Backend server (port 8000) is not responding.")
        print("  Please start: uvicorn main:app --reload --port 8000")

    print_section("Test Result Summary")
    all_pass = True
    for name, result in results.items():
        status = "[PASS]" if result else "[FAIL]"
        print(f"  {status}: {name}")
        if not result:
            all_pass = False

    print(f"\n{'All tests passed!' if all_pass else 'Some tests failed - see details above.'}")
