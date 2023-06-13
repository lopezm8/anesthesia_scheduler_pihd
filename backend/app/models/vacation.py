from app import db

class Vacation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    anesthesiologist_id = db.Column(db.Integer, db.ForeignKey('anesthesiologist.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
