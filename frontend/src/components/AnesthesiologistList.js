import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedDate } from '../actions';

const AnesthesiologistList = () => {
  const dispatch = useDispatch();
  const anesthesiologists = useSelector(state => state.anesthesiologist) || [];
  const vacations = useSelector(state => state.vacations) || [];
  const callCounts = useSelector(state => state.schedule.callCounts) || {};
  const firstCalls = useSelector(state => state.schedule.firstCallAssignments) || [];
  console.log("firstcalls in anesList here: ya ", firstCalls);
  const selectedDate = useSelector(state => state.schedule.selectedDate) || ''; 
  console.log('AnesList vacations', vacations);

  const formatDate = (dateString) => {
    let date = new Date(dateString);
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    const options = { year: '2-digit', month: 'numeric', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  const decrementDateByOneDay = (dateString) => {
    let date = new Date(dateString);
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    date.setDate(date.getDate() - 1);
    return date;
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
            let anesVacations = vacations.filter(vacation => vacation.anesthesiologist === anesthesiologist);
            anesVacations = anesVacations.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            
            return anesVacations.length > 0 && (
              <li key={index}>
                {anesthesiologist}: {anesVacations.map((vacation, vIndex) => 
                  formatDate(new Date(vacation.startDate)) === formatDate(decrementDateByOneDay(new Date(vacation.endDate))) 
                    ? `${formatDate(new Date(vacation.startDate))}`
                    : `${formatDate(new Date(vacation.startDate))} - ${formatDate(decrementDateByOneDay(new Date(vacation.endDate)))}`
                ).join(', ')}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="first-calls-box">
        <h2>First Calls</h2>
        <ul>
          {anesthesiologists.map((anesthesiologist, index) => {
            const anesFirstCalls = firstCalls.filter(call => call.anesthesiologistId === anesthesiologist);
            
            return anesFirstCalls.length > 0 && (
              <li key={index}>
                {anesthesiologist}: {anesFirstCalls.map((call, cIndex) => 
                  `${formatDate(new Date(call.date))}`
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
