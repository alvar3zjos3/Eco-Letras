"""
Servicio para manejar la eliminación programada de cuentas de usuario.
"""
import asyncio
from datetime import datetime, timezone
from sqlalchemy import and_

from app.core.database import SessionLocal
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

class DeletionScheduler:
    """Manejador de eliminaciones programadas de cuentas."""
    
    @staticmethod
    async def process_pending_deletions():
        """
        Procesa todas las eliminaciones de cuentas pendientes.
        Se ejecuta periódicamente para eliminar cuentas que han pasado su período de gracia.
        """
        try:
            db = SessionLocal()
            try:
                now = datetime.now(timezone.utc)
                
                # Buscar usuarios con eliminación programada que ya pasó la fecha
                users_to_delete = db.query(User).filter(
                    and_(
                        User.deletion_scheduled_at.isnot(None),
                        User.deletion_scheduled_at <= now
                    )
                ).all()
                
                for user in users_to_delete:
                    try:
                        logger.info(f"Eliminando cuenta de usuario: {user.email}")
                        
                        # Realizar eliminación suave o dura según la política
                        # Por ahora, eliminaremos completamente
                        db.delete(user)
                        db.commit()
                        
                        logger.info(f"Cuenta {user.email} eliminada exitosamente")
                        
                    except Exception as e:
                        logger.error(f"Error eliminando cuenta {user.email}: {e}")
                        db.rollback()
                        
                logger.info(f"Procesadas {len(users_to_delete)} eliminaciones pendientes")
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error procesando eliminaciones programadas: {e}")
    
    @staticmethod
    async def cleanup_expired_requests():
        """
        Limpia solicitudes de eliminación expiradas (que no fueron confirmadas).
        Se ejecuta para mantener la base de datos limpia.
        """
        try:
            db = SessionLocal()
            try:
                now = datetime.now(timezone.utc)
                
                # Limpiar solicitudes que han estado pendientes por más de 24 horas sin confirmación
                expired_requests = db.query(User).filter(
                    and_(
                        User.deletion_requested_at.isnot(None),
                        User.deletion_scheduled_at.is_(None),
                        # Si la solicitud fue hace más de 24 horas y no se confirmó
                        User.deletion_requested_at <= now
                    )
                ).all()
                
                for user in expired_requests:
                    # Limpiar la solicitud de eliminación
                    setattr(user, 'deletion_requested_at', None)
                    
                db.commit()
                logger.info(f"Limpiadas {len(expired_requests)} solicitudes de eliminación expiradas")
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error limpiando solicitudes expiradas: {e}")

# Función utilitaria para ejecutar el scheduler
async def run_deletion_scheduler():
    """
    Función principal para ejecutar el scheduler de eliminaciones.
    Debe ser llamada periódicamente (por ejemplo, cada hora).
    """
    logger.info("Iniciando procesamiento de eliminaciones programadas...")
    
    # Procesar eliminaciones pendientes
    await DeletionScheduler.process_pending_deletions()
    
    # Limpiar solicitudes expiradas
    await DeletionScheduler.cleanup_expired_requests()
    
    logger.info("Procesamiento de eliminaciones completado")

# Para usar en un cron job o similar
def run_scheduler_sync():
    """Versión sincrónica para usar en cron jobs."""
    asyncio.run(run_deletion_scheduler())
