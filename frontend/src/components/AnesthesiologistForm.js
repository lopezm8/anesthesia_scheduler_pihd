import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addAnesthesiologist, addVacation, setFirstCall } from '../actions';

function AnesthesiologistForm({selectedDate}) {
  const dispatch = useDispatch();
  const [anesthesiologist, setAnesthesiologist] = useState('');
  const [vacationStart, setVacationStart] = useState(getFirstDayOfMonth(selectedDate));
  const [vacationEnd, setVacationEnd] = useState(getLastDayOfMonth(selectedDate));
  const [firstCallDate, setFirstCallDate] = useState(getFirstDayOfMonth(selectedDate));

  useEffect(() => {
    setVacationStart(getFirstDayOfMonth(selectedDate));
    setVacationEnd(getLastDayOfMonth(selectedDate));
    setFirstCallDate(getFirstDayOfMonth(selectedDate));
  }, [selectedDate]);

  return (
    <div className="form-container">
      <div className="add-anesthesiologist-box">
        <h2>Add Anesthesiologist</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          dispatch(addAnesthesiologist(anesthesiologist));
          setAnesthesiologist('');
        }}>
          <input className="add-form" value={anesthesiologist} onChange={e => setAnesthesiologist(e.target.value)} placeholder="Anesthesiologist" />
          <button className="button-add" type="submit">Add Anesthesiologist</button>
        </form>
      </div>

      <div className="add-vacation-box">
      <h2>Add Vacation</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          dispatch(addVacation(anesthesiologist, parseDate(vacationStart), parseDate(vacationEnd)));
          setAnesthesiologist('');
          setVacationStart(getFirstDayOfMonth(selectedDate));
          setVacationEnd(getLastDayOfMonth(selectedDate));
        }}>
          <input className="add-form" value={anesthesiologist} onChange={e => setAnesthesiologist(e.target.value)} placeholder="Anesthesiologist" />
          <button className="button-add" type="submit">Add Vacation</button>
          <input className="calendar-one" type="date" value={vacationStart} onChange={e => setVacationStart(e.target.value)} placeholder="Start date" />
          <input type="date" value={vacationEnd} onChange={e => setVacationEnd(e.target.value)} placeholder="End date" />
          
        </form>
      </div>

      <div className="add-first-call-box">
        <h2>Add First Call</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if(anesthesiologist && firstCallDate) {
              dispatch(setFirstCall(anesthesiologist, firstCallDate));
              setAnesthesiologist('');
              setFirstCallDate(getFirstDayOfMonth(selectedDate));
            } else {
              alert('Please fill both the Anesthesiologist and Date fields');
            }
          }}>
          <input className="add-form" value={anesthesiologist} onChange={e => setAnesthesiologist(e.target.value)} placeholder="Anesthesiologist" />
          <button className="button-add" type="submit">Add First Call</button>
          <input type="date" value={firstCallDate} onChange={e => setFirstCallDate(e.target.value)} placeholder="Date" />
          
        </form>
      </div>
    </div>
  );
}

function getFirstDayOfMonth(dateString) {
  const [year, month] = dateString.split('-').map(Number);
  return new Date(year, month - 1, 1).toISOString().split('T')[0];
}

function getLastDayOfMonth(dateString) {
  const [year, month] = dateString.split('-').map(Number);
  return new Date(year, month, 0).toISOString().split('T')[0];
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default AnesthesiologistForm;
