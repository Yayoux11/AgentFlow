import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
import asyncio
from functools import partial

from app.config import settings


def _send_sync(to: str, subject: str, html: str) -> None:
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EMAIL STUB] To: {to} | Subject: {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    context = ssl.create_default_context()
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.ehlo()
        server.starttls(context=context)
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to, msg.as_string())


async def send_email(to: str, subject: str, html: str) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, partial(_send_sync, to, subject, html))


async def send_verification_email(to: str, verify_url: str, full_name: Optional[str] = None) -> None:
    name = full_name or "utilisateur"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="background: #4f46e5; color: white; padding: 10px 16px; border-radius: 12px;
                     font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">⚡ AgentFlow</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
        Confirmez votre adresse email
      </h1>
      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Bonjour {name},<br><br>
        Bienvenue sur AgentFlow ! Cliquez sur le bouton ci-dessous pour activer votre compte.
      </p>
      <a href="{verify_url}"
         style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px;
                border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none;
                margin-bottom: 24px;">
        Confirmer mon email →
      </a>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
        Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas créé de compte AgentFlow,
        ignorez cet email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="color: #cbd5e1; font-size: 11px; text-align: center;">
        © AgentFlow — La marketplace d'agents IA
      </p>
    </div>
    """
    await send_email(to, "Confirmez votre adresse email — AgentFlow", html)


async def send_reset_password_email(to: str, reset_url: str, full_name: Optional[str] = None) -> None:
    name = full_name or "utilisateur"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="background: #4f46e5; color: white; padding: 10px 16px; border-radius: 12px;
                     font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">⚡ AgentFlow</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
        Réinitialisation de votre mot de passe
      </h1>
      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Bonjour {name},<br><br>
        Vous avez demandé à réinitialiser votre mot de passe AgentFlow.
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
      </p>
      <a href="{reset_url}"
         style="display: inline-block; background: #4f46e5; color: white; padding: 14px 28px;
                border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none;
                margin-bottom: 24px;">
        Réinitialiser mon mot de passe →
      </a>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6;">
        Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande,
        ignorez cet email — votre mot de passe reste inchangé.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="color: #cbd5e1; font-size: 11px; text-align: center;">
        © AgentFlow — La marketplace d'agents IA
      </p>
    </div>
    """
    await send_email(to, "Réinitialisation de votre mot de passe AgentFlow", html)
