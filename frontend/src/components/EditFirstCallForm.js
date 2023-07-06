import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { editFirstCall } from '../actions';

const EditFirstCallForm = ({ index, call, handleEdit, setEditing }) => {
    const [updatedCall, setUpdatedCall] = useState(call);
  
    const handleChange = e => {
      setUpdatedCall({
        ...updatedCall,
        [e.target.name]: e.target.value
      });
    };
  
    const handleSubmit = e => {
      e.preventDefault();
      handleEdit(index, updatedCall);
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input
            name="anesthesiologistId"
            value={updatedCall.anesthesiologistId}
            onChange={handleChange}
            placeholder="Anesthesiologist ID"
        />
        <input
            type="date"
            name="date"
            value={updatedCall.date}
            onChange={handleChange}
            placeholder="Date"
        />
        <button type="submit">Save</button>
        <button onClick={() => setEditing({ anesthesiologistId: null, index: null })}>Cancel</button>
      </form>
    );
  };

export default EditFirstCallForm;