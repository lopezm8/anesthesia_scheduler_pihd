import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { generateRandomSchedule, otherAction, setFirstCall } from '../actions';

const GenerateScheduleButton = ({ selectedDate, firstCallAssignment }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    const year = parseInt(selectedDate.split('-')[0]);
    const month = parseInt(selectedDate.split('-')[1]) - 1;

    dispatch(generateRandomSchedule(new Date(year, month)));

    if (firstCallAssignment) {
      dispatch(setFirstCall(firstCallAssignment));
    }
  };

  return (
    <button onClick={handleClick}>Generate Schedule</button>
  );
};

const mapStateToProps = (state) => ({
  firstCallAssignment: state.schedule.firstCallAssignments, // Adjust this line according to your state structure
});

export default connect(mapStateToProps)(GenerateScheduleButton);
