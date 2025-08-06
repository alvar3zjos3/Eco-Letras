import smtplib
import logging
from datetime import datetime
from email.message import EmailMessage
from .config import settings

# Configurar logging para emails
logger = logging.getLogger(__name__)

# Constantes de configuración de email
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
APP_NAME = "Eco Iglesia Letras"

def _create_base_html_template(title: str, content: str, button_html: str = "") -> str:
    """Crear plantilla HTML base para todos los emails"""
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.07);overflow:hidden;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:600;letter-spacing:-0.5px;">{APP_NAME}</h1>
            </div>
            
            <!-- Content -->
            <div style="padding:40px 32px;">
                <h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;line-height:1.3;">{title}</h2>
                {content}
                {button_html}
            </div>
            
            <!-- Footer -->
            <div style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                <p style="margin:0;color:#6b7280;font-size:14px;">
                    © 2025 {APP_NAME}. Todos los derechos reservados.
                </p>
                <p style="margin:8px 0 0 0;color:#9ca3af;font-size:12px;">
                    Este es un correo automático, por favor no responder.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

def _create_button(text: str, url: str, color: str = "#2563eb") -> str:
    """Crear botón HTML estilizado"""
    return f"""
    <div style="text-align:center;margin:32px 0;">
        <a href="{url}" style="display:inline-block;background:{color};color:#ffffff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;letter-spacing:0.5px;box-shadow:0 4px 6px rgba(0,0,0,0.1);transition:all 0.3s ease;">
            {text}
        </a>
    </div>
    """

def _send_email(msg: EmailMessage) -> bool:
    """Función helper para enviar emails con manejo de errores mejorado"""
    try:
        # Validar configuración de email
        if not all([settings.email_user, settings.email_pass, settings.email_from]):
            logger.error("Configuración de email incompleta. Revisa EMAIL_USER, EMAIL_PASS y EMAIL_FROM")
            return False
            
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(settings.email_user, settings.email_pass)
            smtp.send_message(msg)
            logger.info(f"Email enviado exitosamente a {msg['To']}")
            return True
            
    except smtplib.SMTPAuthenticationError:
        logger.error("Error de autenticación SMTP. Verifica EMAIL_USER y EMAIL_PASS")
        return False
    except smtplib.SMTPRecipientsRefused:
        logger.error(f"Email de destinatario rechazado: {msg['To']}")
        return False
    except Exception as e:
        logger.error(f"Error enviando email: {str(e)}")
        return False

def send_reset_email(email: str, token: str) -> bool:
    """Enviar email de recuperación de contraseña"""
    reset_link = f"{settings.frontend_url}/reset-password?token={token}"
    
    msg = EmailMessage()
    msg['Subject'] = "Recupera tu contraseña - Eco Iglesia Letras"
    msg['From'] = settings.email_from
    msg['To'] = email

    # Contenido en texto plano
    plain_content = (
        f"Has solicitado restablecer tu contraseña en {APP_NAME}.\n\n"
        f"Para continuar, visita el siguiente enlace:\n{reset_link}\n\n"
        f"Este enlace expirará en 30 minutos por seguridad.\n\n"
        f"Si no solicitaste este cambio, puedes ignorar este correo de forma segura.\n\n"
        f"Saludos,\nEquipo de {APP_NAME}"
    )
    
    # Contenido HTML
    html_content = f"""
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
            Has solicitado restablecer tu contraseña en <strong>{APP_NAME}</strong>.
        </p>
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px 0;">
            Para continuar con el proceso, haz clic en el botón de abajo:
        </p>
    """
    
    button_html = _create_button("Restablecer Contraseña", reset_link)
    
    html_content += f"""
        <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="color:#92400e;font-size:14px;margin:0;font-weight:500;">
                ⏰ Este enlace expirará en 30 minutos por tu seguridad.
            </p>
        </div>
        <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:24px 0 0 0;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no será modificada.
        </p>
    """
    
    msg.set_content(plain_content)
    msg.add_alternative(_create_base_html_template("Recupera tu contraseña", html_content, button_html), subtype='html')
    
    return _send_email(msg)

def send_password_changed_email(email: str) -> bool:
    """Enviar confirmación de cambio de contraseña"""
    msg = EmailMessage()
    msg['Subject'] = "Contraseña actualizada - Eco Iglesia Letras"
    msg['From'] = settings.email_from
    msg['To'] = email

    # Contenido en texto plano
    plain_content = (
        f"Tu contraseña ha sido actualizada correctamente en {APP_NAME}.\n\n"
        f"Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.\n\n"
        f"Por tu seguridad, te recomendamos:\n"
        f"• Usar contraseñas únicas y seguras\n"
        f"• No compartir tus credenciales\n"
        f"• Cerrar sesión en dispositivos compartidos\n\n"
        f"Saludos,\nEquipo de {APP_NAME}"
    )
    
    # Contenido HTML
    html_content = f"""
        <div style="background:#dcfce7;border:1px solid #16a34a;border-radius:8px;padding:20px;margin:0 0 24px 0;text-align:center;">
            <div style="color:#16a34a;font-size:48px;margin:0 0 12px 0;">✓</div>
            <p style="color:#15803d;font-size:18px;font-weight:600;margin:0;">
                Tu contraseña ha sido actualizada correctamente
            </p>
        </div>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
            Tu contraseña en <strong>{APP_NAME}</strong> ha sido cambiada exitosamente.
        </p>
        
        <div style="background:#fee2e2;border:1px solid #ef4444;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="color:#dc2626;font-size:14px;margin:0 0 8px 0;font-weight:600;">
                ⚠️ ¿No fuiste tú?
            </p>
            <p style="color:#dc2626;font-size:14px;margin:0;">
                Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.
            </p>
        </div>
        
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:24px 0;">
            <h3 style="color:#1f2937;font-size:16px;margin:0 0 12px 0;">Recomendaciones de seguridad:</h3>
            <ul style="color:#374151;font-size:14px;margin:0;padding-left:20px;">
                <li style="margin:8px 0;">Usa contraseñas únicas y seguras</li>
                <li style="margin:8px 0;">No compartir tus credenciales</li>
                <li style="margin:8px 0;">Cerrar sesión en dispositivos compartidos</li>
            </ul>
        </div>
    """
    
    msg.set_content(plain_content)
    msg.add_alternative(_create_base_html_template("Contraseña actualizada", html_content), subtype='html')
    
    return _send_email(msg)

def send_verification_email(email: str, token: str) -> bool:
    """Enviar email de verificación de cuenta"""
    verify_link = f"{settings.frontend_url}/verify-email?token={token}"
    
    msg = EmailMessage()
    msg['Subject'] = "Verifica tu correo - Eco Iglesia Letras"
    msg['From'] = settings.email_from
    msg['To'] = email

    # Contenido en texto plano
    plain_content = (
        f"¡Bienvenido a {APP_NAME}!\n\n"
        f"Gracias por registrarte. Para completar tu registro y activar tu cuenta, "
        f"necesitas verificar tu dirección de correo electrónico.\n\n"
        f"Visita el siguiente enlace para verificar tu cuenta:\n{verify_link}\n\n"
        f"Este enlace expirará en 24 horas.\n\n"
        f"Si no creaste esta cuenta, puedes ignorar este correo de forma segura.\n\n"
        f"Saludos,\nEquipo de {APP_NAME}"
    )
    
    # Contenido HTML
    html_content = f"""
        <div style="text-align:center;margin:0 0 32px 0;">
            <div style="color:#2563eb;font-size:64px;margin:0 0 16px 0;">🎉</div>
            <h3 style="color:#1f2937;font-size:20px;margin:0;font-weight:600;">
                ¡Bienvenido a {APP_NAME}!
            </h3>
        </div>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
            Gracias por registrarte. Para completar tu registro y comenzar a disfrutar de todas las funcionalidades, 
            necesitas verificar tu dirección de correo electrónico.
        </p>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px 0;">
            Haz clic en el botón de abajo para activar tu cuenta:
        </p>
    """
    
    button_html = _create_button("Verificar mi cuenta", verify_link, "#16a34a")
    
    html_content += f"""
        <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="color:#92400e;font-size:14px;margin:0;font-weight:500;">
                ⏰ Este enlace expirará en 24 horas.
            </p>
        </div>
        
        <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:24px 0 0 0;">
            Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
        </p>
    """
    
    msg.set_content(plain_content)
    msg.add_alternative(_create_base_html_template("Verifica tu correo", html_content, button_html), subtype='html')
    
    return _send_email(msg)

def send_email_change_confirmation(email: str, token: str) -> bool:
    """Enviar confirmación de cambio de email"""
    confirm_link = f"{settings.frontend_url}/confirm-email-change?token={token}"

    msg = EmailMessage()
    msg['Subject'] = "Confirma tu nuevo correo electrónico - Eco Iglesia Letras"
    msg['From'] = settings.email_from
    msg['To'] = email

    # Contenido en texto plano
    plain_content = (
        f"Has solicitado cambiar tu correo electrónico en {APP_NAME}.\n\n"
        f"Para confirmar tu nueva dirección de correo, visita el siguiente enlace:\n{confirm_link}\n\n"
        f"Este enlace expirará en 24 horas por seguridad.\n\n"
        f"Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.\n\n"
        f"Saludos,\nEquipo de {APP_NAME}"
    )
    
    # Contenido HTML
    html_content = f"""
        <div style="text-align:center;margin:0 0 32px 0;">
            <div style="color:#2563eb;font-size:48px;margin:0 0 16px 0;">📧</div>
        </div>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
            Has solicitado cambiar tu correo electrónico en <strong>{APP_NAME}</strong>.
        </p>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px 0;">
            Para confirmar tu nueva dirección de correo y completar el cambio, haz clic en el botón de abajo:
        </p>
    """
    
    button_html = _create_button("Confirmar nuevo correo", confirm_link, "#7c3aed")
    
    html_content += f"""
        <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="color:#92400e;font-size:14px;margin:0;font-weight:500;">
                ⏰ Este enlace expirará en 24 horas por tu seguridad.
            </p>
        </div>
        
        <div style="background:#f0f9ff;border:1px solid #0ea5e9;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="color:#0c4a6e;font-size:14px;margin:0 0 8px 0;font-weight:600;">
                ℹ️ Información importante
            </p>
            <p style="color:#0c4a6e;font-size:14px;margin:0;">
                Una vez confirmado, este será tu nuevo correo para iniciar sesión y recibir notificaciones.
            </p>
        </div>
        
        <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:24px 0 0 0;">
            Si no realizaste esta solicitud, puedes ignorar este correo de forma segura. Tu correo actual no será modificado.
        </p>
    """
    
    msg.set_content(plain_content)
    msg.add_alternative(_create_base_html_template("Confirma tu nuevo correo electrónico", html_content, button_html), subtype='html')
    
    return _send_email(msg)

def send_email_change_alert(old_email: str, new_email: str) -> bool:
    """Enviar alerta de cambio de correo al email anterior"""
    msg = EmailMessage()
    msg['Subject'] = "Alerta de cambio de correo - Eco Iglesia Letras"
    msg['From'] = settings.email_from
    msg['To'] = old_email

    # Contenido en texto plano
    plain_content = (
        f"Tu correo electrónico en {APP_NAME} ha sido cambiado.\n\n"
        f"Detalles del cambio:\n"
        f"• Correo anterior: {old_email}\n"
        f"• Correo nuevo: {new_email}\n"
        f"• Fecha: {datetime.now().strftime('%d/%m/%Y a las %H:%M')}\n\n"
        f"Si NO realizaste este cambio:\n"
        f"• Contacta inmediatamente a nuestro equipo de soporte\n"
        f"• Tu cuenta podría estar comprometida\n\n"
        f"Si SÍ realizaste este cambio:\n"
        f"• Este correo es solo informativo\n"
        f"• No necesitas hacer nada más\n\n"
        f"Saludos,\nEquipo de Seguridad de {APP_NAME}"
    )
    
    # Contenido HTML
    html_content = f"""
        <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:20px;margin:0 0 24px 0;text-align:center;">
            <div style="color:#ef4444;font-size:48px;margin:0 0 12px 0;">⚠️</div>
            <p style="color:#dc2626;font-size:18px;font-weight:600;margin:0;">
                Cambio de correo electrónico detectado
            </p>
        </div>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
            Tu correo electrónico en <strong>{APP_NAME}</strong> ha sido cambiado exitosamente.
        </p>
        
        <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:24px 0;">
            <h3 style="color:#1f2937;font-size:16px;margin:0 0 16px 0;">Detalles del cambio:</h3>
            <div style="color:#374151;font-size:14px;">
                <p style="margin:8px 0;"><strong>Correo anterior:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">{old_email}</code></p>
                <p style="margin:8px 0;"><strong>Correo nuevo:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">{new_email}</code></p>
                <p style="margin:8px 0;"><strong>Fecha:</strong> {datetime.now().strftime('%d/%m/%Y a las %H:%M')}</p>
            </div>
        </div>
        
        <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:16px;margin:24px 0;">
            <h4 style="color:#dc2626;font-size:16px;margin:0 0 12px 0;">🚨 ¿No fuiste tú?</h4>
            <p style="color:#dc2626;font-size:14px;margin:0 0 8px 0;">
                Si NO realizaste este cambio, tu cuenta podría estar comprometida.
            </p>
            <p style="color:#dc2626;font-size:14px;margin:0;font-weight:600;">
                Contacta inmediatamente a nuestro equipo de soporte.
            </p>
        </div>
        
        <div style="background:#f0fdf4;border:1px solid #16a34a;border-radius:8px;padding:16px;margin:24px 0;">
            <h4 style="color:#15803d;font-size:16px;margin:0 0 12px 0;">✅ ¿Sí fuiste tú?</h4>
            <p style="color:#15803d;font-size:14px;margin:0;">
                Este correo es solo informativo. No necesitas hacer nada más.
            </p>
        </div>
        
        <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:24px 0 0 0;">
            Este es un correo de seguridad automático para informarte sobre cambios importantes en tu cuenta.
        </p>
    """
    
    msg.set_content(plain_content)
    msg.add_alternative(_create_base_html_template("Alerta de cambio de correo", html_content), subtype='html')
    
    return _send_email(msg)

def send_account_deletion_confirmation(email: str, token: str) -> bool:
    """Enviar confirmación de eliminación de cuenta"""
    confirm_link = f"{settings.frontend_url}/confirm-account-deletion?token={token}"

    msg = EmailMessage()
    msg['Subject'] = "Confirma la eliminación de tu cuenta - Eco Iglesia Letras"
    msg['From'] = settings.email_from
    msg['To'] = email

    # Contenido en texto plano
    plain_content = (
        f"Has solicitado eliminar tu cuenta en {APP_NAME}.\n\n"
        f"⚠️ IMPORTANTE: Tu cuenta será eliminada permanentemente en 24 horas.\n\n"
        f"Si realmente deseas eliminar tu cuenta, confirma haciendo clic en el siguiente enlace:\n{confirm_link}\n\n"
        f"Si cambias de opinión, simplemente inicia sesión antes de las 24 horas para cancelar la eliminación.\n\n"
        f"Una vez eliminada, no podremos recuperar tu cuenta, favoritos, playlists ni ningún dato asociado.\n\n"
        f"Si no solicitaste esto, inicia sesión inmediatamente para cancelar la eliminación.\n\n"
        f"Equipo de {APP_NAME}"
    )
    
    # Contenido HTML
    html_content = f"""
        <div style="text-align:center;margin:0 0 32px 0;">
            <div style="color:#ef4444;font-size:48px;margin:0 0 16px 0;">⚠️</div>
        </div>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
            Has solicitado eliminar permanentemente tu cuenta en <strong>{APP_NAME}</strong>.
        </p>
        
        <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:20px;margin:24px 0;">
            <h3 style="color:#dc2626;font-size:18px;margin:0 0 12px 0;font-weight:600;">
                🕒 Tu cuenta será eliminada en 24 horas
            </h3>
            <p style="color:#7f1d1d;font-size:14px;margin:0 0 8px 0;">
                • Se eliminarán todos tus datos permanentemente
            </p>
            <p style="color:#7f1d1d;font-size:14px;margin:0 0 8px 0;">
                • Perderás todas tus canciones favoritas y playlists
            </p>
            <p style="color:#7f1d1d;font-size:14px;margin:0;">
                • Esta acción NO se puede deshacer
            </p>
        </div>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px 0;">
            Si estás seguro de que quieres proceder, confirma la eliminación:
        </p>
    """
    
    button_html = _create_button("Confirmar eliminación de cuenta", confirm_link, "#dc2626")
    
    html_content += f"""
        <div style="background:#f0fdf4;border:1px solid #22c55e;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="color:#15803d;font-size:14px;margin:0 0 8px 0;font-weight:600;">
                💡 ¿Cambiaste de opinión?
            </p>
            <p style="color:#15803d;font-size:14px;margin:0;">
                Simplemente inicia sesión en tu cuenta antes de 24 horas para cancelar automáticamente la eliminación.
            </p>
        </div>
        
        <p style="color:#6b7280;font-size:14px;line-height:1.5;margin:24px 0 0 0;">
            Si no solicitaste esto, <strong>inicia sesión inmediatamente</strong> para cancelar la eliminación.
        </p>
    """
    
    msg.set_content(plain_content)
    msg.add_alternative(_create_base_html_template("Confirma la eliminación de tu cuenta", html_content, button_html), subtype='html')
    
    return _send_email(msg)

def send_account_deletion_cancelled(email: str) -> bool:
    """Enviar notificación de cancelación de eliminación de cuenta"""
    msg = EmailMessage()
    msg['Subject'] = "Eliminación de cuenta cancelada - Eco Iglesia Letras"
    msg['From'] = settings.email_from
    msg['To'] = email

    # Contenido en texto plano
    plain_content = (
        f"¡Buenas noticias! La eliminación de tu cuenta en {APP_NAME} ha sido cancelada.\n\n"
        f"Tu cuenta está completamente segura y puedes seguir disfrutando de nuestros servicios.\n\n"
        f"Si no iniciaste sesión recientemente, te recomendamos cambiar tu contraseña por seguridad.\n\n"
        f"Gracias por quedarte con nosotros.\n\n"
        f"Equipo de {APP_NAME}"
    )
    
    # Contenido HTML
    html_content = f"""
        <div style="text-align:center;margin:0 0 32px 0;">
            <div style="color:#22c55e;font-size:48px;margin:0 0 16px 0;">✅</div>
        </div>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
            ¡Buenas noticias! La eliminación de tu cuenta en <strong>{APP_NAME}</strong> ha sido <strong>cancelada</strong>.
        </p>
        
        <div style="background:#f0fdf4;border:1px solid #22c55e;border-radius:8px;padding:20px;margin:24px 0;">
            <h3 style="color:#15803d;font-size:18px;margin:0 0 12px 0;font-weight:600;">
                🎉 Tu cuenta está segura
            </h3>
            <p style="color:#15803d;font-size:14px;margin:0;">
                Puedes seguir disfrutando de todas las funcionalidades de la plataforma sin ningún problema.
            </p>
        </div>
        
        <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="color:#92400e;font-size:14px;margin:0 0 8px 0;font-weight:600;">
                🔐 Recomendación de seguridad
            </p>
            <p style="color:#92400e;font-size:14px;margin:0;">
                Si no fuiste tú quien canceló la eliminación, te sugerimos cambiar tu contraseña inmediatamente.
            </p>
        </div>
        
        <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 16px 0;">
            Gracias por quedarte con nosotros. ¡Seguimos haciendo música juntos! 🎵
        </p>
    """
    
    msg.set_content(plain_content)
    msg.add_alternative(_create_base_html_template("Eliminación cancelada", html_content), subtype='html')
    
    return _send_email(msg)