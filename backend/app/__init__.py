import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from .config import Config
from .models import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Initialize SQLAlchemy
    db.init_app(app)
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register Blueprints
    from .routes.auth_routes import auth_bp
    from .routes.jobs_routes import jobs_bp
    from .routes.candidate_routes import candidate_bp
    from .routes.recruiter_routes import recruiter_bp
    from .routes.admin_routes import admin_bp
    from .routes.ai_routes import ai_bp
    from .routes.notification_routes import notification_bp
    from .routes.company_routes import company_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(candidate_bp)
    app.register_blueprint(recruiter_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(company_bp)
    
    # Serve uploaded resumes securely
    @app.route('/uploads/resumes/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
        
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'app': 'JobConnect — AI-Powered Job Recruitment Portal',
            'version': '1.0.0'
        }), 200
        
    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404
        
    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error'}), 500
        
    return app
