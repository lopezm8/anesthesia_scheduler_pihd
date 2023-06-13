from flask import jsonify, request
from app import app, db
from app.models.vacation import Vacation

@app.route('/api/vacations', methods=['GET', 'POST'])
def handle_vacations():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            new_vacation = Vacation(anesthesiologist_id=data['anesthesiologist_id'],
                                    start_date=data['start_date'],
                                    end_date=data['end_date'])
            db.session.add(new_vacation)
            db.session.commit()
            return {"message": f"vacation {new_vacation.id} has been created successfully."}
        else:
            return {"error": "The request payload is not in JSON format"}

    elif request.method == 'GET':
        vacations = Vacation.query.all()
        results = [
            {
                "id": vacation.id,
                "anesthesiologist_id": vacation.anesthesiologist_id,
                "start_date": vacation.start_date,
                "end_date": vacation.end_date,
            } for vacation in vacations]

        return {"count": len(results), "vacations": results}
