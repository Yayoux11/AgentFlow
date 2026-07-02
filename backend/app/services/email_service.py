import smtplib
import ssl
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
import asyncio
from functools import partial

from app.config import settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Shared HTML shell
# ─────────────────────────────────────────────

def _html_shell(content: str, preview_text: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgentFlow</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  {f'<div style="display:none;max-height:0;overflow:hidden;color:#f1f5f9;">{preview_text}</div>' if preview_text else ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#4f46e5;border-radius:14px;padding:10px 18px;">
                    <span style="color:#ffffff;font-size:18px;font-weight:900;letter-spacing:-0.5px;">
                      ⚡ AgentFlow
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;padding:40px 40px 32px;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
              {content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 0;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">
                © 2025 AgentFlow — La marketplace d'agents IA
              </p>
              <p style="color:#cbd5e1;font-size:11px;margin:0;">
                Vous recevez cet email car vous avez créé un compte sur AgentFlow.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _btn(href: str, label: str) -> str:
    return f"""
    <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="background:#4f46e5;border-radius:12px;">
          <a href="{href}"
             style="display:inline-block;color:#ffffff;font-size:15px;font-weight:700;
                    text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:-0.2px;">
            {label}
          </a>
        </td>
      </tr>
    </table>"""


def _divider() -> str:
    return '<tr><td><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"></td></tr>'


# ─────────────────────────────────────────────
# Transport
# ─────────────────────────────────────────────

def _send_sync(to: str, subject: str, html: str) -> None:
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("[EMAIL STUB] To=%s | Subject=%s | (SMTP not configured)", to, subject)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM or f"AgentFlow <{settings.SMTP_USER}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    context = ssl.create_default_context()
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to, msg.as_string())
        logger.info("[EMAIL OK] To=%s | Subject=%s", to, subject)
    except Exception as exc:
        logger.error("[EMAIL ERROR] To=%s | %s", to, exc)
        raise


async def send_email(to: str, subject: str, html: str) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, partial(_send_sync, to, subject, html))


# ─────────────────────────────────────────────
# Verification email
# ─────────────────────────────────────────────

async def send_verification_email(to: str, verify_url: str, full_name: Optional[str] = None) -> None:
    name = full_name or "là"
    content = f"""
      <h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 8px;">
        Confirmez votre adresse email 📬
      </h1>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 4px;">
        Bonjour {name},
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
        Bienvenue sur <strong>AgentFlow</strong> ! Votre compte est prêt.
        Il ne reste qu'une étape : confirmer votre adresse email pour activer toutes les fonctionnalités.
      </p>

      {_btn(verify_url, "Confirmer mon email →")}

      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="background:#f8fafc;border-radius:12px;padding:16px 20px;border-left:3px solid #4f46e5;">
            <p style="color:#64748b;font-size:13px;margin:0;line-height:1.6;">
              Ce lien expire dans <strong>24 heures</strong>.<br>
              Si vous n'avez pas créé de compte AgentFlow, vous pouvez ignorer cet email.
            </p>
          </td>
        </tr>
      </table>

      <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;line-height:1.6;">
        Vous ne pouvez pas cliquer sur le bouton ?<br>
        Copiez ce lien dans votre navigateur :<br>
        <span style="color:#6366f1;word-break:break-all;">{verify_url}</span>
      </p>
    """
    html = _html_shell(content, "Activez votre compte AgentFlow en 1 clic")
    await send_email(to, "Confirmez votre email — AgentFlow ⚡", html)


# ─────────────────────────────────────────────
# Reset password email
# ─────────────────────────────────────────────

async def send_reset_password_email(to: str, reset_url: str, full_name: Optional[str] = None) -> None:
    name = full_name or "là"
    content = f"""
      <h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 8px;">
        Réinitialisation de mot de passe 🔑
      </h1>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 4px;">
        Bonjour {name},
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
        Vous avez demandé à réinitialiser votre mot de passe <strong>AgentFlow</strong>.
        Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
      </p>

      {_btn(reset_url, "Réinitialiser mon mot de passe →")}

      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="background:#fef2f2;border-radius:12px;padding:16px 20px;border-left:3px solid #ef4444;">
            <p style="color:#b91c1c;font-size:13px;margin:0;line-height:1.6;">
              ⏱ Ce lien expire dans <strong>1 heure</strong>.<br>
              Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe reste inchangé.
            </p>
          </td>
        </tr>
      </table>

      <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;line-height:1.6;">
        Lien direct :<br>
        <span style="color:#6366f1;word-break:break-all;">{reset_url}</span>
      </p>
    """
    html = _html_shell(content, "Réinitialisez votre mot de passe AgentFlow")
    await send_email(to, "Réinitialisation de mot de passe — AgentFlow", html)


# ─────────────────────────────────────────────
# Team invitation email
# ─────────────────────────────────────────────

async def send_team_invitation_email(to: str, invite_url: str, team_name: str, inviter_name: Optional[str] = None) -> None:
    inviter = inviter_name or "Un membre AgentFlow"
    content = f"""
      <h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 8px;">
        Vous êtes invité à rejoindre une équipe 🤝
      </h1>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
        <strong>{inviter}</strong> vous invite à rejoindre l'équipe
        <strong style="color:#4f46e5;">{team_name}</strong> sur AgentFlow Enterprise.
        En acceptant, vous accédez à tous les agents IA inclus dans le plan Enterprise.
      </p>

      {_btn(invite_url, "Rejoindre l'équipe →")}

      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="background:#f0fdf4;border-radius:12px;padding:16px 20px;border-left:3px solid #22c55e;">
            <p style="color:#15803d;font-size:13px;margin:0;line-height:1.6;">
              ✅ En rejoignant l'équipe, vous bénéficiez de tous les agents Pro et Enterprise sans frais supplémentaires.
            </p>
          </td>
        </tr>
      </table>

      <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;line-height:1.6;">
        Ce lien expire dans <strong>48 heures</strong>.<br>
        Si vous ne souhaitez pas rejoindre cette équipe, ignorez simplement cet email.
      </p>
    """
    html = _html_shell(content, f"Invitation à rejoindre l'équipe {team_name}")
    await send_email(to, f"Invitation — rejoignez l'équipe {team_name} sur AgentFlow ⚡", html)
