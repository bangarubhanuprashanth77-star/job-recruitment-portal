from functools import wraps
from datetime import datetime, timedelta
import jwt
from flask import request, jsonify, current_app
from .models import User, db

def generate_token(user):
    payload = {
        'sub': user.id,
        'email': user.email,
        'role': user.role,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=current_app.config.get('JWT_EXPIRATION_HOURS', 72))
    }
    secret = current_app.config.get('JWT_SECRET_KEY')
    return jwt.encode(payload, secret, algorithm='HS256')


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authorization token is missing', 'code': 'NO_TOKEN'}), 401
            
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid Authorization header format. Expected Bearer <token>', 'code': 'INVALID_TOKEN_FORMAT'}), 401
            
        token = parts[1]
        try:
            secret = current_app.config.get('JWT_SECRET_KEY')
            payload = jwt.decode(token, secret, algorithms=['HS256'])
            user = User.query.get(payload['sub'])
            if not user:
                return jsonify({'error': 'User associated with this token no longer exists', 'code': 'USER_NOT_FOUND'}), 401
            if not user.is_active:
                return jsonify({'error': 'This user account has been deactivated', 'code': 'ACCOUNT_INACTIVE'}), 403
                
            request.current_user = user
            request.user_role = user.role
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired. Please log in again', 'code': 'TOKEN_EXPIRED'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token signature', 'code': 'TOKEN_INVALID'}), 401
        except Exception as e:
            return jsonify({'error': f'Authentication error: {str(e)}', 'code': 'AUTH_ERROR'}), 401
            
        return f(*args, **kwargs)
    return decorated


def optional_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        request.current_user = None
        request.user_role = None
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
                try:
                    secret = current_app.config.get('JWT_SECRET_KEY')
                    payload = jwt.decode(token, secret, algorithms=['HS256'])
                    user = User.query.get(payload['sub'])
                    if user and user.is_active:
                        request.current_user = user
                        request.user_role = user.role
                except Exception:
                    pass
        return f(*args, **kwargs)
    return decorated


def role_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'current_user') or not request.current_user:
                return jsonify({'error': 'Authentication required', 'code': 'UNAUTHENTICATED'}), 401
                
            if request.current_user.role not in allowed_roles:
                return jsonify({
                    'error': f'Forbidden: Action requires one of {allowed_roles} role(s)',
                    'code': 'FORBIDDEN',
                    'current_role': request.current_user.role
                }), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator
