from flask import Blueprint, jsonify
from models import db, User  # Adjust the import based on your project structure

user_bp = Blueprint('user', __name__)

@user_bp.route('/<int:user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({
            'streak': user.streak,
            'gems': user.gems
        }), 200
    else:
        return jsonify({'error': 'User not found'}), 404