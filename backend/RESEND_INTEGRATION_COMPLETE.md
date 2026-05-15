# CampusConnect Resend Email Integration - Setup Guide

## ✅ Status: COMPLETE & READY

Your CampusConnect backend now has full Resend email integration for:
- ✅ Password reset emails
- ✅ Email verification
- ✅ Recruiter approval notifications

---

## 📦 What's Included

### 1. Enhanced Email Service
**File**: `backend/services/email.py`
- ✅ Proper Resend client initialization
- ✅ Environment variable configuration
- ✅ Comprehensive error handling
- ✅ Professional HTML email templates
- ✅ Logging for debugging
- ✅ Graceful fallback if email unavailable

### 2. Updated Settings
**File**: `backend/config/settings.py`
- ✅ `RESEND_API_KEY` - From environment variables
- ✅ `FRONTEND_URL` - For email links
- ✅ `APP_NAME` - For email branding

### 3. Complete Authentication Integration
**File**: `backend/routes/auth.py`
- ✅ Forgot password sends email
- ✅ Email verification sends email
- ✅ Recruiter approval sends email

### 4. Dependencies
**File**: `backend/requirements.txt`
- ✅ Added `resend==0.10.0`

### 5. Documentation
- ✅ `RESEND_SETUP.md` - Complete setup guide
- ✅ `test_email_integration.py` - Email testing script

---

## 🚀 Quick Start (5 minutes)

### Step 1: Get Resend API Key

1. Go to https://resend.com
2. Sign up (free account)
3. Get API key from dashboard
4. Copy key starting with `re_`

### Step 2: Update .env

Create or update `backend/.env`:

```bash
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
APP_NAME=CampusConnect

# Other existing variables...
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
```

### Step 3: Install Dependencies

```bash
cd backend
pip install resend
# or
pip install -r requirements.txt
```

### Step 4: Test Configuration

```bash
python test_email_integration.py
```

Expected output:
```
✓ All tests passed! Resend is properly configured.
```

### Step 5: Start Backend

```bash
python main.py
```

---

## 🧪 Testing Email Integration

### Test 1: Run Configuration Test

```bash
python test_email_integration.py
```

This checks:
- ✓ Resend library installed
- ✓ API key configured
- ✓ Email service initialized
- ✓ Email templates working

### Test 2: Manual Test via API

1. Start backend: `python main.py`
2. Go to http://localhost:8000/api/v1/docs
3. Find `/auth/forgot-password` endpoint
4. Try it with your email
5. Check backend logs for email status

Backend logs will show:
```
✓ Password reset email sent to user@example.com (ID: 6e4ac8ba-...)
```

### Test 3: Check Email Delivery

1. Go to https://resend.com/emails
2. See delivered/failed emails
3. View full email content
4. Check delivery status

---

## 📧 How Emails Are Sent

### Password Reset Flow

```
User clicks "Forgot Password"
         ↓
POST /api/v1/auth/forgot-password
         ↓
Backend generates reset token
         ↓
Resend sends email with reset link
         ↓
User receives email
         ↓
User clicks link → /reset-password?token=...
         ↓
User sets new password
```

### Email Verification Flow

```
User registers
         ↓
Backend generates verification token
         ↓
Resend sends verification email
         ↓
User clicks link → /verify-email?token=...
         ↓
Email verified
```

---

## 🔒 Environment Variables

### Required

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

### Optional (with defaults)

```bash
FRONTEND_URL=http://localhost:5173      # For email links
APP_NAME=CampusConnect                  # For email branding
```

### Where to Set

**Local Development** (`backend/.env`):
```bash
RESEND_API_KEY=re_test_key_if_available
FRONTEND_URL=http://localhost:5173
```

**Production** (Render Dashboard):
1. Go to Service → Environment
2. Add `RESEND_API_KEY=re_live_key_...`
3. Redeploy service

---

## 📋 Email Templates

### 1. Password Reset Email
- Personal greeting
- Reset button
- Reset link
- 24-hour expiry notice
- CampusConnect branding

### 2. Email Verification
- Welcome message
- Verify button
- Verification link
- 48-hour expiry notice
- CampusConnect branding

### 3. Recruiter Approval
- Approval/rejection status
- Action button
- Dashboard link (if approved)
- Professional branding

Templates are built-in to `services/email.py` and automatically sent.

---

## 🔍 Debugging

### Check if Email Service Initialized

```python
from services.email import email_service

if email_service.resend:
    print("✓ Email service ready")
else:
    print("✗ Email service NOT initialized")
    # Check:
    # 1. RESEND_API_KEY set in .env
    # 2. Resend library installed: pip install resend
    # 3. Check logs for specific error
```

### View Email Logs

Backend logs show email status:

```bash
# Success
✓ Password reset email sent to user@example.com (ID: 6e4ac8ba-...)

# Failure
✗ Failed to send email: Invalid API key
✗ Exception sending email: Connection timeout
```

### Without Resend Configured

If `RESEND_API_KEY` not set:
- Emails NOT sent
- Email links logged to console
- Authentication still works
- Useful for local development without email

---

## 🚢 Deployment

### Render Backend

1. **Add Environment Variables**:
   - Go to Service → Environment
   - Add: `RESEND_API_KEY=re_live_key_...`
   - Add: `FRONTEND_URL=https://your-app.vercel.app`

2. **Redeploy**:
   - Click "Manual Deploy"
   - Wait for deployment to complete

3. **Verify**:
   - Check deployment logs
   - Test forgot password flow
   - Check Resend dashboard

### Vercel Frontend

No changes needed - already configured to use backend API.

---

## ✅ Verification Checklist

- [ ] Resend account created
- [ ] API key obtained and tested
- [ ] API key added to `.env`
- [ ] `pip install -r requirements.txt` run
- [ ] `test_email_integration.py` passes
- [ ] Forgot password endpoint works
- [ ] Email received successfully
- [ ] Rendered link works
- [ ] Password reset works
- [ ] Logged in with new password

---

## 📞 Troubleshooting

### Problem: "RESEND_API_KEY not found"

**Solution**:
1. Create `backend/.env` if it doesn't exist
2. Add line: `RESEND_API_KEY=re_xxxx`
3. Restart backend

### Problem: "Resend library not installed"

**Solution**:
```bash
pip install resend
# or
pip install -r requirements.txt
```

### Problem: "Invalid API key"

**Solution**:
1. Go to https://resend.com/api-keys
2. Copy full API key (starts with `re_`)
3. Update `.env` file
4. Restart backend

### Problem: Email not received

**Solution**:
1. Check Resend dashboard: https://resend.com/emails
2. Look for delivery status
3. Check spam folder
4. Verify email address in request
5. Try different email address

### Problem: Backend won't start

**Solution**:
1. Check Python version: `python --version`
2. Check all dependencies: `pip list | grep resend`
3. Check `.env` syntax
4. Check logs for specific error

---

## 🎯 How It Works (Technical)

### Initialization

```python
# backend/services/email.py
from resend import Resend

class EmailService:
    def __init__(self):
        # Load API key from environment
        self.resend = Resend(api_key=settings.RESEND_API_KEY)
        # Gracefully handle if not configured
```

### Sending Email

```python
def send_password_reset_email(self, email, reset_url, full_name):
    # Generate HTML from template
    html = self._render_password_reset_email(reset_url, full_name)
    
    # Send via Resend
    response = self.resend.emails.send({
        "from": f"{settings.APP_NAME} <onboarding@resend.dev>",
        "to": email,
        "subject": f"Reset your {settings.APP_NAME} password",
        "html": html,
    })
    
    # Log result
    if response.get("id"):
        log.info(f"✓ Email sent (ID: {response['id']})")
        return True
    else:
        log.error(f"✗ Email failed: {response}")
        return False
```

### Integration with Auth

```python
# backend/routes/auth.py
@router.post("/auth/forgot-password")
def forgot_password(payload, db):
    user = db.query(User).filter_by(email=payload.email).first()
    
    # Generate token
    reset_token = create_reset_token(str(user.id))
    user.reset_token = reset_token
    db.commit()
    
    # Send email
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    email_service.send_password_reset_email(user.email, reset_url, user.full_name)
    
    return {"message": "Email sent"}
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `config/settings.py` | Loads `RESEND_API_KEY` from environment |
| `services/email.py` | Email service with Resend integration |
| `routes/auth.py` | Uses email_service to send emails |
| `requirements.txt` | Added `resend` package |
| `RESEND_SETUP.md` | This setup guide |
| `test_email_integration.py` | Testing script |

---

## 🔗 Useful Links

- **Resend Dashboard**: https://resend.com
- **Resend API Docs**: https://resend.com/docs
- **Resend Python SDK**: https://github.com/resendlabs/resend-python
- **CampusConnect Frontend**: Check for `/forgot-password` page

---

## 💡 Key Features

✅ **No API Key in Code**
- Uses environment variables only
- Safe for GitHub/version control

✅ **Graceful Fallback**
- Works even if Resend not configured
- Logs emails to console in dev

✅ **Professional Emails**
- Beautiful HTML templates
- CampusConnect branding
- Responsive design

✅ **Complete Error Handling**
- Logs all failures
- Never breaks authentication
- Clear error messages

✅ **Security**
- DKIM/SPF via Resend
- Bounce tracking
- Rate limiting in Resend

✅ **Monitoring**
- Email logs in backend
- Delivery status in Resend dashboard
- Bounce notifications

---

## 🎉 Next Steps

1. ✅ Set up Resend account
2. ✅ Add API key to `.env`
3. ✅ Test with `test_email_integration.py`
4. ✅ Test forgot password flow
5. ✅ Deploy to production

**Everything is ready to go!** 🚀

---

**Last Updated**: May 15, 2026  
**Status**: ✅ Production Ready
