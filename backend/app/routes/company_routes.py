from flask import Blueprint, request, jsonify
from ..models import db, Company, Job

company_bp = Blueprint('companies', __name__, url_prefix='/api/companies')

@company_bp.route('', methods=['GET'])
def get_companies_list():
    industry = request.args.get('industry')
    q = request.args.get('q', '').strip()
    
    query = Company.query
    if industry and industry != 'All':
        query = query.filter_by(industry=industry)
    if q:
        query = query.filter(Company.name.ilike(f'%{q}%'))
        
    companies = query.order_by(Company.name.asc()).all()
    results = [c.to_dict() for c in companies]
    return jsonify({'companies': results}), 200


@company_bp.route('/<int:company_id>', methods=['GET'])
def get_company_detail(company_id):
    company = Company.query.get(company_id)
    if not company:
        return jsonify({'error': 'Company not found'}), 404
        
    jobs = Job.query.filter_by(company_id=company.id, status='active').order_by(Job.created_at.desc()).all()
    cdict = company.to_dict()
    cdict['jobs'] = [j.to_dict() for j in jobs]
    
    return jsonify({'company': cdict}), 200
