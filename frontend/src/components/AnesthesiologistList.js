import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedDate } from '../actions';

const AnesthesiologistList = () => {
  const dispatch = useDispatch();
  const anesthesiologists = useSelector(state => state.anesthesiologist) || []; // <--- Updated line
  const callCounts = useSelector(state => state.schedule.callCounts) || {};
  const selectedDate = useSelector(state => state.schedule.selectedDate) || '';

  const handleDateChange = (e) => {
    dispatch(setSelectedDate(e.target.value));
  }

  return (
    <div className="anesthesiologist-box">
      <h2>Anesthesiologists</h2>
      <ul>
        {anesthesiologists.map((anesthesiologist, index) =>
          <li key={index}>
            {anesthesiologist} - 
            First Calls: {callCounts[anesthesiologist]?.first || 0}, 
            Second Calls: {callCounts[anesthesiologist]?.second || 0},
          </li>
        )}
      </ul>
    </div>
  );
};

export default AnesthesiologistList;

