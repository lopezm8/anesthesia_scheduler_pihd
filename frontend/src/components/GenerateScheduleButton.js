import React from 'react';
import { useDispatch } from 'react-redux';
import { generateRandomSchedule } from '../actions';


const GenerateScheduleButton = ({ selectedDate }) => {
  console.log('generateScheduleButton selected date: ', selectedDate);
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

export default GenerateScheduleButton;