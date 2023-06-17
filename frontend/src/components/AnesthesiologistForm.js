import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addAnesthesiologist, addVacation, setFirstCall } from '../actions';


function AnesthesiologistForm({selectedDate}) {
  console.log('Anesthesiologist Form selected date: ', selectedDate)
  const dispatch = useDispatch();
  const [anesthesiologist, setAnesthesiologist] = useState('');
  const [vacationStart, setVacationStart] = useState(getFirstDayOfMonth(selectedDate));
  const [vacationEnd, setVacationEnd] = useState(getLastDayOfMonth(selectedDate));
  const [firstCallDate, setFirstCallDate] = useState(getFirstDayOfMonth(selectedDate));

  useEffect(() => {
    setVacationStart(getFirstDayOfMonth(selectedDate));
    setVacationEnd(getLastDayOfMonth(selectedDate));
  }, [selectedDate]);

  return (
    <div>
      <h2>Add Anesthesiologist</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        dispatch(addAnesthesiologist(anesthesiologist));
        setAnesthesiologist('');
      }}>
        <input value={anesthesiologist} onChange={e => setAnesthesiologist(e.target.value)} placeholder="Anesthesiologist" />
        <button type="submit">Add</button>
      </form>

      
      <h2>Add Vacation</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        dispatch(addVacation(anesthesiologist, vacationStart, vacationEnd));
        setAnesthesiologist('');
        setVacationStart('');
        setVacationEnd('');
      }}>
        <input value={anesthesiologist} onChange={e => setAnesthesiologist(e.target.value)} placeholder="Anesthesiologist" />
        <input type="date" value={vacationStart} onChange={e => setVacationStart(e.target.value)} placeholder="Start date" />
        <input type="date" value={vacationEnd} onChange={e => setVacationEnd(e.target.value)} placeholder="End date" />
        <button type="submit">Add Vacation</button>
      </form>
      <h2>Add First Call</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        if(anesthesiologist && firstCallDate) {
          dispatch(setFirstCall(anesthesiologist, firstCallDate));
          setAnesthesiologist('');
          setFirstCallDate('');
        } else {
          alert('Please fill both the Anesthesiologist and Date fields');
        }
      }}>
        <input value={anesthesiologist} onChange={e => setAnesthesiologist(e.target.value)} placeholder="Anesthesiologist" />
        <input type="date" value={firstCallDate} onChange={e => setFirstCallDate(e.target.value)} placeholder="Date" />
        <button type="submit">Add First Call</button>
      </form>
    </div>
  );
}

function getFirstDayOfMonth(dateString) {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0];
}

function getLastDayOfMonth(dateString) {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth() + 2, 0).toISOString().split('T')[0];
}

export default AnesthesiologistForm;