import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedDate } from '../actions';

const AnesthesiologistList = () => {
  const dispatch = useDispatch();
  const anesthesiologists = useSelector(state => state.anesthesiologist) || [];
  const vacations = useSelector(state => state.vacations) || [];
  const callCounts = useSelector(state => state.schedule.callCounts) || {};
  const selectedDate = useSelector(state => state.schedule.selectedDate) || '';

  const handleDateChange = (e) => {
    dispatch(setSelectedDate(e.target.value));
  }

  const formatDate = (dateString) => {
    const options = { year: '2-digit', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <div className="content-box">
      <div className="anesthesiologist-box">
        <h2>Anesthesiologists</h2>
        <ul>
          {anesthesiologists.map((anesthesiologist, index) =>
            <li key={index}>
              {anesthesiologist} - 
              First Calls: {callCounts[anesthesiologist]?.first || 0}, 
              Second Calls: {callCounts[anesthesiologist]?.second || 0}
            </li>
          )}
        </ul>
      </div>
      <div className="vacations-box">
        <h2>Vacations</h2>
        <ul>
          {anesthesiologists.map((anesthesiologist, index) => {
            const anesVacations = vacations.filter(vacation => vacation.anesthesiologist === anesthesiologist);
            
            return anesVacations.length > 0 && (
              <li key={index}>
                {anesthesiologist}: {anesVacations.map((vacation, vIndex) => 
                  `${formatDate(vacation.startDate)} - ${formatDate(vacation.endDate)}`
                ).join(', ')}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AnesthesiologistList;
