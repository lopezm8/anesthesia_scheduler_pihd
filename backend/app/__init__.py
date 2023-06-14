from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
db = SQLAlchemy(app)

from app.models import anesthesiologist, schedule, vacation
from app.routes import anesthesiologist_routes, schedule_routes, vacation_routes
