"""Email service for sending transactional emails."""

import logging
from typing import Optional

try:
    from resend import Resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False

from config.settings import settings

log = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via Resend."""

    def __init__(self):
        self.resend = Resend(api_key=settings.RESEND_API_KEY) if RESEND_AVAILABLE else None

    def send_password_reset_email(self, email: str, reset_url: str, full_name: Optional[str] = None) -> bool:
        """Send password reset email."""
        if not self.resend:
            log.warning("Resend not configured, skipping email")
            return False

        try:
            self.resend.emails.send(
                {
                    "from": f"{settings.APP_NAME} <noreply@resend.dev>",
                    "to": email,
                    "subject": f"Reset your {settings.APP_NAME} password",
                    "html": self._render_password_reset_email(reset_url, full_name),
                }
            )
            log.info(f"Password reset email sent to {email}")
            return True
        except Exception as e:
            log.error(f"Failed to send password reset email: {str(e)}")
            return False

    def send_verification_email(self, email: str, verification_url: str, full_name: Optional[str] = None) -> bool:
        """Send email verification link."""
        if not self.resend:
            log.warning("Resend not configured, skipping email")
            return False

        try:
            self.resend.emails.send(
                {
                    "from": f"{settings.APP_NAME} <noreply@resend.dev>",
                    "to": email,
                    "subject": f"Verify your {settings.APP_NAME} email",
                    "html": self._render_verification_email(verification_url, full_name),
                }
            )
            log.info(f"Verification email sent to {email}")
            return True
        except Exception as e:
            log.error(f"Failed to send verification email: {str(e)}")
            return False

    def send_recruiter_approval_email(self, email: str, status: str, full_name: Optional[str] = None) -> bool:
        """Send recruiter approval/rejection email."""
        if not self.resend:
            log.warning("Resend not configured, skipping email")
            return False

        try:
            is_approved = status.lower() == "approved"
            subject = f"Your {settings.APP_NAME} recruiter account has been approved!" if is_approved else f"Your {settings.APP_NAME} recruiter account application"
            
            self.resend.emails.send(
                {
                    "from": f"{settings.APP_NAME} <noreply@resend.dev>",
                    "to": email,
                    "subject": subject,
                    "html": self._render_recruiter_approval_email(status, full_name),
                }
            )
            log.info(f"Recruiter approval email sent to {email}")
            return True
        except Exception as e:
            log.error(f"Failed to send recruiter approval email: {str(e)}")
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
