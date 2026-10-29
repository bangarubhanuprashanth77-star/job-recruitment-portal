from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from ..models import db, User, CandidateProfile, Company, Job, Application, Interview, AuditLog
from ..auth import token_required, role_required
from ..services.audit_service import log_audit

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/stats', methods=['GET'])
@token_required
@role_required('admin')
def get_admin_stats():
    total_users = User.query.count()
    total_seekers = User.query.filter_by(role='job_seeker').count()
    total_recruiters = User.query.filter_by(role='recruiter').count()
    total_companies = Company.query.count()
    verified_companies = Company.query.filter_by(is_verified=True).count()
    
    total_jobs = Job.query.count()
    active_jobs = Job.query.filter_by(status='active').count()
    flagged_jobs = Job.query.filter_by(status='flagged').count()
    closed_jobs = Job.query.filter_by(status='closed').count()
    
    total_apps = Application.query.count()
    hired_count = Application.query.filter_by(status='Hired').count()
    interviews_count = Interview.query.count()
    
    # Category distribution for charts
    categories = db.session.query(Job.category, db.func.count(Job.id)).group_by(Job.category).all()
    category_distribution = [{"name": cat or "Other", "jobs": count} for cat, count in categories]
    
    # Application status breakdown
    statuses = db.session.query(Application.status, db.func.count(Application.id)).group_by(Application.status).all()
    status_breakdown = [{"name": stat, "count": count} for stat, count in statuses]
    
    # User growth (simulated/real from recent users)
    recent_users = User.query.order_by(User.created_at.desc()).limit(10).all()
    
    return jsonify({
        'stats': {
            'total_users': total_users,
            'job_seekers': total_seekers,
            'recruiters': total_recruiters,
            'total_companies': total_companies,
            'verified_companies': verified_companies,
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'flagged_jobs': flagged_jobs,
            'closed_jobs': closed_jobs,
            'total_applications': total_apps,
            'hired_count': hired_count,
            'interviews_count': interviews_count
        },
        'category_distribution': category_distribution,
        'status_breakdown': status_breakdown,
        'recent_users': [u.to_dict() for u in recent_users]
    }), 200


@admin_bp.route('/users', methods=['GET'])
@token_required
@role_required('admin')
def get_users():
    role_filter = request.args.get('role')
    query = User.query
    if role_filter and role_filter != 'all':
        query = query.filter_by(role=role_filter)
        
    users = query.order_by(User.created_at.desc()).all()
    results = []
    for u in users:
        ud = u.to_dict()
        if u.role == 'recruiter' and u.company:
            ud['company_name'] = u.company.name
            ud['is_company_verified'] = u.company.is_verified
        elif u.role == 'job_seeker' and u.candidate_profile:
            ud['headline'] = u.candidate_profile.headline
        results.append(ud)
        
    return jsonify({'users': results}), 200


@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@token_required
@role_required('admin')
def toggle_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if user.id == request.current_user.id:
        return jsonify({'error': 'You cannot deactivate your own administrative account'}), 400
        
    data = request.get_json() or {}
    is_active = data.get('is_active', not user.is_active)
    user.is_active = is_active
    
    try:
        db.session.commit()
        status_str = "activated" if is_active else "deactivated"
        log_audit(
            action=f"USER_{status_str.upper()}",
            target_type="user",
            target_id=user.id,
            details=f"Admin {status_str} user account {user.email}",
            actor=request.current_user
        )
        return jsonify({'message': f'User successfully {status_str}', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update user status: {str(e)}'}), 500


@admin_bp.route('/jobs', methods=['GET'])
@token_required
@role_required('admin')
def get_admin_jobs():
    status = request.args.get('status')
    query = Job.query
    if status and status != 'all':
        query = query.filter_by(status=status)
        
    jobs = query.order_by(Job.created_at.desc()).all()
    return jsonify({'jobs': [j.to_dict() for j in jobs]}), 200


@admin_bp.route('/jobs/<int:job_id>/moderate', methods=['PUT'])
@token_required
@role_required('admin')
def moderate_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
        
    data = request.get_json() or {}
    new_status = data.get('status')
    reason = data.get('reason', 'Administrative moderation action')
    
    if new_status not in ['active', 'closed', 'flagged']:
        return jsonify({'error': 'Invalid status. Choose active, closed, or flagged.'}), 400
        
    old_status = job.status
    job.status = new_status
    
    try:
        db.session.commit()
        log_audit(
            action="JOB_MODERATED",
            target_type="job",
            target_id=job.id,
            details=f"Admin changed job '{job.title}' from {old_status} to {new_status}. Reason: {reason}",
            actor=request.current_user
        )
        return jsonify({
            'message': f"Job status updated to {new_status}",
            'job': job.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to moderate job: {str(e)}'}), 500


@admin_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
        
    job_title = job.title
    try:
        db.session.delete(job)
        db.session.commit()
        log_audit(
            action="JOB_FORCE_REMOVED",
            target_type="job",
            target_id=job_id,
            details=f"Admin permanently removed job '{job_title}'",
            actor=request.current_user
        )
        return jsonify({'message': f"Job '{job_title}' permanently removed."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete job: {str(e)}'}), 500


@admin_bp.route('/companies', methods=['GET'])
@token_required
@role_required('admin')
def get_companies():
    companies = Company.query.order_by(Company.created_at.desc()).all()
    results = []
    for c in companies:
        cd = c.to_dict()
        cd['recruiter_email'] = c.recruiter.email if c.recruiter else ''
        cd['recruiter_name'] = f"{c.recruiter.first_name} {c.recruiter.last_name}" if c.recruiter else ''
        results.append(cd)
    return jsonify({'companies': results}), 200


@admin_bp.route('/companies/<int:company_id>/verify', methods=['PUT'])
@token_required
@role_required('admin')
def toggle_verify_company(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({'error': 'Company not found'}), 404
        
    data = request.get_json() or {}
    is_verified = data.get('is_verified', not company.is_verified)
    company.is_verified = is_verified
    
    try:
        db.session.commit()
        action_name = "COMPANY_VERIFIED" if is_verified else "COMPANY_UNVERIFIED"
        log_audit(
            action=action_name,
            target_type="company",
            target_id=company.id,
            details=f"Admin set company '{company.name}' verified status to {is_verified}",
            actor=request.current_user
        )
        return jsonify({
            'message': f"Company '{company.name}' verification status set to {is_verified}",
            'company': company.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to verify company: {str(e)}'}), 500


@admin_bp.route('/audit-logs', methods=['GET'])
@token_required
@role_required('admin')
def get_audit_logs():
    limit = request.args.get('limit', 50, type=int)
    action_filter = request.args.get('action')
    
    query = AuditLog.query
    if action_filter:
        query = query.filter(AuditLog.action.ilike(f'%{action_filter}%'))
        
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return jsonify({'logs': [l.to_dict() for l in logs]}), 200
