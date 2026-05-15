"""Email service for sending transactional emails via Resend API."""

import logging
from typing import Optional
from datetime import datetime, timezone

try:
    from resend import Resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False
    Resend = None

from config.settings import settings

log = logging.getLogger(__name__)


class EmailService:
    """
    Service for sending transactional emails via Resend API.
    
    Resend is a professional email service that handles DKIM, SPF, and bounce tracking.
    API Key is loaded from environment variable RESEND_API_KEY.
    """

    def __init__(self):
        """Initialize Resend client with API key from settings."""
        log.info("=" * 80)
        log.info("INITIALIZING EMAIL SERVICE")
        log.info("=" * 80)
        
        if not RESEND_AVAILABLE:
            log.warning("⚠️  Resend library not installed. Install with: pip install resend")
            self.resend = None
            return

        api_key_set = bool(settings.RESEND_API_KEY)
        api_key_preview = f"{settings.RESEND_API_KEY[:8]}...{settings.RESEND_API_KEY[-4:]}" if settings.RESEND_API_KEY else "NOT SET"
        
        log.info(f"📋 RESEND_API_KEY configured: {api_key_set}")
        log.info(f"📋 RESEND_API_KEY preview: {api_key_preview}")
        log.info(f"📋 Environment: {settings.ENV}")
        log.info(f"📋 App Name: {settings.APP_NAME}")
        log.info(f"📋 Frontend URL: {settings.FRONTEND_URL}")
        
        if not settings.RESEND_API_KEY:
            log.warning(
                "⚠️  RESEND_API_KEY not configured in environment. "
                "Emails will not be sent. Set RESEND_API_KEY in .env file or environment variables."
            )
            self.resend = None
            return

        try:
            # Initialize Resend client with API key from environment
            self.resend = Resend(api_key=settings.RESEND_API_KEY)
            log.info("✓ Resend email service initialized successfully")
            log.info("=" * 80)
        except Exception as e:
            log.error(f"❌ Failed to initialize Resend client: {str(e)}")
            log.error(f"Exception type: {type(e).__name__}")
            self.resend = None
            log.info("=" * 80)

    def send_password_reset_email(self, email: str, reset_url: str, full_name: Optional[str] = None) -> bool:
        """
        Send password reset email to user.
        
        Args:
            email: User's email address
            reset_url: Password reset link (includes token)
            full_name: User's full name (optional)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.resend:
            log.warning(
                f"⚠️  Email service not configured. Cannot send password reset email to {email}. "
                f"Password reset link: {reset_url}"
            )
            return False

        try:
            log.info("-" * 80)
            log.info(f"📧 SENDING PASSWORD RESET EMAIL")
            log.info(f"   Recipient: {email}")
            log.info(f"   Full Name: {full_name or 'Not provided'}")
            log.info(f"   Reset URL: {reset_url}")
            log.info(f"   Sender: {settings.APP_NAME} <onboarding@resend.dev>")
            
            response = self.resend.emails.send(
                {
                    "from": f"{settings.APP_NAME} <onboarding@resend.dev>",
                    "to": email,
                    "subject": f"Reset your {settings.APP_NAME} password",
                    "html": self._render_password_reset_email(reset_url, full_name),
                }
            )
            
            log.info(f"   API Response: {response}")
            
            if isinstance(response, dict) and response.get("id"):
                message_id = response.get("id")
                log.info(f"✓ PASSWORD RESET EMAIL SENT SUCCESSFULLY")
                log.info(f"   Message ID: {message_id}")
                log.info(f"   Recipient: {email}")
                log.info(f"   Timestamp: {datetime.now(timezone.utc).isoformat()}")
                log.info("-" * 80)
                return True
            else:
                log.error(f"✗ FAILED TO SEND PASSWORD RESET EMAIL")
                log.error(f"   Recipient: {email}")
                log.error(f"   API Response: {response}")
                log.error(f"   Response Type: {type(response).__name__}")
                log.info("-" * 80)
                return False
                
        except Exception as e:
            log.error(f"✗ EXCEPTION SENDING PASSWORD RESET EMAIL")
            log.error(f"   Recipient: {email}")
            log.error(f"   Exception: {str(e)}")
            log.error(f"   Exception Type: {type(e).__name__}")
            log.exception("Full traceback:")
            log.info("-" * 80)
            return False

    def send_verification_email(self, email: str, verification_url: str, full_name: Optional[str] = None) -> bool:
        """
        Send email verification link to user.
        
        Args:
            email: User's email address
            verification_url: Email verification link (includes token)
            full_name: User's full name (optional)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.resend:
            log.warning(
                f"⚠️  Email service not configured. Cannot send verification email to {email}. "
                f"Verification link: {verification_url}"
            )
            return False

        try:
            log.info("-" * 80)
            log.info(f"📧 SENDING EMAIL VERIFICATION")
            log.info(f"   Recipient: {email}")
            log.info(f"   Full Name: {full_name or 'Not provided'}")
            log.info(f"   Verification URL: {verification_url}")
            log.info(f"   Sender: {settings.APP_NAME} <onboarding@resend.dev>")
            
            response = self.resend.emails.send(
                {
                    "from": f"{settings.APP_NAME} <onboarding@resend.dev>",
                    "to": email,
                    "subject": f"Verify your {settings.APP_NAME} email address",
                    "html": self._render_verification_email(verification_url, full_name),
                }
            )
            
            log.info(f"   API Response: {response}")
            
            if isinstance(response, dict) and response.get("id"):
                message_id = response.get("id")
                log.info(f"✓ EMAIL VERIFICATION SENT SUCCESSFULLY")
                log.info(f"   Message ID: {message_id}")
                log.info(f"   Recipient: {email}")
                log.info(f"   Timestamp: {datetime.now(timezone.utc).isoformat()}")
                log.info("-" * 80)
                return True
            else:
                log.error(f"✗ FAILED TO SEND EMAIL VERIFICATION")
                log.error(f"   Recipient: {email}")
                log.error(f"   API Response: {response}")
                log.error(f"   Response Type: {type(response).__name__}")
                log.info("-" * 80)
                return False
                
        except Exception as e:
            log.error(f"✗ EXCEPTION SENDING EMAIL VERIFICATION")
            log.error(f"   Recipient: {email}")
            log.error(f"   Exception: {str(e)}")
            log.error(f"   Exception Type: {type(e).__name__}")
            log.exception("Full traceback:")
            log.info("-" * 80)
            return False

    def send_recruiter_approval_email(self, email: str, status: str, full_name: Optional[str] = None) -> bool:
        """
        Send recruiter approval/rejection email.
        
        Args:
            email: Recruiter's email address
            status: "approved" or "rejected"
            full_name: Recruiter's full name (optional)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.resend:
            log.warning(f"⚠️  Email service not configured. Recruiter {status} email for {email} not sent.")
            return False

        try:
            is_approved = status.lower() == "approved"
            subject = (
                f"Your {settings.APP_NAME} recruiter account is now active! 🎉"
                if is_approved
                else f"Update on your {settings.APP_NAME} recruiter application"
            )
            
            log.info("-" * 80)
            log.info(f"📧 SENDING RECRUITER {status.upper()} EMAIL")
            log.info(f"   Recipient: {email}")
            log.info(f"   Full Name: {full_name or 'Not provided'}")
            log.info(f"   Status: {status}")
            log.info(f"   Sender: {settings.APP_NAME} <onboarding@resend.dev>")
            
            response = self.resend.emails.send(
                {
                    "from": f"{settings.APP_NAME} <onboarding@resend.dev>",
                    "to": email,
                    "subject": subject,
                    "html": self._render_recruiter_approval_email(status, full_name),
                }
            )
            
            log.info(f"   API Response: {response}")
            
            if isinstance(response, dict) and response.get("id"):
                message_id = response.get("id")
                log.info(f"✓ RECRUITER {status.upper()} EMAIL SENT SUCCESSFULLY")
                log.info(f"   Message ID: {message_id}")
                log.info(f"   Recipient: {email}")
                log.info(f"   Timestamp: {datetime.now(timezone.utc).isoformat()}")
                log.info("-" * 80)
                return True
            else:
                log.error(f"✗ FAILED TO SEND RECRUITER {status.upper()} EMAIL")
                log.error(f"   Recipient: {email}")
                log.error(f"   API Response: {response}")
                log.error(f"   Response Type: {type(response).__name__}")
                log.info("-" * 80)
                return False
                
        except Exception as e:
            log.error(f"✗ EXCEPTION SENDING RECRUITER {status.upper()} EMAIL")
            log.error(f"   Recipient: {email}")
            log.error(f"   Exception: {str(e)}")
            log.error(f"   Exception Type: {type(e).__name__}")
            log.exception("Full traceback:")
            log.info("-" * 80)
            return False

    @staticmethod
    def _render_password_reset_email(reset_url: str, full_name: Optional[str] = None) -> str:
        """Render password reset email HTML."""
        name = full_name or "User"
        return f"""
        <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Hi {name},</h2>
                    <p>We received a request to reset your password. Click the link below to create a new password:</p>
                    <p>
                        <a href="{reset_url}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Reset Password
                        </a>
                    </p>
                    <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
                    <p style="color: #666; font-size: 14px;">Or copy this URL: <a href="{reset_url}">{reset_url}</a></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                </div>
            </body>
        </html>
        """

    @staticmethod
    def _render_verification_email(verification_url: str, full_name: Optional[str] = None) -> str:
        """Render email verification HTML."""
        name = full_name or "User"
        return f"""
        <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Welcome to CampusConnect, {name}!</h2>
                    <p>Please verify your email address to complete your registration:</p>
                    <p>
                        <a href="{verification_url}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Verify Email
                        </a>
                    </p>
                    <p style="color: #666; font-size: 14px;">This link expires in 48 hours.</p>
                    <p style="color: #666; font-size: 14px;">Or copy this URL: <a href="{verification_url}">{verification_url}</a></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
                </div>
            </body>
        </html>
        """

    @staticmethod
    def _render_recruiter_approval_email(status: str, full_name: Optional[str] = None) -> str:
        """Render recruiter approval/rejection email HTML."""
        name = full_name or "Recruiter"
        is_approved = status.lower() == "approved"
        
        if is_approved:
            message = "Your recruiter account has been approved! You can now start posting job openings and managing applicants."
            button_text = "Go to Dashboard"
            button_url = f"{settings.FRONTEND_URL}/recruiter/dashboard"
        else:
            message = "Thank you for your interest in CampusConnect. Your application is under review and we'll get back to you shortly."
            button_text = "Learn More"
            button_url = settings.FRONTEND_URL
        
        return f"""
        <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Hi {name},</h2>
                    <p>{message}</p>
                    <p>
                        <a href="{button_url}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            {button_text}
                        </a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px;">Questions? Contact us at support@campusconnect.com</p>
                </div>
            </body>
        </html>
        """


email_service = EmailService()
