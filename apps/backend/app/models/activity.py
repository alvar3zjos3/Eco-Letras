from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import Optional
from ..core.database import Base


class Activity(Base):
    """
    Modelo para registrar actividades de usuarios en el sistema.
    Útil para auditoría, seguridad y análisis de comportamiento.
    """
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False, index=True)  # Ej: "login", "logout", "password_change"
    description = Column(Text, nullable=True)  # Descripción detallada de la acción
    ip_address = Column(String(45), nullable=True, index=True)  # IPv4 (15) o IPv6 (45)
    user_agent = Column(Text, nullable=True)  # Información del navegador/cliente
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relación con el modelo User
    user = relationship("User", back_populates="activities")
    
    # Índices compuestos para consultas frecuentes
    __table_args__ = (
        Index('idx_user_date', 'user_id', 'created_at'),
        Index('idx_action_date', 'action', 'created_at'),
        Index('idx_ip_date', 'ip_address', 'created_at'),
    )
    
    def __repr__(self) -> str:
        return f"<Activity(id={self.id}, user_id={self.user_id}, action='{self.action}', created_at='{self.created_at}')>"
    
    @classmethod
    def create_activity(cls, user_id: int, action: str, description: Optional[str] = None, 
                    ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """
        Método helper para crear una nueva actividad de forma consistente.
        """
        return cls(
            user_id=user_id,
            action=action,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent
        )