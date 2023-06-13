import React from 'react';
import { useDispatch } from 'react-redux';
import { generateRandomSchedule } from '../actions';


function DateSelector({ selectedDate, setSelectedDate }) {
  console.log('DateSelector selected Date: ', selectedDate)
  const dispatch = useDispatch();

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);

    const year = parseInt(event.target.value.split('-')[0]);
    const month = parseInt(event.target.value.split('-')[1]) - 1;

    dispatch(generateRandomSchedule(new Date(year, month)));
  };

  return (
    <input type="month" value={selectedDate} onChange={handleDateChange} />
  );
}

export default DateSelector;