from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from email.message import EmailMessage
import logging
import smtplib
from ..core.database import get_db
from ..core.config import settings
from ..models.user import User
from ..models.activity import Activity
from ..routers.auth import get_current_user

router = APIRouter()

# Configurar logging
logger = logging.getLogger(__name__)

class ContactForm(BaseModel):
    """Schema para el formulario de contacto"""
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre completo")
    email: EmailStr = Field(..., description="Correo electrónico válido")
    asunto: str = Field(..., min_length=5, max_length=200, description="Asunto del mensaje")
    tipo: str = Field(..., description="Tipo de consulta")
    mensaje: str = Field(..., min_length=10, max_length=2000, description="Mensaje detallado")
    telefono: Optional[str] = Field(None, max_length=20, description="Teléfono opcional")

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Juan Pérez",
                "email": "juan@example.com",
                "asunto": "Consulta sobre letras de canciones",
                "tipo": "consulta",
                "mensaje": "Hola, me gustaría saber cómo puedo contribuir con letras de canciones para la plataforma.",
                "telefono": "+34 612 345 678"
            }
        }


class ContactResponse(BaseModel):
    """Schema para la respuesta del contacto"""
    success: bool
    message: str
    contact_id: Optional[str] = None


def get_contact_types() -> Dict[str, str]:
    """Obtener tipos de contacto disponibles"""
    return {
        "consulta": "Consulta General",
        "sugerencia": "Sugerencia",
        "reporte": "Reporte de Error",
        "colaboracion": "Colaboración",
        "soporte": "Soporte Técnico",
        "otro": "Otro"
    }


def validate_contact_type(tipo: str) -> bool:
    """Validar que el tipo de contacto sea válido"""
    return tipo in get_contact_types()


def format_contact_email_html(form: ContactForm) -> str:
    """Formatear email HTML para contacto"""
    current_year = datetime.now().year
    tipo_display = get_contact_types().get(form.tipo, form.tipo.title())
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo Contacto - Eco Iglesia Letras</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f8fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%); color: white; padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Eco Iglesia Letras</h1>
                <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Nuevo mensaje de contacto</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 24px;">
                <div style="background-color: #f8f9fa; border-left: 4px solid #2e7d32; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                    <h2 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 20px;">{tipo_display}</h2>
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">Nuevo mensaje recibido el {datetime.now().strftime('%d/%m/%Y a las %H:%M')}</p>
                </div>
                
                <!-- Contact Details -->
                <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #343a40; font-size: 18px;">Información del Contacto</h3>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; width: 120px; font-weight: bold; color: #495057;">Nombre:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #212529;">{form.nombre}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #495057;">Email:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                                <a href="mailto:{form.email}" style="color: #2e7d32; text-decoration: none;">{form.email}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #495057;">Tipo:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #212529;">{tipo_display}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #495057;">Asunto:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #212529;">{form.asunto}</td>
                        </tr>
                        {f'''<tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #495057;">Teléfono:</td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #212529;">{form.telefono}</td>
                        </tr>''' if form.telefono else ''}
                    </table>
                </div>
                
                <!-- Message -->
                <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #343a40; font-size: 18px;">Mensaje</h3>
                    <div style="background-color: #f8f9fa; padding: 16px; border-radius: 4px; border-left: 3px solid #2e7d32;">
                        <p style="margin: 0; color: #212529; line-height: 1.6; white-space: pre-wrap;">{form.mensaje}</p>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <a href="mailto:{form.email}?subject=Re: {form.asunto}" 
                      style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        Responder
                    </a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e9ecef;">
                <div style="margin-bottom: 16px;">
                    <a href="https://instagram.com/ecoiglesiaes" style="color: #2e7d32; text-decoration: none; margin: 0 8px;">Instagram</a>
                    <span style="color: #6c757d;">|</span>
                    <a href="https://facebook.com/ecoiglesiaEs" style="color: #2e7d32; text-decoration: none; margin: 0 8px;">Facebook</a>
                    <span style="color: #6c757d;">|</span>
                    <a href="https://ecoiglesia.com" style="color: #2e7d32; text-decoration: none; margin: 0 8px;">Web</a>
                </div>
                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                    © {current_year} Eco Iglesia Letras. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    return html_content


def format_contact_email_text(form: ContactForm) -> str:
    """Formatear email de texto plano para contacto"""
    current_year = datetime.now().year
    tipo_display = get_contact_types().get(form.tipo, form.tipo.title())
    
    text_content = f"""
ECO IGLESIA LETRAS
Nuevo mensaje de contacto

Tipo: {tipo_display}
Fecha: {datetime.now().strftime('%d/%m/%Y a las %H:%M')}

INFORMACIÓN DEL CONTACTO:
- Nombre: {form.nombre}
- Email: {form.email}
- Tipo: {tipo_display}
- Asunto: {form.asunto}
{f'- Teléfono: {form.telefono}' if form.telefono else ''}

MENSAJE:
{form.mensaje}

---
Para responder, envía un email a: {form.email}

REDES SOCIALES:
Instagram: https://instagram.com/ecoiglesiaes
Facebook: https://facebook.com/ecoiglesiaEs
Web: https://ecoiglesia.com

© {current_year} Eco Iglesia Letras
    """
    return text_content.strip()


def send_contact_email_smtp(email_to: str, subject: str, html_content: str, text_content: str) -> bool:
    """Enviar email usando SMTP"""
    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = settings.email_from
        msg['To'] = email_to
        
        # Establecer contenido de texto
        msg.set_content(text_content)
        
        # Agregar contenido HTML
        msg.add_alternative(html_content, subtype='html')
        
        # Enviar email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(settings.email_user, settings.email_pass)
            server.send_message(msg)
        
        return True
        
    except Exception as e:
        logger.error(f"Error enviando email SMTP: {str(e)}")
        return False


async def send_contact_email(form: ContactForm) -> bool:
    """Enviar email de contacto"""
    try:
        tipo_display = get_contact_types().get(form.tipo, form.tipo.title())
        subject = f"[EcoIglesia] {tipo_display} - {form.asunto}"
        
        html_content = format_contact_email_html(form)
        text_content = format_contact_email_text(form)
        
        success = send_contact_email_smtp(
            email_to=settings.email_from,  # Recibir en el email administrativo
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
        
        if success:
            logger.info(f"Email de contacto enviado desde {form.email} - {form.asunto}")
        
        return success
        
    except Exception as e:
        logger.error(f"Error enviando email de contacto: {str(e)}")
        return False


def log_contact_activity(db: Session, user_id: Optional[int], form: ContactForm, ip_address: str = "unknown"):
    """Registrar actividad de contacto"""
    try:
        activity = Activity(
            user_id=user_id,
            action="contact_form",
            details=f"Formulario de contacto enviado: {form.tipo} - {form.asunto}",
            ip_address=ip_address,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        logger.error(f"Error registrando actividad de contacto: {str(e)}")


@router.get("/types")
def get_contact_types_endpoint() -> Dict[str, Any]:
    """Obtener tipos de contacto disponibles"""
    return {
        "types": get_contact_types(),
        "default": "consulta"
    }


@router.post("/", response_model=ContactResponse)
async def submit_contact_form(
    form: ContactForm,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Enviar formulario de contacto"""
    
    # Validar tipo de contacto
    if not validate_contact_type(form.tipo):
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de contacto inválido. Tipos válidos: {list(get_contact_types().keys())}"
        )
    
    try:
        # Enviar email en background
        background_tasks.add_task(send_contact_email, form)
        
        # Registrar actividad
        user_id = getattr(current_user, 'id', None) if current_user else None
        background_tasks.add_task(log_contact_activity, db, user_id, form)
        
        return ContactResponse(
            success=True,
            message="Tu mensaje ha sido enviado correctamente. Te responderemos a la brevedad.",
            contact_id=f"contact_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        )
        
    except Exception as e:
        logger.error(f"Error procesando formulario de contacto: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor. Por favor, inténtalo de nuevo más tarde."
        )


# Alias para compatibilidad con la ruta anterior
@router.post("/contacto", response_model=ContactResponse)
async def contacto_legacy(
    form: ContactForm,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Endpoint legacy para compatibilidad"""
    return await submit_contact_form(form, background_tasks, db, current_user)