"""
auth/email_service.py
OTP generation and email sending via SMTP.
Falls back to console logging when SMTP credentials are not configured.
"""

import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL    = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")


def generate_otp(length: int = 6) -> str:
    """Generate a random numeric OTP of the given length."""
    return "".join(str(random.randint(0, 9)) for _ in range(length))


def _build_otp_html(otp: str) -> str:
    """Build a styled HTML email body for the OTP."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#0a0a0a; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 20px;">
            <tr>
                <td align="center">
                    <table width="480" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)); border:1px solid rgba(255,255,255,0.1); border-radius:24px; overflow:hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="padding:40px 40px 20px; text-align:center;">
                                <div style="display:inline-block; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); border-radius:16px; padding:12px 16px; margin-bottom:20px;">
                                    <span style="color:#3b82f6; font-size:24px; font-weight:800;">⚡ Smart Vision</span>
                                </div>
                                <h1 style="color:#ffffff; font-size:22px; font-weight:800; margin:16px 0 8px; letter-spacing:-0.5px;">
                                    Email Verification
                                </h1>
                                <p style="color:#94a3b8; font-size:14px; margin:0; line-height:1.6;">
                                    Use the code below to verify your account
                                </p>
                            </td>
                        </tr>
                        <!-- OTP Code -->
                        <tr>
                            <td style="padding:10px 40px 30px; text-align:center;">
                                <div style="background:rgba(0,0,0,0.4); border:2px solid rgba(59,130,246,0.3); border-radius:16px; padding:24px; display:inline-block;">
                                    <span style="font-size:36px; font-weight:900; letter-spacing:12px; color:#e8ff47; font-family:'Courier New',monospace;">
                                        {otp}
                                    </span>
                                </div>
                                <p style="color:#64748b; font-size:12px; margin-top:16px; text-transform:uppercase; letter-spacing:2px; font-weight:600;">
                                    Expires in 5 minutes
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding:20px 40px 30px; text-align:center; border-top:1px solid rgba(255,255,255,0.05);">
                                <p style="color:#475569; font-size:11px; margin:0; line-height:1.6;">
                                    If you didn't request this code, please ignore this email.<br>
                                    &copy; Smart Vision — AI-Powered Assistive Technology
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def send_otp_email(to_email: str, otp: str) -> bool:
    """
    Send an OTP verification email.
    Returns True on success, False on failure.
    Falls back to console logging and local file if SMTP credentials are not configured.
    """
    # Write OTP to a local file for easy testing
    try:
        with open("latest_otp.txt", "w") as f:
            f.write(f"Email: {to_email}\nOTP: {otp}\n")
    except Exception:
        pass

    # Fallback: log to console if SMTP is not configured
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        print(f"[Email] Warning: SMTP not configured. OTP for {to_email}: {otp}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Smart Vision — Your Verification Code: {otp}"
        msg["From"]    = f"Smart Vision <{SMTP_EMAIL}>"
        msg["To"]      = to_email

        # Plain-text fallback
        plain = f"Your Smart Vision verification code is: {otp}\n\nThis code expires in 5 minutes."
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(_build_otp_html(otp), "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())

        print(f"[Email] Success: OTP sent to {to_email}")
        return True

    except Exception as e:
        print(f"[Email] Error: Failed to send OTP to {to_email}: {e}")
        # Still log the OTP to console so dev can proceed
        print(f"[Email] Fallback — OTP for {to_email}: {otp}")
        return False
