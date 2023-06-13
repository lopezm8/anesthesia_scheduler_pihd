from flask import jsonify, request
from app import app, db
from app.models.schedule import Schedule

@app.route('/api/schedules', methods=['GET', 'POST'])
def handle_schedules():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            new_schedule = Schedule(anesthesiologist_id=data['anesthesiologist_id'],
                                    on_call_date=data['on_call_date'],
                                    call_type=data['call_type'],
                                    day_of_week=data['day_of_week'])
            db.session.add(new_schedule)
            db.session.commit()
            return {"message": f"schedule {new_schedule.id} has been created successfully."}
        else:
            return {"error": "The request payload is not in JSON format"}

    elif request.method == 'GET':
        schedules = Schedule.query.all()
        results = [
            {
                "id": schedule.id,
                "anesthesiologist_id": schedule.anesthesiologist_id,
                "on_call_date": schedule.on_call_date,
                "call_type": schedule.call_type,
                "day_of_week": schedule.day_of_week,
            } for schedule in schedules]

        return {"count": len(results), "schedules": results}
