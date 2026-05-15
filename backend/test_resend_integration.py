#!/usr/bin/env python3
"""
Comprehensive Resend Email Integration Test Script

This script tests the complete Resend email integration for CampusConnect:
1. Verifies RESEND_API_KEY configuration
2. Tests Resend client initialization
3. Tests email sending capability
4. Tests both password reset and verification emails
5. Provides detailed debugging information

Usage:
    python test_resend_integration.py
"""

import sys
import os
import logging
from datetime import datetime, timezone

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging to see all debug output
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

log = logging.getLogger(__name__)


def print_header(text: str):
    """Print a formatted header."""
    print("\n" + "=" * 80)
    print(f"  {text}")
    print("=" * 80 + "\n")


def print_section(text: str):
    """Print a formatted section."""
    print("\n" + "-" * 80)
    print(f"  {text}")
    print("-" * 80 + "\n")


def test_environment_variables():
    """Test 1: Verify environment variables are loaded."""
    print_section("TEST 1: Environment Variables")
    
    from config.settings import settings
    
    checks = {
        "RESEND_API_KEY": bool(settings.RESEND_API_KEY),
        "FRONTEND_URL": bool(settings.FRONTEND_URL),
        "APP_NAME": bool(settings.APP_NAME),
        "DATABASE_URL": bool(settings.DATABASE_URL),
        "JWT_SECRET_KEY": bool(settings.JWT_SECRET_KEY),
    }
    
    print("Environment Variable Status:")
    for var, status in checks.items():
        icon = "✓" if status else "✗"
        print(f"  {icon} {var}: {'SET' if status else 'NOT SET'}")
    
    if settings.RESEND_API_KEY:
        api_key_preview = f"{settings.RESEND_API_KEY[:8]}...{settings.RESEND_API_KEY[-4:]}"
        print(f"\n  API Key Preview: {api_key_preview}")
    
    print(f"\n  Environment: {settings.ENV}")
    print(f"  Frontend URL: {settings.FRONTEND_URL}")
    print(f"  App Name: {settings.APP_NAME}")
    
    if not all(checks.values()):
        print("\n  ⚠️  WARNING: Some environment variables are not set!")
        return False
    
    print("\n  ✓ All required environment variables are set")
    return True


def test_resend_library():
    """Test 2: Verify Resend library is installed."""
    print_section("TEST 2: Resend Library Installation")
    
    try:
        import resend
        print(f"  ✓ Resend library is installed")
        print(f"  Version: {resend.__version__ if hasattr(resend, '__version__') else 'Unknown'}")
        return True
    except ImportError as e:
        print(f"  ✗ Resend library is NOT installed")
        print(f"  Error: {str(e)}")
        print(f"\n  To fix, run: pip install resend")
        return False


def test_email_service_initialization():
    """Test 3: Verify EmailService initializes correctly."""
    print_section("TEST 3: Email Service Initialization")
    
    try:
        from services.email import email_service, EmailService
        
        if email_service.resend:
            print(f"  ✓ Email service initialized successfully")
            print(f"  Resend client type: {type(email_service.resend).__name__}")
            return True
        else:
            print(f"  ✗ Email service not initialized")
            print(f"  Check RESEND_API_KEY configuration")
            return False
    except Exception as e:
        print(f"  ✗ Failed to initialize email service")
        print(f"  Error: {str(e)}")
        return False


def test_password_reset_email(test_email: str):
    """Test 4: Send a test password reset email."""
    print_section("TEST 4: Password Reset Email")
    
    from config.settings import settings
    from services.email import email_service
    from auth.security import create_reset_token
    
    print(f"  Sending test password reset email to: {test_email}\n")
    
    try:
        # Create a test token
        reset_token = create_reset_token(subject="999")
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        print(f"  Reset URL: {reset_url}\n")
        
        # Send the email
        success = email_service.send_password_reset_email(
            email=test_email,
            reset_url=reset_url,
            full_name="Test User"
        )
        
        if success:
            print(f"\n  ✓ Password reset email sent successfully")
            return True
        else:
            print(f"\n  ✗ Failed to send password reset email")
            print(f"  Check logs above for error details")
            return False
    except Exception as e:
        print(f"\n  ✗ Exception while testing password reset email")
        print(f"  Error: {str(e)}")
        return False


def test_verification_email(test_email: str):
    """Test 5: Send a test verification email."""
    print_section("TEST 5: Email Verification")
    
    from config.settings import settings
    from services.email import email_service
    from auth.security import create_verification_token
    
    print(f"  Sending test verification email to: {test_email}\n")
    
    try:
        # Create a test token
        verification_token = create_verification_token(subject="999")
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        
        print(f"  Verification URL: {verification_url}\n")
        
        # Send the email
        success = email_service.send_verification_email(
            email=test_email,
            verification_url=verification_url,
            full_name="Test User"
        )
        
        if success:
            print(f"\n  ✓ Verification email sent successfully")
            return True
        else:
            print(f"\n  ✗ Failed to send verification email")
            print(f"  Check logs above for error details")
            return False
    except Exception as e:
        print(f"\n  ✗ Exception while testing verification email")
        print(f"  Error: {str(e)}")
        return False


def test_api_connectivity():
    """Test 6: Direct API test without database."""
    print_section("TEST 6: Direct Resend API Connectivity")
    
    from config.settings import settings
    
    try:
        from resend import Resend
    except ImportError:
        print("  ✗ Resend library not installed")
        return False
    
    if not settings.RESEND_API_KEY:
        print("  ✗ RESEND_API_KEY not configured")
        return False
    
    try:
        client = Resend(api_key=settings.RESEND_API_KEY)
        print("  ✓ Resend client created successfully")
        
        # Try to list emails (lightweight API call)
        try:
            # This tests API connectivity without sending an email
            response = client.batch.send([{
                "from": f"{settings.APP_NAME} <onboarding@resend.dev>",
                "to": "delivered@resend.dev",  # Resend test email
                "subject": "CampusConnect API Test",
                "html": "<p>Testing Resend API connectivity</p>"
            }])
            
            print(f"  ✓ API connectivity test successful")
            print(f"  Response: {response}")
            return True
        except Exception as api_error:
            print(f"  ⚠️  API call failed (may be rate limiting): {str(api_error)}")
            print(f"  This could be normal if you've made many recent requests")
            return False
            
    except Exception as e:
        print(f"  ✗ Failed to create Resend client")
        print(f"  Error: {str(e)}")
        return False


def print_summary(results: dict):
    """Print test summary."""
    print_header("TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"Tests Passed: {passed}/{total}\n")
    
    for test_name, result in results.items():
        icon = "✓" if result else "✗"
        status = "PASS" if result else "FAIL"
        print(f"  {icon} {test_name}: {status}")
    
    print("\n" + "=" * 80)
    
    if passed == total:
        print("  ✓ ALL TESTS PASSED! Resend integration is working correctly.")
    else:
        print(f"  ⚠️  {total - passed} test(s) failed. See details above.")
    
    print("=" * 80 + "\n")


def print_next_steps():
    """Print next steps for production deployment."""
    print_header("NEXT STEPS FOR PRODUCTION")
    
    print("""
1. SET ENVIRONMENT VARIABLES on Render:
   - Go to your Render service
   - Settings → Environment
   - Add: RESEND_API_KEY=<your-key>
   - Add: FRONTEND_URL=<your-frontend-url>
   
2. VERIFY SENDER DOMAIN:
   - Resend uses onboarding@resend.dev for testing
   - For production, configure your own domain in Resend Dashboard
   - Update the sender in services/email.py when ready

3. TEST IN PRODUCTION:
   - Use the GET /api/v1/auth/test-email endpoint
   - Example: GET /api/v1/auth/test-email?recipient_email=your@email.com

4. MONITOR EMAIL DELIVERY:
   - Check backend logs for email send status
   - Monitor Resend Dashboard for bounce/complaint rates
   - Review logs for any API errors

5. RATE LIMITING (Optional):
   - Consider adding rate limiting to email endpoints
   - Prevent abuse of forgot-password and resend-verification

6. EMAIL TEMPLATES:
   - Customize HTML templates in services/email.py
   - Add your company branding and colors
   - Test email rendering in different clients
    """)


def main():
    """Run all tests."""
    print_header("CAMPUSCONNECT - RESEND EMAIL INTEGRATION TEST")
    
    print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print(f"Python: {sys.version.split()[0]}")
    print(f"Working Directory: {os.getcwd()}\n")
    
    # Get test email from user
    test_email = input("Enter test email address (where to send test emails): ").strip()
    if not test_email:
        test_email = "delivered@resend.dev"  # Resend's test email
        print(f"Using default test email: {test_email}")
    
    # Run tests
    results = {
        "Environment Variables": test_environment_variables(),
        "Resend Library": test_resend_library(),
        "Email Service Init": test_email_service_initialization(),
        "API Connectivity": test_api_connectivity(),
    }
    
    # Only run email tests if service is initialized
    if results["Email Service Init"]:
        print("\nProceed with email send tests? (y/n): ", end="")
        if input().lower().startswith("y"):
            results["Password Reset Email"] = test_password_reset_email(test_email)
            results["Verification Email"] = test_verification_email(test_email)
    
    # Print summary
    print_summary(results)
    
    # Print next steps
    if all(results.values()):
        print_next_steps()
    
    # Exit with appropriate code
    return 0 if all(results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
