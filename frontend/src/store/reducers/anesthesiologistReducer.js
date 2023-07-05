export const anesthesiologistReducer = (state = [], action) => {
  switch (action.type) {
    case 'FETCH_ANESTHESIOLOGISTS':
      return action.payload;
    case 'ADD_ANESTHESIOLOGIST':
      return [...state, action.anesthesiologist];
    case 'EDIT_ANESTHESIOLOGIST':
      return state.map((anesthesiologist, index) => 
        index === action.index ? action.newAnesthesiologist : anesthesiologist
      );
    case 'DELETE_ANESTHESIOLOGIST':
      return state.filter((_, index) => index !== action.index);
    default:
      return state;
  }
};