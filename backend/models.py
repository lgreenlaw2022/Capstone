from flask_sqlalchemy import SQLAlchemy
# Initialize SQLAlchemy for database operations
db = SQLAlchemy()

class ExampleModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f"<ExampleModel {self.name}>"