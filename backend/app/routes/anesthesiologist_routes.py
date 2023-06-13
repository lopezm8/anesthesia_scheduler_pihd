from flask import jsonify, request
from app import app, db
from app.models.anesthesiologist import Anesthesiologist

@app.route('/api/anesthesiologists', methods=['GET', 'POST'])
def handle_anesthesiologists():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            new_anesthesiologist = Anesthesiologist(name=data['name'])
            db.session.add(new_anesthesiologist)
            db.session.commit()
            return {"message": f"anesthesiologist {new_anesthesiologist.name} has been created successfully."}
        else:
            return {"error": "The request payload is not in JSON format"}

    elif request.method == 'GET':
        anesthesiologists = Anesthesiologist.query.all()
        results = [
            {
                "id": anesthesiologist.id,
                "name": anesthesiologist.name,
            } for anesthesiologist in anesthesiologists]

        return {"count": len(results), "anesthesiologists": results}
