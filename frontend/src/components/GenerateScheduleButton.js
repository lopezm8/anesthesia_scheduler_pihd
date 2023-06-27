import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { generateRandomSchedule, otherAction, setFirstCall } from '../actions';

const GenerateScheduleButton = ({ selectedDate, firstCallAssignment }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    const year = parseInt(selectedDate.split('-')[0]);
    const month = parseInt(selectedDate.split('-')[1]) - 1;

    dispatch(generateRandomSchedule(new Date(year, month)));
  };

  return (
    <button onClick={handleClick}>Generate Schedule</button>
  );
};

const mapStateToProps = (state) => {
  const assignments = state.schedule.firstCallAssignments;
  const recentAssignment = assignments[assignments.length - 1];
  
  return {
    firstCallAssignment: recentAssignment ? {
      anesthesiologistId: String(recentAssignment.anesthesiologistId),
      date: String(recentAssignment.date),
    } : { anesthesiologistId: '', date: '' },
  };
}

export default connect(mapStateToProps)(GenerateScheduleButton);
