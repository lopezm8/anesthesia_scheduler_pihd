from app import db

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    anesthesiologist_id = db.Column(db.Integer, db.ForeignKey('anesthesiologist.id'), nullable=False)
    on_call_date = db.Column(db.Date, nullable=False)
    call_type = db.Column(db.String(20), nullable=False)
    day_of_week = db.Column(db.String(10), nullable=False)
