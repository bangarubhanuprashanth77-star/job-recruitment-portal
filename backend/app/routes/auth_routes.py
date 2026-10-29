from flask import Blueprint, request, jsonify
from ..models import db, User, CandidateProfile, Company, Notification
from ..auth import generate_token, token_required
from ..services.audit_service import log_audit

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'job_seeker')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    phone = data.get('phone', '').strip()
    company_name = data.get('company_name', '').strip()
    
    if not email or not password or not first_name or not last_name:
        return jsonify({'error': 'First name, last name, email, and password are required.'}), 400
        
    if role not in ['job_seeker', 'recruiter']:
        return jsonify({'error': 'Invalid role specified. Must be job_seeker or recruiter.'}), 400
        
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email address already exists.'}), 409
        
    try:
        user = User(
            email=email,
            role=role,
            first_name=first_name,
            last_name=last_name,
            phone=phone
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()
        
        # Initialize candidate profile or company
        if role == 'job_seeker':
            profile = CandidateProfile(
                user_id=user.id,
                headline="Motivated Professional seeking new opportunities",
                skills='["Problem Solving", "Communication", "Teamwork"]'
            )
            db.session.add(profile)
        elif role == 'recruiter':
            company = Company(
                recruiter_id=user.id,
                name=company_name or f"{first_name}'s Organization",
                industry="Technology",
                location="Remote",
                description="Hiring top talent."
            )
            db.session.add(company)
            
        # Welcome notification
        welcome_notif = Notification(
            user_id=user.id,
            title="Welcome to JobConnect!",
            message=f"Hello {first_name}, welcome to JobConnect. Complete your profile to get the most out of our AI-powered job matching.",
            type="system"
        )
        db.session.add(welcome_notif)
        
        db.session.commit()
        
        log_audit(
            action="USER_REGISTERED",
            target_type="user",
            target_id=user.id,
            details=f"User registered with email {email} as {role}",
            actor=user
        )
        
        token = generate_token(user)
        user_data = user.to_dict()
        if role == 'job_seeker' and user.candidate_profile:
            user_data['profile'] = user.candidate_profile.to_dict()
        elif role == 'recruiter' and user.company:
            user_data['company'] = user.company.to_dict()
            
        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': user_data
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password.'}), 401
        
    if not user.is_active:
        return jsonify({'error': 'Your account has been deactivated. Please contact support.'}), 403
        
    token = generate_token(user)
    user_data = user.to_dict()
    
    if user.role == 'job_seeker' and user.candidate_profile:
        user_data['profile'] = user.candidate_profile.to_dict()
    elif user.role == 'recruiter' and user.company:
        user_data['company'] = user.company.to_dict()
        
    log_audit(
        action="USER_LOGIN",
        target_type="user",
        target_id=user.id,
        details=f"User {email} logged in successfully",
        actor=user
    )
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user_data
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    user = request.current_user
    user_data = user.to_dict()
    
    if user.role == 'job_seeker' and user.candidate_profile:
        user_data['profile'] = user.candidate_profile.to_dict()
    elif user.role == 'recruiter' and user.company:
        user_data['company'] = user.company.to_dict()
        
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    user_data['unread_notifications'] = unread_count
    
    return jsonify({'user': user_data}), 200


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    user = request.current_user
    data = request.get_json() or {}
    
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    phone = data.get('phone', '').strip()
    
    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    if phone is not None:
        user.phone = phone
        
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500
