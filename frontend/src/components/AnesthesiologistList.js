import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedDate } from '../actions';

const AnesthesiologistList = () => {
  const dispatch = useDispatch();
  const anesthesiologists = useSelector(state => state.anesthesiologist) || []; // <--- Updated line
  const weekdayFirstCallCounts = useSelector(state => state.schedule.weekdayFirstCallCounts) || {};
  const weekdaySecondCallCounts = useSelector(state => state.schedule.weekdaySecondCallCounts) || {};
  const selectedDate = useSelector(state => state.schedule.selectedDate) || '';

  const handleDateChange = (e) => {
    dispatch(setSelectedDate(e.target.value));
  }

  return (
    <div className="anesthesiologist-box">
      <h2>Anesthesiologists</h2>
      <input type="date" value={selectedDate} onChange={handleDateChange} />
      <ul>
        {anesthesiologists.map((anesthesiologist, index) =>
          <li key={index}>
            {anesthesiologist} - 
            Weekday First Calls: {weekdayFirstCallCounts[anesthesiologist] || 0}, 
            Weekday Second Calls: {weekdaySecondCallCounts[anesthesiologist] || 0}
          </li>
        )}
      </ul>
    </div>
  );
};

export default AnesthesiologistList;

