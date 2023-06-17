import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFirstCall } from './actions';

function AddFirstCallForm() {
  const dispatch = useDispatch();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAnesthesiologist, setSelectedAnesthesiologist] = useState('');

  const anesthesiologists = useSelector(state => state.anesthesiologists);

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (selectedDate && selectedAnesthesiologist) {
      console.log(`First Call Assigned - anesthesiologistId: ${selectedAnesthesiologist}, date: ${selectedDate}`);
    } else {
      alert('Please select a date and an anesthesiologist');
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Anesthesiologist:
        <select value={selectedAnesthesiologist} onChange={e => setSelectedAnesthesiologist(e.target.value)}>
          <option value="">Select...</option>
          {anesthesiologists.map(anesthesiologist =>
            <option key={anesthesiologist.id} value={anesthesiologist.id}>
              {anesthesiologist.name}
            </option>
          )}
        </select>
      </label>
      <label>
        Date:
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}

export default AddFirstCallForm;
