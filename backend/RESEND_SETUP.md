# Resend Email Integration Guide

## Overview

CampusConnect uses **Resend** (https://resend.com) for sending professional transactional emails.
Resend handles DKIM, SPF, bounce tracking, and analytics automatically.

## Setup Instructions

### 1. Get Resend API Key

1. Go to https://resend.com
2. Sign up for free account
3. Go to API Keys section
4. Copy your API key (starts with `re_`)

### 2. Add to Environment

Create or update `.env` file in `backend/` directory:

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Optional (defaults shown)
FRONTEND_URL=http://localhost:5173
APP_NAME=CampusConnect
```

### 3. Install Dependencies

```bash
pip install resend
# or if updating
pip install -r requirements.txt
```

## How It Works

### File Structure

```
backend/
├── config/settings.py          # RESEND_API_KEY from environment
├── services/email.py           # EmailService class with Resend integration
└── routes/auth.py              # Uses email_service to send emails
```

### Email Service Usage

The `EmailService` class in `backend/services/email.py` provides three methods:

#### 1. Send Password Reset Email

```python
from services.email import email_service

# Send password reset email
success = email_service.send_password_reset_email(
    email="user@example.com",
    reset_url="https://app.com/reset-password?token=eyJ...",
    full_name="John Doe"
)

if success:
    print("Email sent successfully")
else:
    print("Email sending failed - check logs")
```

#### 2. Send Email Verification

```python
# Send email verification link
success = email_service.send_verification_email(
    email="user@example.com",
    verification_url="https://app.com/verify-email?token=eyJ...",
    full_name="John Doe"
)
```

#### 3. Send Recruiter Approval

```python
# Send recruiter approval email
success = email_service.send_recruiter_approval_email(
    email="recruiter@company.com",
    status="approved",  # or "rejected"
    full_name="Jane Smith"
)
```

## Integration with Authentication

The email service is automatically used in `backend/routes/auth.py`:

### Forgot Password Flow

```python
@router.post("/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session):
    # Find user by email
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user:
        return {"message": "If that email is registered, we've sent a password reset link"}
    
    # Generate reset token
    reset_token = create_reset_token(subject=str(user.id))
    user.reset_token = reset_token
    user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(hours=24)
    db.commit()
    
    # Send email with reset link
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    email_service.send_password_reset_email(user.email, reset_url, user.student_profile.full_name)
    
    return {"message": "If that email is registered, we've sent a password reset link"}
```

### Email Verification Flow

```python
@router.post("/auth/resend-verification")
def resend_verification(payload: ResendVerificationRequest, db: Session):
    # Find user by email
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user or user.is_verified:
        return {"message": "..."}
    
    # Generate verification token
    verification_token = create_verification_token(subject=str(user.id))
    user.verification_token = verification_token
    user.verification_token_expiry = datetime.now(timezone.utc) + timedelta(hours=48)
    db.commit()
    
    # Send verification email
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    email_service.send_verification_email(user.email, verification_url, user.student_profile.full_name)
    
    return {"message": "If that email is registered and not verified, we've sent a verification link"}
```

## Email Templates

The email service includes beautiful HTML templates:

### Password Reset Email
- Personalized greeting
- Clear call-to-action button
- Reset link
- Token expiry information (24 hours)
- Professional branding

### Email Verification
- Welcome message
- Verification button
- Token expiry information (48 hours)
- CampusConnect branding

### Recruiter Approval
- Approval/rejection status
- Action button (Go to dashboard / Learn more)
- Professional branding

## Environment Configuration

### Development (.env)

```bash
# Use Resend test credentials (optional)
RESEND_API_KEY=re_test_key_123
FRONTEND_URL=http://localhost:5173
APP_NAME=CampusConnect
```

### Production (.env on Render)

```bash
# Use live Resend credentials
RESEND_API_KEY=re_live_key_xxxxxxxxxxxx
FRONTEND_URL=https://your-app.vercel.app
APP_NAME=CampusConnect
```

## Testing Emails Locally

Without RESEND_API_KEY set:
- Email links are logged to console
- Test by checking logs instead of inbox

With RESEND_API_KEY set:
- Emails sent to real addresses
- Check Resend dashboard for delivery status

## Error Handling

The email service gracefully handles errors:

```
✓ Success (email sent)
  - Returns: True
  - Logs: "✓ Email sent to {email} (ID: ...)"

✗ Failed (email not sent)
  - Returns: False
  - Logs: "✗ Failed to send email: {reason}"
  - Auth flow continues (user can still reset password)
```

## Logging

Check logs for email status:

```bash
# Backend logs show email sending status
# Search for "✓" or "✗" markers

# Example log output:
# ✓ Password reset email sent to user@example.com (ID: 6e4ac8ba-...)
# ✗ Failed to send email: Invalid API key
```

## Troubleshooting

### Problem: "RESEND_API_KEY not configured"

**Solution**: Add to `.env` file:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### Problem: "Resend library not installed"

**Solution**: Install resend package:
```bash
pip install resend
```

### Problem: "Failed to send email: Invalid API key"

**Solution**: Check Resend dashboard:
1. Go to https://resend.com/api-keys
2. Copy correct API key
3. Update `.env` file

### Problem: Email not received

**Solution**: 
1. Check Resend dashboard at https://resend.com/emails
2. Verify email address is correct
3. Check spam folder
4. Test with different email address

## API Limits

Resend free tier includes:
- 1 email per day initially
- Increases as you verify email
- No setup fees
- Pay-as-you-go at scale

See https://resend.com/pricing for details.

## Production Deployment

### Render Backend

1. Add environment variable in Render dashboard:
   ```
   RESEND_API_KEY = re_live_key_...
   ```

2. Redeploy service
3. Test forgot password flow
4. Check logs for "✓" markers

### Vercel Frontend

No changes needed - frontend already points to backend API.

## Security Best Practices

✅ **Never commit API keys** - Use environment variables only
✅ **Use live keys in production** - Not test keys
✅ **Rotate keys periodically** - Resend dashboard
✅ **Monitor for abuse** - Check Resend dashboard
✅ **Log all emails** - Audit trail in logs

## Reference

- **Resend Docs**: https://resend.com/docs
- **Email Templates**: Built-in HTML templates in `services/email.py`
- **Settings**: `config/settings.py` RESEND_API_KEY
- **Authentication Routes**: `routes/auth.py` (calls email_service)
