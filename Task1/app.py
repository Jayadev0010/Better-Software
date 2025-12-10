from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:root@localhost:5432/taskmanager'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class TaskItem(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    is_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    comments = db.relationship('TaskComment', backref='taskitem', lazy=True)

class TaskComment(db.Model):
    __tablename__ = 'task_comments'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    comment_text = db.Column(db.Text, nullable=False)
    author_name = db.Column(db.String(100), default='Anonymous')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({'ok': True, 'msg': 'server up'})

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = TaskItem.query.all()
    out = []
    for t in tasks:
        out.append({
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'is_completed': t.is_completed,
            'created_at': t.created_at.isoformat() if t.created_at else None
        })
    return jsonify(out)

@app.route('/api/tasks', methods=['POST'])
def make_task():
    data = request.json
    
    if not data or not data.get('title'):
        return jsonify({'error': 'need title'}), 400
    
    newtask = TaskItem(
        title=data['title'],
        description=data.get('description', '')
    )
    
    db.session.add(newtask)
    db.session.commit()
    
    return jsonify({'id': newtask.id, 'title': newtask.title}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def change_task(task_id):
    task = TaskItem.query.get(task_id)
    if not task:
        return jsonify({'error': 'no task'}), 404
    
    data = request.json
    
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'is_completed' in data:
        task.is_completed = bool(data['is_completed'])
    
    db.session.commit()
    
    return jsonify({'msg': 'updated'})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def drop_task(task_id):
    task = TaskItem.query.get(task_id)
    if not task:
        return jsonify({'error': 'no task'}), 404
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'msg': 'deleted'})

@app.route('/api/tasks/<int:task_id>/comments', methods=['GET'])
def get_comments_for_task(task_id):
    task = TaskItem.query.get(task_id)
    if not task:
        return jsonify({'error': 'no task'}), 404
    
    comments = TaskComment.query.filter_by(task_id=task_id).all()
    out = []
    for c in comments:
        out.append({
            'id': c.id,
            'task_id': c.task_id,
            'comment_text': c.comment_text,
            'author_name': c.author_name,
            'created_at': c.created_at.isoformat() if c.created_at else None
        })
    return jsonify(out)

@app.route('/api/tasks/<int:task_id>/comments', methods=['POST'])
def add_comment(task_id):
    task = TaskItem.query.get(task_id)
    if not task:
        return jsonify({'error': 'no task'}), 404
    
    data = request.json
    
    if not data or not data.get('comment_text'):
        return jsonify({'error': 'need comment text'}), 400
    
    newcomment = TaskComment(
        task_id=task_id,
        comment_text=data['comment_text'],
        author_name=data.get('author_name', 'Anonymous')
    )
    
    db.session.add(newcomment)
    db.session.commit()
    
    return jsonify({
        'id': newcomment.id,
        'comment_text': newcomment.comment_text,
        'author_name': newcomment.author_name
    }), 201

@app.route('/api/tasks/<int:task_id>/comments/<int:comment_id>', methods=['PUT'])
def edit_comment(task_id, comment_id):
    comment = TaskComment.query.filter_by(id=comment_id, task_id=task_id).first()
    if not comment:
        return jsonify({'error': 'no comment'}), 404
    
    data = request.json
    
    if not data or not data.get('comment_text'):
        return jsonify({'error': 'need comment text'}), 400
    
    comment.comment_text = data['comment_text']
    if 'author_name' in data:
        comment.author_name = data['author_name']
    
    db.session.commit()
    
    return jsonify({'msg': 'comment changed'})

@app.route('/api/tasks/<int:task_id>/comments/<int:comment_id>', methods=['DELETE'])
def remove_comment(task_id, comment_id):
    comment = TaskComment.query.filter_by(id=comment_id, task_id=task_id).first()
    if not comment:
        return jsonify({'error': 'no comment'}), 404
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({'msg': 'comment gone'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)