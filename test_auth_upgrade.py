#!/usr/bin/env python3
"""
CampusConnect Authentication Upgrade - Verification Script
Tests all new authentication endpoints
"""

import sys
import requests
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(method, path, data=None, description=""):
    """Test an API endpoint"""
    url = f"{BASE_URL}{path}"
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"URL: {method} {url}")
    if data:
        print(f"Payload: {data}")
    
    try:
        if method == "POST":
            response = requests.post(url, json=data)
        elif method == "GET":
            response = requests.get(url)
        else:
            return False
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        return response.status_code < 400
    except Exception as e:
        print(f"Error: {e}")
        return False


def main():
    print("🔐 CampusConnect Authentication Upgrade - Verification Tests")
    print("="*60)
    print(f"Time: {datetime.now().isoformat()}")
    print(f"Backend URL: {BASE_URL}")
    
    tests = [
        ("GET", "/health", None, "Health Check"),
        ("POST", "/auth/forgot-password", {"email": "test@example.com"}, "Forgot Password"),
        ("POST", "/auth/verify-email", {"token": "invalid"}, "Verify Email (Invalid Token)"),
    ]
    
    results = []
    for method, path, data, description in tests:
        result = test_endpoint(method, path, data, description)
        results.append((description, result))
    
    print(f"\n{'='*60}")
    print("Test Summary:")
    print("="*60)
    
    for desc, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {desc}")
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ All tests passed! Backend is ready.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the backend.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
