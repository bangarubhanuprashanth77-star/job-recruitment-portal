from flask import request
from ..models import db, AuditLog

def log_audit(action, target_type=None, target_id=None, details=None, actor=None):
    try:
        actor_id = None
        actor_name = 'System'
        actor_role = 'system'
        
        if actor:
            actor_id = actor.id
            actor_name = f"{actor.first_name} {actor.last_name}"
            actor_role = actor.role
        elif hasattr(request, 'current_user') and request.current_user:
            actor_id = request.current_user.id
            actor_name = f"{request.current_user.first_name} {request.current_user.last_name}"
            actor_role = request.current_user.role
            
        ip_addr = request.remote_addr if request else '127.0.0.1'
        
        log_entry = AuditLog(
            actor_id=actor_id,
            actor_name=actor_name,
            actor_role=actor_role,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_addr
        )
        db.session.add(log_entry)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[Audit Log Error] Failed to write log: {e}")
