from flask import Blueprint, request, jsonify
from ..models import db, Notification
from ..auth import token_required

notification_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notification_bp.route('', methods=['GET'])
@token_required
def get_notifications():
    user = request.current_user
    notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).limit(30).all()
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200


@notification_bp.route('/<int:notif_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(notif_id):
    user = request.current_user
    notif = Notification.query.filter_by(id=notif_id, user_id=user.id).first()
    if not notif:
        return jsonify({'error': 'Notification not found'}), 404
        
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read', 'notification': notif.to_dict()}), 200


@notification_bp.route('/read-all', methods=['PUT'])
@token_required
def mark_all_read():
    user = request.current_user
    Notification.query.filter_by(user_id=user.id, is_read=False).update({Notification.is_read: True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200
