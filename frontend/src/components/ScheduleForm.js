import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addSchedule } from '../actions';


const ScheduleForm = () => {
    const [anesthesiologistId, setAnesthesiologistId] = useState('');
    const [date, setDate] = useState('');
    const [callType, setCallType] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = e => {
        e.preventDefault();
        dispatch(addSchedule({ anesthesiologistId, date, callType }));
        setAnesthesiologistId('');
        setDate('');
        setCallType('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
        Anesthesiologist ID:
        <input type="text" value={anesthesiologistId} onChange={e => setAnesthesiologistId(e.target.value)} />
    </label>
    <label>
        Date:
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
    </label>
    <label>
        Call Type:
        <input type="text" value={callType} onChange={e => setCallType(e.target.value)} />
    </label>
            <input type="submit" value="Add Schedule" />
        </form>
    );
};

export default ScheduleForm;