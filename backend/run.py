from flask import Flask, render_template
from flask_cors import CORS
from app import db

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
