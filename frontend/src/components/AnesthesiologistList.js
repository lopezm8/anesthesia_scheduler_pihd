import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAnesthesiologist, editAnesthesiologist, editVacation, deleteVacation } from '../actions';
import EditAnesthesiologistForm from './EditAnesthesiologistForm';
import EditVacationForm from './EditVacationForm';

const AnesthesiologistList = () => {
  const [editingIndex, setEditingIndex] = useState(null);
  const dispatch = useDispatch();
  const anesthesiologists = useSelector(state => state.anesthesiologist) || [];
  const vacations = useSelector(state => state.vacations) || [];
  const callCounts = useSelector(state => state.schedule.callCounts) || {};
  const firstCalls = useSelector(state => state.schedule.firstCallAssignments) || [];

  const handleDelete = index => {
    dispatch(deleteAnesthesiologist(index));
  };

  const handleEdit = (index, newAnesthesiologist) => {
    dispatch(editAnesthesiologist(index, newAnesthesiologist));
  };

  const [editingVacation, setEditingVacation] = useState({ anesthesiologist: null, index: null });

  const handleEditVacation = (index, anesthesiologist) => {
    setEditingVacation({ anesthesiologist, index });
  };
  

  const handleDeleteVacation = index => {
    dispatch(deleteVacation(index));
  };


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
          {anesthesiologists.map((anesthesiologist, index) => (
            <li key={index}>
              {editingIndex === index ? (
                <EditAnesthesiologistForm
                  index={index}
                  name={anesthesiologist}
                  setEditing={() => setEditingIndex(null)}
                />
              ) : (
                <>
                  {anesthesiologist} - 
                  First Calls: {callCounts[anesthesiologist]?.first || 0}, 
                  Second Calls: {callCounts[anesthesiologist]?.second || 0}
                  <button onClick={() => setEditingIndex(index)}>Edit</button>
                  <button onClick={() => handleDelete(index)}>Delete</button>
                </>
              )}
            </li>
          ))}
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
                  <div key={vIndex}>
                    {formatDate(new Date(vacation.startDate)) === formatDate(decrementDateByOneDay(new Date(vacation.endDate))) 
                      ? `${formatDate(new Date(vacation.startDate))}`
                      : `${formatDate(new Date(vacation.startDate))} - ${formatDate(decrementDateByOneDay(new Date(vacation.endDate)))}`
                    }
                    {editingVacation.anesthesiologist === anesthesiologist && editingVacation.index === vIndex ? (
                      <EditVacationForm 
                        index={vIndex}
                        vacation={vacation}
                        setEditing={() => setEditingVacation({ anesthesiologist: null, index: null })}
                      />
                    ) : (
                      <>
                        <button onClick={() => handleEditVacation(vIndex, anesthesiologist)}>Edit</button>
                        <button onClick={() => handleDeleteVacation(vIndex)}>Delete</button>
                      </>
                    )}
                  </div>
                )}
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
