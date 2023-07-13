import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAnesthesiologist, editAnesthesiologist, editVacation, deleteVacation, editFirstCall, deleteFirstCall } from '../actions';
import EditAnesthesiologistForm from './EditAnesthesiologistForm';
import EditVacationForm from './EditVacationForm';
import EditFirstCallForm from './EditFirstCallForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import './ScheduleCalendar.css';

library.add(far);

const AnesthesiologistList = () => {
  const [editingIndex, setEditingIndex] = useState(null);
  const dispatch = useDispatch();
  const anesthesiologists = useSelector(state => state.anesthesiologist) || [];
  const vacations = useSelector(state => state.vacations) || [];
  console.log("vacations in AnesthesiologistList.js: ", vacations);
  const callCounts = useSelector(state => state.schedule.callCounts) || {};
  const firstCalls = useSelector(state => state.schedule.firstCallAssignments) || [];

  const handleDelete = index => {
    dispatch(deleteAnesthesiologist(index));
  };

  const handleEdit = (index, newAnesthesiologist) => {
    dispatch(editAnesthesiologist(index, newAnesthesiologist));
  };

  const handleEditVacation = (index, newVacation) => {
    dispatch(editVacation(index, newVacation));
  };
  
  const handleDeleteVacation = index => {
    dispatch(deleteVacation(index));
  };
  
  const [editingVacationIndex, setEditingVacationIndex] = useState(null);

  const [editingFirstCall, setEditingFirstCall] = useState({ anesthesiologistId: null, index: null });

  const handleEditFirstCall = (index, anesthesiologistId) => {
    setEditingFirstCall({ anesthesiologistId, index });
  };

  const handleDeleteFirstCall = (index, anesthesiologistId) => {
    const actualIndex = firstCalls.findIndex(call => call.anesthesiologistId === anesthesiologistId && call.date === firstCalls[index].date);
    dispatch(deleteFirstCall(actualIndex));
  };
  
  const handleFirstCallEdit = (index, updatedCall) => {
    const actualIndex = firstCalls.findIndex(call => call.anesthesiologistId === updatedCall.anesthesiologistId && call.date === firstCalls[index].date);
    dispatch(editFirstCall(actualIndex, updatedCall));
    setEditingFirstCall({ anesthesiologistId: null, index: null });
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
    date.setDate(date.getDate() + 1);
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
                  <FontAwesomeIcon icon={['far', 'pen-to-square']} onClick={() => setEditingIndex(index)} className="icon-button-edit"/>
                  <FontAwesomeIcon icon={['far', 'trash-can']} onClick={() => handleDelete(index)} className="icon-button" />
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="vacations-box">
      <h2>Vacations</h2>
      <ul>
        {vacations.map((vacation, index) => (
          <li key={index}>
            {editingVacationIndex === index ? (
              <EditVacationForm
                index={index}
                vacation={vacation}
                handleEdit={handleEditVacation}
                setEditing={() => setEditingVacationIndex(null)}
              />
            ) : (
              <>
                {vacation.anesthesiologist} - 
                Start Date: {formatDate(new Date(vacation.startDate))},
                End Date: {formatDate(new Date(vacation.endDate))}
                <FontAwesomeIcon icon={['far', 'pen-to-square']} onClick={() => setEditingVacationIndex(index)} className="icon-button-edit"/>
                <FontAwesomeIcon icon={['far', 'trash-can']} onClick={() => handleDeleteVacation(index)} className="icon-button" />
              </>
            )}
          </li>
        ))}
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
                  <div key={cIndex}>
                    {formatDate(new Date(call.date))}
                    {editingFirstCall.anesthesiologistId === anesthesiologist && editingFirstCall.index === cIndex ? (
                      <EditFirstCallForm
                        index={cIndex}
                        call={call}
                        handleEdit={handleFirstCallEdit}
                        setEditing={() => setEditingFirstCall({ anesthesiologist: null, index: null })}
                      />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={['far', 'pen-to-square']} onClick={() => handleEditFirstCall(cIndex, anesthesiologist)} className="icon-button-edit" />
                        <FontAwesomeIcon icon={['far', 'trash-can']} onClick={() => handleDeleteFirstCall(cIndex, anesthesiologist)} className="icon-button" />
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AnesthesiologistList;
