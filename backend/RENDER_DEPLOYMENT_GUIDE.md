# Render Deployment Guide - Resend Integration

Complete guide to deploy CampusConnect with Resend email integration to Render.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Render Setup](#render-setup)
3. [Environment Variables](#environment-variables)
4. [Deployment](#deployment)
5. [Post-Deployment Testing](#post-deployment-testing)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to Render, ensure:

- ✓ All code changes committed to Git
- ✓ `resend==0.10.0` in `backend/requirements.txt`
- ✓ RESEND_API_KEY obtained from [Resend Dashboard](https://resend.com/api-keys)
- ✓ Frontend deployed (get the FRONTEND_URL)
- ✓ PostgreSQL database set up on Render

### Get Your RESEND_API_KEY

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it (e.g., "CampusConnect-Production")
4. Copy the key (format: `re_xxxxxxxx...`)
5. Keep it secure - don't commit to Git

## Render Setup

### Step 1: Create Render Account

- Go to https://render.com
- Sign up/Login with GitHub
- Connect your GitHub repository

### Step 2: Create Backend Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Fill in the form:

```
Name: campusconnect-backend
Environment: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port 10000
```

4. Click **Create Web Service**

### Step 3: Configure Database

1. Click **New +** → **PostgreSQL**
2. Fill in the form:

```
Name: campusconnect-db
Database Name: campusconnect
User: postgres
```

3. Note the connection URL

## Environment Variables

### Step 1: Add Environment Variables to Render

1. Go to your backend service on Render
2. Click **Environment** (left sidebar)
3. Add the following variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=https://your-frontend-domain.vercel.app
APP_NAME=CampusConnect
DATABASE_URL=postgresql://user:password@host:port/campusconnect
JWT_SECRET_KEY=your-secure-random-secret-key-here
ENV=production
```

### Step 2: Copy DATABASE_URL from PostgreSQL Service

1. Go to your PostgreSQL service on Render
2. Copy the "Internal Database URL"
3. Paste into `DATABASE_URL` environment variable

### Step 3: Generate JWT_SECRET_KEY

```bash
# Option 1: Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: Using OpenSSL
openssl rand -hex 32
```

Copy the generated key to `JWT_SECRET_KEY`.

## Deployment

### Step 1: Enable Auto-Deploy

1. Go to backend service settings
2. Under "Auto-Deploy", select **Yes**
3. This automatically deploys on Git push

### Step 2: Deploy Manually (if needed)

1. Go to backend service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Monitor deployment in the logs

### Step 3: Monitor Deployment

In the Render dashboard:
- Watch logs for build progress
- Look for: `Uvicorn running on 0.0.0.0:10000`
- Service should show **Live** status

### Step 4: Get Backend URL

Once deployed:
1. Go to your backend service page
2. Copy the URL (e.g., `https://campusconnect-backend.onrender.com`)
3. Update frontend to use this URL

## Post-Deployment Testing

### Test 1: Health Checks

```bash
# Basic health check
curl https://your-backend.onrender.com/health

# Database connectivity check
curl https://your-backend.onrender.com/health/db

# Expected response
{"status": "ok"}
```

### Test 2: Test Email Endpoint

```bash
# Send test email
curl "https://your-backend.onrender.com/api/v1/auth/test-email?recipient_email=your@email.com"

# Expected response
{
  "status": "success",
  "message": "Test email sent successfully to your@email.com",
  "details": {...}
}
```

### Test 3: Full Authentication Flow

```bash
# 1. Register student
curl -X POST "https://your-backend.onrender.com/api/v1/auth/register/student" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "full_name":"Test User",
    "department":"CS",
    "graduation_year":2025
  }'

# 2. Check email for verification link
# 3. Test forgot password
curl -X POST "https://your-backend.onrender.com/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test 4: Check Resend Dashboard

1. Go to https://resend.com/emails
2. Look for recently sent emails
3. Check delivery status:
   - **Delivered**: Email sent successfully
   - **Bounced**: Invalid email address
   - **Complained**: User marked as spam
   - **Failed**: API error or other issue

## Monitoring

### Enable Render Logs

1. Go to your backend service
2. Click **Logs** tab (top right)
3. Monitor for:

```
✓ PASSWORD RESET EMAIL SENT SUCCESSFULLY
✓ EMAIL VERIFICATION SENT SUCCESSFULLY
✓ Resend email service initialized successfully
```

### Set Up Email Alerts

In Render:
1. Go to service settings
2. Click **Notifications**
3. Enable alerts for:
   - Service stops unexpectedly
   - Deployment failures
   - Critical errors

### Monitor Resend

In Resend Dashboard:
1. Check **Emails** tab for delivery status
2. Review **Settings** → **Notifications** for bounces
3. Monitor API quota usage

### View Backend Logs

```bash
# SSH into Render service (if enabled)
# Or use Render dashboard logs viewer

# Look for patterns:
grep "PASSWORD RESET" render-logs.txt  # Successful resets
grep "Exception" render-logs.txt       # Any errors
grep "API Response" render-logs.txt    # API interactions
```

## Troubleshooting

### Issue: "RESEND_API_KEY not configured"

**Solution:**
1. Go to Render service settings
2. Check Environment variables are saved
3. Manually redeploy: **Manual Deploy** → **Deploy latest commit**
4. Check logs: should see `RESEND_API_KEY configured: True`

### Issue: "Invalid API key"

**Solution:**
1. Verify the API key is correct in Render
2. Go to Resend Dashboard - check if key is active
3. Create new API key if needed
4. Update Render environment variable
5. Redeploy service

### Issue: Emails not being sent

**Checklist:**
1. Test endpoint returns success status
2. Check Render logs for send errors
3. Check Resend Dashboard for API issues
4. Verify recipient email is valid
5. Check spam folder

**Debug:**
```bash
# Check service is healthy
curl https://your-backend.onrender.com/health

# Check logs
tail -f render-service-logs.txt | grep -i email

# Test email endpoint with verbose output
curl -v "https://your-backend.onrender.com/api/v1/auth/test-email?recipient_email=test@example.com"
```

### Issue: 500 Service Error

**Causes:**
- Database connection failed
- Missing environment variable
- Resend library not installed
- Invalid configuration

**Solution:**
1. Check Render logs for detailed error
2. Verify all environment variables are set
3. Ensure `resend==0.10.0` is in `requirements.txt`
4. Check database connection URL is correct
5. Redeploy with **Manual Deploy**

### Issue: Service keeps restarting

**Solution:**
1. Check logs for Python errors
2. Run `py_compile` locally to check syntax:
   ```bash
   python -m py_compile backend/main.py
   python -m py_compile backend/services/email.py
   ```
3. Fix errors locally
4. Commit and push to trigger redeploy

### Issue: Database migrations not running

**Solution:**
1. SSH into Render service or use deploy hook
2. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
3. Or configure as part of build command:
   ```
   pip install -r requirements.txt && alembic upgrade head
   ```

## Advanced Configuration

### Enable Auto-Scaling

1. Go to service settings
2. Click **Auto-Scaling**
3. Enable if expecting high traffic
4. Set min/max instances

### Configure Custom Domain

1. Go to service settings
2. Click **Custom Domain**
3. Add your domain (e.g., `api.campusconnect.com`)
4. Follow DNS configuration steps

### Set Up Scheduled Tasks

For periodic email checks or cleanup:
1. Use Render Cron Jobs
2. Configure POST requests to custom endpoints
3. Schedule for off-peak hours

## Rollback Plan

If deployment fails:

1. **Immediate Rollback:**
   - Go to Render Dashboard
   - Click **Manual Deploy** → select previous commit
   - Service will redeploy with previous version

2. **Quick Fix:**
   - Fix error locally
   - Commit and push
   - Render auto-deploys (if enabled)

3. **Database Issues:**
   - Render keeps database backups
   - Contact Render support for restoration

## Production Checklist

Before going live:

- [ ] RESEND_API_KEY set in Render environment
- [ ] FRONTEND_URL points to production frontend
- [ ] DATABASE_URL uses production database
- [ ] Health checks return 200 OK
- [ ] Test email endpoint works
- [ ] Full auth flow tested (register → verify → forgot password)
- [ ] Emails arrive in production inbox
- [ ] Resend Dashboard shows successful sends
- [ ] Logs show no errors
- [ ] Auto-deploy enabled for continuous updates
- [ ] Monitoring/alerts configured
- [ ] Email rate limiting in place (optional)

## Performance Optimization

### Reduce Cold Start Time

```
# In render.yaml - optional build optimizations
buildCommand: "pip install -r requirements.txt --prefer-binary"
```

### Monitor Resource Usage

In Render Dashboard:
- CPU usage
- Memory usage
- Active connections

Upgrade if hitting limits:
```
Plan → Pro or higher
```

### Cache Static Assets

Frontend should serve static assets from CDN (Vercel does this automatically).

## Support & Escalation

### Resend Issues
- Dashboard: https://resend.com
- Docs: https://resend.com/docs
- API Status: https://resend.statuspage.io

### Render Issues
- Dashboard: https://render.com
- Docs: https://render.com/docs
- Status: https://status.render.com

### CampusConnect Support
- See main README.md for contact info

## Additional Resources

- **Render Documentation**: https://render.com/docs
- **Resend Documentation**: https://resend.com/docs
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **PostgreSQL on Render**: https://render.com/docs/databases

---

**Last Updated**: May 15, 2024
**Version**: 1.0
**Status**: Production Ready ✓
