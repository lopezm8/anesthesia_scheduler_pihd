export const anesthesiologistReducer = (state = [], action) => {
  switch (action.type) {
    case 'FETCH_ANESTHESIOLOGISTS':
      console.log('FETCH_ANESTHESIOLOGISTS action', action.payload);
      return action.payload;
    case 'ADD_ANESTHESIOLOGIST':
      console.log('ADD_ANESTHESIOLOGIST action', action.payload);
      return [...state, action.payload]; 
    default:
      return state;
  }
};
