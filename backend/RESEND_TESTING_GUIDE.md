# Resend Email Integration - Testing & Verification Guide

This guide provides step-by-step instructions to test and verify the Resend email integration in CampusConnect.

## Quick Start

### 1. Prerequisites

```bash
# Ensure Resend library is installed
pip install resend==0.10.0

# Verify installation
python -c "import resend; print(f'Resend version: {resend.__version__ if hasattr(resend, \"__version__\") else \"installed\"}')"
```

### 2. Set RESEND_API_KEY

Create or update `.env` file in the `backend/` directory:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
APP_NAME=CampusConnect
DATABASE_URL=postgresql://user:password@localhost/campusconnect
JWT_SECRET_KEY=your-secret-key
```

To get your API key:
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key (format: `re_xxxxxxxx...`)

### 3. Run Comprehensive Test Suite

```bash
cd backend
python test_resend_integration.py
```

This script will:
- ✓ Verify RESEND_API_KEY is configured
- ✓ Check Resend library installation
- ✓ Test email service initialization
- ✓ Test API connectivity
- ✓ Send test password reset email
- ✓ Send test verification email
- ✓ Provide detailed logging output

## Testing Individual Endpoints

### Test Email Endpoint (NEW)

```bash
# Using curl
curl "http://localhost:8000/api/v1/auth/test-email?recipient_email=your-email@example.com"

# Using Python requests
python -c "
import requests
response = requests.get(
    'http://localhost:8000/api/v1/auth/test-email',
    params={'recipient_email': 'your-email@example.com'}
)
print(response.json())
"
```

**Response on Success:**
```json
{
  "status": "success",
  "message": "Test email sent successfully to your-email@example.com",
  "details": {
    "recipient": "your-email@example.com",
    "sender": "CampusConnect <onboarding@resend.dev>",
    "message_id": "c21e... (from Resend)",
    "environment": "development",
    "api_key_configured": true,
    "timestamp": "2024-05-15T10:30:45.123456Z"
  },
  "next_steps": "Check your inbox (and spam folder) for the test email..."
}
```

**Response on API Error:**
```json
{
  "status": "api_error",
  "message": "Resend API returned an error",
  "details": {
    "recipient": "your-email@example.com",
    "api_response": "Invalid API key",
    "environment": "development"
  },
  "troubleshooting": [
    "Verify RESEND_API_KEY is correct in environment variables",
    "Check Resend dashboard for API key validity",
    "Verify sender domain is properly configured in Resend"
  ]
}
```

### Forgot Password Endpoint

```bash
# 1. Request password reset
curl -X POST "http://localhost:8000/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Expected response (always returns success for security)
# {"message": "If that email is registered, we've sent a password reset link"}

# 2. Check backend logs for email send status
# Look for: "✓ PASSWORD RESET EMAIL SENT SUCCESSFULLY" or "✗ FAILED TO SEND PASSWORD RESET EMAIL"
```

### Email Verification Endpoint

```bash
# 1. Request email verification
curl -X POST "http://localhost:8000/api/v1/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Expected response
# {"message": "If that email is registered and not verified, we've sent a verification link"}

# 2. Check backend logs for email send status
```

## Detailed Logging Output

When emails are sent, you'll see detailed logs like:

```
================================================================================
INITIALIZING EMAIL SERVICE
================================================================================
📋 RESEND_API_KEY configured: True
📋 RESEND_API_KEY preview: re_xxxxxx...xxxxx
📋 Environment: development
📋 App Name: CampusConnect
📋 Frontend URL: http://localhost:5173
✓ Resend email service initialized successfully
================================================================================

--------------------------------------------------------------------------------
📧 SENDING PASSWORD RESET EMAIL
   Recipient: test@example.com
   Full Name: John Doe
   Reset URL: http://localhost:5173/reset-password?token=eyJhbGc...
   Sender: CampusConnect <onboarding@resend.dev>
   API Response: {'id': 'c21e...', 'from': '...', 'to': '...', ...}
✓ PASSWORD RESET EMAIL SENT SUCCESSFULLY
   Message ID: c21e123...
   Recipient: test@example.com
   Timestamp: 2024-05-15T10:30:45.123456Z
--------------------------------------------------------------------------------
```

## Troubleshooting

### Issue: "RESEND_API_KEY not configured"

**Solution:**
1. Add `RESEND_API_KEY` to your `.env` file
2. Restart the backend server
3. Run the test script to verify

```bash
# Check if .env file exists and has the key
cat .env | grep RESEND_API_KEY

# Or verify it's loaded by the settings
python -c "from config.settings import settings; print(f'API Key Set: {bool(settings.RESEND_API_KEY)}')"
```

### Issue: "Resend library not installed"

**Solution:**
```bash
pip install resend==0.10.0
python -c "import resend; print('✓ Resend installed')"
```

### Issue: "Invalid API key"

**Solution:**
1. Verify the API key is correct in `.env`
2. Go to [Resend Dashboard](https://resend.com/api-keys)
3. Check that the key is active (not revoked/deleted)
4. Create a new API key if needed

### Issue: Emails not arriving in inbox

**Checklist:**
1. ✓ Check spam/junk folder first
2. ✓ Verify recipient email is correct (check logs for exact email)
3. ✓ Check Resend Dashboard for bounce/complaint notifications
4. ✓ Verify sender domain is configured (currently using `onboarding@resend.dev`)
5. ✓ Test with `delivered@resend.dev` (Resend's test email address)

### Issue: "Message ID not in response"

**Solution:**
Check the logs for detailed API response:
- If `response` is an error dict: API key or configuration issue
- If `response` has unexpected format: Library version mismatch
- Run: `pip install --upgrade resend`

### Issue: Connection timeout

**Solution:**
```bash
# Check network connectivity to Resend API
curl -I https://api.resend.com

# Check if you have internet connection
ping 8.8.8.8

# Test from Python
python -c "
import httpx
try:
    httpx.get('https://api.resend.com', timeout=5)
    print('✓ Network connectivity OK')
except Exception as e:
    print(f'✗ Network error: {e}')
"
```

## Production Deployment (Render)

### 1. Set Environment Variables on Render

In Render Dashboard:
1. Go to your service
2. Settings → Environment
3. Add these variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=https://your-frontend-domain.com
APP_NAME=CampusConnect
```

### 2. Test in Production

Once deployed:

```bash
# Test the endpoint
curl "https://your-backend-domain.com/api/v1/auth/test-email?recipient_email=your@email.com"

# Check response status and details
```

### 3. Monitor Email Delivery

- **Resend Dashboard**: https://resend.com/emails
- **Backend Logs**: Check Render logs for email send details
- **Failed Emails**: Configure bounce/complaint handling in Resend

### 4. Configure Production Domain (Optional)

By default, emails come from `onboarding@resend.dev`. To use your own domain:

1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., `noreply@campusconnect.com`)
3. Follow DNS verification steps
4. Update `services/email.py`:
   ```python
   "from": f"{settings.APP_NAME} <noreply@your-domain.com>"
   ```

## Testing Scenarios

### Scenario 1: Complete Password Reset Flow

```bash
# 1. Request password reset
curl -X POST "http://localhost:8000/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com"}'

# 2. Check logs for:
# - ✓ PASSWORD RESET EMAIL SENT SUCCESSFULLY
# - Message ID from Resend

# 3. Check email inbox for email with reset link

# 4. Click reset link or copy token

# 5. Call reset endpoint
curl -X POST "http://localhost:8000/api/v1/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-from-email>","password":"newpassword123"}'

# 6. Login with new password
```

### Scenario 2: Email Verification Flow

```bash
# 1. Register new student
curl -X POST "http://localhost:8000/api/v1/auth/register/student" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"student@example.com",
    "password":"password123",
    "full_name":"John Doe",
    "department":"Computer Science",
    "graduation_year":2025
  }'

# 2. Check logs for verification email send

# 3. Resend verification if needed
curl -X POST "http://localhost:8000/api/v1/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com"}'

# 4. Click verification link in email

# 5. Verify email using endpoint
curl -X POST "http://localhost:8000/api/v1/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-from-email>"}'
```

### Scenario 3: Admin Testing

```bash
# Send test email to multiple recipients
for email in test1@example.com test2@example.com test3@example.com; do
  curl "http://localhost:8000/api/v1/auth/test-email?recipient_email=$email"
  echo "\nSent to: $email\n"
done
```

## Debugging Commands

```bash
# Check if Resend service is initialized
python -c "
from services.email import email_service
print(f'Service initialized: {email_service.resend is not None}')
print(f'Client type: {type(email_service.resend).__name__ if email_service.resend else None}')
"

# Check configuration
python -c "
from config.settings import settings
print(f'API Key: {settings.RESEND_API_KEY[:10]}...' if settings.RESEND_API_KEY else 'NOT SET')
print(f'Frontend URL: {settings.FRONTEND_URL}')
print(f'App Name: {settings.APP_NAME}')
print(f'Environment: {settings.ENV}')
"

# Test email sending directly
python -c "
from services.email import email_service
result = email_service.send_password_reset_email(
    email='test@example.com',
    reset_url='http://localhost:5173/reset?token=TEST',
    full_name='Test User'
)
print(f'Email sent: {result}')
"
```

## Log Analysis

### Successful Email Send

```
✓ PASSWORD RESET EMAIL SENT SUCCESSFULLY
   Message ID: c21e123abc456def789ghi0jklmnop
   Recipient: user@example.com
   Timestamp: 2024-05-15T10:30:45.123456Z
```

### Failed Email Send - Invalid API Key

```
✗ FAILED TO SEND PASSWORD RESET EMAIL
   Recipient: user@example.com
   API Response: {'error': 'Invalid API key'}
   Response Type: dict
```

### Failed Email Send - Service Not Configured

```
⚠️  Email service not configured. Cannot send password reset email to user@example.com.
    Password reset link: http://localhost:5173/reset?token=...
```

## Performance Monitoring

In Render logs, look for:
- Total emails sent (per deployment)
- Average send time
- Success vs failure rate
- Error patterns

## Next Steps

After successful testing:

1. ✓ Verify all email templates are branded correctly
2. ✓ Test across different email clients (Gmail, Outlook, etc.)
3. ✓ Set up email bounce/complaint handling
4. ✓ Configure production domain (optional)
5. ✓ Add rate limiting to email endpoints (optional)
6. ✓ Monitor delivery rates in Resend Dashboard

## Support Resources

- **Resend Documentation**: https://resend.com/docs
- **Resend Dashboard**: https://resend.com
- **CampusConnect Docs**: See `RESEND_SETUP.md`

---

**Last Updated**: May 15, 2024
**Version**: 1.0
**Status**: Production Ready ✓
