import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { editVacation, deleteVacation } from '../actions';

const VacationList = ({ vacations }) => {
  const dispatch = useDispatch();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editVacationData, setEditVacationData] = useState({
    anesthesiologist: '',
    startDate: '',
    endDate: ''
  });

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditVacationData(vacations[index]);
    setShowEditForm(true);
  };

  const handleEditChange = (e) => {
    setEditVacationData({
      ...editVacationData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    dispatch(editVacation(editIndex, editVacationData));
    setShowEditForm(false);
  };

  const handleDelete = (index) => {
    dispatch(deleteVacation(index));
  };

  return (
    <div>
      {vacations.map((vacation, index) => (
        <div key={index}>
          <p>{vacation.anesthesiologist}</p>
          <p>{vacation.startDate}</p>
          <p>{vacation.endDate}</p>
          <button onClick={() => handleEdit(index)}>Edit</button>
          <button onClick={() => handleDelete(index)}>Delete</button>
        </div>
      ))}
      
      {showEditForm && (
        <div>
          <h3>Edit Vacation</h3>
          <form onSubmit={handleEditSubmit}>
            <input 
              name="anesthesiologist"
              value={editVacationData.anesthesiologist}
              onChange={handleEditChange}
              placeholder="Anesthesiologist"
            />
            <input 
              type="date"
              name="startDate"
              value={editVacationData.startDate}
              onChange={handleEditChange}
              placeholder="Start Date"
            />
            <input 
              type="date"
              name="endDate"
              value={editVacationData.endDate}
              onChange={handleEditChange}
              placeholder="End Date"
            />
            <button type="submit">Submit</button>
            <button onClick={() => setShowEditForm(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VacationList;
