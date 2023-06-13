import React from 'react';
import { useSelector } from 'react-redux';


const AnesthesiologistList = () => {
  const anesthesiologists = useSelector(state => state.schedule.anesthesiologists) || [];
  const weekdayFirstCallCounts = useSelector(state => state.schedule.weekdayFirstCallCounts) || {};
  const weekdaySecondCallCounts = useSelector(state => state.schedule.weekdaySecondCallCounts) || {};

  return (
    <div className="anesthesiologist-box">
      <h2>Anesthesiologists</h2>
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