import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { editAnesthesiologist } from '../actions';

const EditAnesthesiologistForm = ({ index, name, setEditing }) => {
  const [newName, setNewName] = useState(name);
  const dispatch = useDispatch();

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(editAnesthesiologist(index, newName));
    setEditing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={newName}
        onChange={e => setNewName(e.target.value)}
      />
      <button type="submit">Save</button>
      <button type="button" onClick={() => setEditing(false)}>
        Cancel
      </button>
    </form>
  );
};

export default EditAnesthesiologistForm;
