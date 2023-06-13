import React from 'react';
import { useSelector } from 'react-redux';


const ScheduleList = () => {
    const schedules = useSelector(state => state.schedules);

    return (
        <ul>
            {schedules.map(schedule => (
                <li key={schedule.id}>{schedule.anesthesiologist}, {schedule.on_call_date}, {schedule.call_type}</li>
            ))}
        </ul>
    );
};

export default ScheduleList;