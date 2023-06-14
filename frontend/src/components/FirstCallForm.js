import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFirstCall } from '../actions'; // This action needs to be defined

const FirstCallForm = () => {
  const dispatch = useDispatch();
  const [selectedAnesthesiologist, setSelectedAnesthesiologist] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const anesthesiologists = useSelector(state => state.anesthesiologists);

  const handleAnesthesiologistChange = (event) => {
    setSelectedAnesthesiologist(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(setFirstCall(selectedAnesthesiologist, selectedDate));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Anesthesiologist:
        <select value={selectedAnesthesiologist} onChange={handleAnesthesiologistChange}>
          {anesthesiologists.map(anesthesiologist => (
            <option key={anesthesiologist.id} value={anesthesiologist.id}>
              {anesthesiologist.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Date:
        <input type="date" value={selectedDate} onChange={handleDateChange} />
      </label>
      <button type="submit">Set First Call</button>
    </form>
  );
};

export default FirstCallForm;
