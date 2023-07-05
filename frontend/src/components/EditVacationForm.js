import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { editVacation } from '../actions';

const EditVacationForm = ({ index, vacation, setEditing }) => {
  const [anesthesiologist, setAnesthesiologist] = useState(vacation.anesthesiologist);
  const [startDate, setStartDate] = useState(vacation.startDate);
  const [endDate, setEndDate] = useState(vacation.endDate);

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(editVacation(index, { anesthesiologist, startDate, endDate }));
    setEditing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={anesthesiologist}
        onChange={(e) => setAnesthesiologist(e.target.value)}
        required
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={() => setEditing(false)}>Cancel</button>
    </form>
  );
};

export default EditVacationForm;
