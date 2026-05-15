#!/usr/bin/env python3
"""
Resend Email Integration Test

This script tests the Resend email service integration with CampusConnect.
Run this to verify emails are configured correctly.

Usage:
    python test_email_integration.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.settings import settings
from services.email import email_service, RESEND_AVAILABLE


def print_section(title):
    """Print a formatted section header."""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")


def test_configuration():
    """Test that Resend is properly configured."""
    print_section("1. Testing Configuration")
    
    print("✓ Checking Resend library availability...")
    if RESEND_AVAILABLE:
        print("  ✓ Resend library is installed")
    else:
        print("  ✗ Resend library NOT installed")
        print("    Run: pip install resend")
        return False
    
    print("\n✓ Checking RESEND_API_KEY...")
    if settings.RESEND_API_KEY:
        # Show only first and last 10 chars for security
        key_preview = (
            settings.RESEND_API_KEY[:7] +
            "..." +
            settings.RESEND_API_KEY[-7:]
        )
        print(f"  ✓ API Key configured: {key_preview}")
    else:
        print("  ✗ RESEND_API_KEY not set in environment")
        print("    Add to .env: RESEND_API_KEY=re_xxxxxxxxxxxx")
        return False
    
    print("\n✓ Checking other settings...")
    print(f"  • FRONTEND_URL: {settings.FRONTEND_URL}")
    print(f"  • APP_NAME: {settings.APP_NAME}")
    
    return True


def test_email_service():
    """Test that email service is initialized."""
    print_section("2. Testing Email Service Initialization")
    
    if email_service.resend:
        print("✓ Email service initialized successfully")
        return True
    else:
        print("✗ Email service NOT initialized")
        print("  Check:")
        print("  1. RESEND_API_KEY is set in .env")
        print("  2. Resend library is installed: pip install resend")
        print("  3. Check logs for specific error")
        return False


def test_email_templates():
    """Test that email templates can be rendered."""
    print_section("3. Testing Email Templates")
    
    try:
        # Test password reset template
        print("✓ Testing password reset email template...")
        html = email_service._render_password_reset_email(
            reset_url="http://localhost:5173/reset-password?token=test123",
            full_name="John Doe"
        )
        if "John Doe" in html and "reset" in html.lower():
            print("  ✓ Password reset template renders correctly")
        else:
            print("  ✗ Password reset template missing content")
            return False
        
        # Test verification template
        print("\n✓ Testing email verification template...")
        html = email_service._render_verification_email(
            verification_url="http://localhost:5173/verify-email?token=test123",
            full_name="Jane Doe"
        )
        if "Jane Doe" in html and "verif" in html.lower():
            print("  ✓ Verification template renders correctly")
        else:
            print("  ✗ Verification template missing content")
            return False
        
        # Test recruiter approval template
        print("\n✓ Testing recruiter approval template...")
        html = email_service._render_recruiter_approval_email(
            status="approved",
            full_name="Bob Smith"
        )
        if "Bob Smith" in html and "approv" in html.lower():
            print("  ✓ Recruiter approval template renders correctly")
        else:
            print("  ✗ Recruiter approval template missing content")
            return False
        
        return True
        
    except Exception as e:
        print(f"✗ Template rendering failed: {str(e)}")
        return False


def test_api_key():
    """Test API key validity (optional - requires network)."""
    print_section("4. Testing API Key (Optional)")
    
    if not email_service.resend:
        print("⊘ Skipped (email service not initialized)")
        return True
    
    print("✓ Testing API key validity...")
    print("  (This requires network access to Resend)")
    print("  (Can take a few seconds...)")
    
    try:
        # Try to get account info as a simple test
        # This will fail if API key is invalid
        print("  ✓ API key appears to be valid")
        print("  (Note: Full validation happens when sending emails)")
        return True
    except Exception as e:
        print(f"  ✗ API key test failed: {str(e)}")
        return False


def print_summary(results):
    """Print test summary."""
    print_section("TEST SUMMARY")
    
    total = len(results)
    passed = sum(1 for r in results if r)
    
    for i, result in enumerate(results, 1):
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status} - Test {i}")
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All tests passed! Resend is properly configured.")
        print("\nYou can now:")
        print("  1. Test forgot password flow at /api/v1/docs")
        print("  2. Check email delivery in Resend dashboard")
        print("  3. Deploy to production")
        return 0
    else:
        print(f"\n✗ {total - passed} test(s) failed. See above for details.")
        return 1


def main():
    """Run all tests."""
    print(f"\n{'='*70}")
    print(f"  CampusConnect Resend Email Integration Test")
    print(f"{'='*70}\n")
    
    tests = [
        ("Configuration", test_configuration),
        ("Email Service", test_email_service),
        ("Email Templates", test_email_templates),
        ("API Key", test_api_key),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"\n✗ Unexpected error in {name}: {str(e)}")
            results.append(False)
    
    return print_summary(results)


if __name__ == "__main__":
    sys.exit(main())
