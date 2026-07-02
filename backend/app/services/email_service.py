import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# Shared HTML shell
# ─────────────────────────────────────────────

def _html_shell(content: str, preview_text: str = "") -> str:
    preview = (
        f'<div style="display:none;max-height:0;overflow:hidden;color:#f1f5f9;">{preview_text}</div>'
        if preview_text else ""
    )
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>AgentFlow</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  {preview}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#4f46e5;border-radius:14px;padding:10px 18px;">
                    <span style="color:#ffffff;font-size:18px;font-weight:900;letter-spacing:-0.5px;">⚡ AgentFlow</span>
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
              <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">© 2025 AgentFlow — La marketplace d'agents IA</p>
              <p style="color:#cbd5e1;font-size:11px;margin:0;">Vous recevez cet email car vous avez créé un compte sur AgentFlow.</p>
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
      <a href="{href}" style="display:inline-block;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:-0.2px;">{label}</a>
    </td>
  </tr>
</table>"""


def _alert(text: str, color: str = "#4f46e5", bg: str = "#f8fafc") -> str:
    return f"""
<table cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="background:{bg};border-radius:12px;padding:16px 20px;border-left:3px solid {color};">
      <p style="color:#475569;font-size:13px;margin:0;line-height:1.6;">{text}</p>
    </td>
  </tr>
</table>"""


# ─────────────────────────────────────────────
# Transport (Resend API via httpx)
# ─────────────────────────────────────────────

async def send_email(to: str, subject: str, html: str) -> None:
    if not settings.RESEND_API_KEY:
        logger.warning("[EMAIL STUB] To=%s | Subject=%s | RESEND_API_KEY not set", to, subject)
        return

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": html,
            },
        )

    if resp.status_code >= 400:
        logger.error("[EMAIL ERROR] To=%s | status=%s | body=%s", to, resp.status_code, resp.text)
        resp.raise_for_status()

    logger.info("[EMAIL OK] To=%s | Subject=%s | id=%s", to, subject, resp.json().get("id"))


# ─────────────────────────────────────────────
# Verification email
# ─────────────────────────────────────────────

async def send_verification_email(to: str, verify_url: str, full_name: Optional[str] = None) -> None:
    name = full_name or "là"
    content = f"""
<h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 8px;">Confirmez votre adresse email 📬</h1>
<p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 4px;">Bonjour {name},</p>
<p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
  Bienvenue sur <strong>AgentFlow</strong> ! Votre compte est prêt.<br>
  Il ne reste qu'une étape : confirmer votre adresse email pour activer toutes les fonctionnalités.
</p>
{_btn(verify_url, "Confirmer mon email →")}
{_alert("Ce lien expire dans <strong>24 heures</strong>.<br>Si vous n'avez pas créé de compte AgentFlow, ignorez cet email.")}
<p style="color:#94a3b8;font-size:12px;margin:20px 0 0;line-height:1.6;">
  Vous ne pouvez pas cliquer sur le bouton ?<br>
  Copiez ce lien : <span style="color:#6366f1;word-break:break-all;">{verify_url}</span>
</p>"""
    await send_email(to, "Confirmez votre email — AgentFlow ⚡", _html_shell(content, "Activez votre compte AgentFlow en 1 clic"))


# ─────────────────────────────────────────────
# Reset password email
# ─────────────────────────────────────────────

async def send_reset_password_email(to: str, reset_url: str, full_name: Optional[str] = None) -> None:
    name = full_name or "là"
    content = f"""
<h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 8px;">Réinitialisation de mot de passe 🔑</h1>
<p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 4px;">Bonjour {name},</p>
<p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
  Vous avez demandé à réinitialiser votre mot de passe <strong>AgentFlow</strong>.<br>
  Cliquez ci-dessous pour en choisir un nouveau.
</p>
{_btn(reset_url, "Réinitialiser mon mot de passe →")}
{_alert("⏱ Ce lien expire dans <strong>1 heure</strong>.<br>Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe reste inchangé.", color="#ef4444", bg="#fef2f2")}
<p style="color:#94a3b8;font-size:12px;margin:20px 0 0;line-height:1.6;">
  Lien direct : <span style="color:#6366f1;word-break:break-all;">{reset_url}</span>
</p>"""
    await send_email(to, "Réinitialisation de mot de passe — AgentFlow", _html_shell(content, "Réinitialisez votre mot de passe AgentFlow"))


# ─────────────────────────────────────────────
# Team invitation email
# ─────────────────────────────────────────────

async def send_team_invitation_email(to: str, invite_url: str, team_name: str, inviter_name: Optional[str] = None) -> None:
    inviter = inviter_name or "Un membre AgentFlow"
    content = f"""
<h1 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 8px;">Vous êtes invité à rejoindre une équipe 🤝</h1>
<p style="color:#475569;font-size:15px;line-height:1.7;margin:0;">
  <strong>{inviter}</strong> vous invite à rejoindre l'équipe <strong style="color:#4f46e5;">{team_name}</strong> sur AgentFlow Enterprise.<br>
  En acceptant, vous accédez à tous les agents IA inclus dans le plan Enterprise.
</p>
{_btn(invite_url, "Rejoindre l'équipe →")}
{_alert("✅ En rejoignant l'équipe, vous bénéficiez de tous les agents Pro et Enterprise sans frais supplémentaires.", color="#22c55e", bg="#f0fdf4")}
<p style="color:#94a3b8;font-size:12px;margin:20px 0 0;line-height:1.6;">
  Ce lien expire dans <strong>48 heures</strong>.<br>
  Si vous ne souhaitez pas rejoindre cette équipe, ignorez cet email.
</p>"""
    await send_email(to, f"Invitation — rejoignez l'équipe {team_name} sur AgentFlow ⚡", _html_shell(content, f"Invitation à rejoindre l'équipe {team_name}"))
