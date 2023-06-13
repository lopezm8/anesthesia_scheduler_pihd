export const vacationReducer = (state = [], action) => {
    switch (action.type) {
      case 'FETCH_VACATIONS':
        return action.payload;
      case 'ADD_VACATION':
        return [...state, {
          anesthesiologist: action.anesthesiologist,
          startDate: action.startDate,
          endDate: action.endDate
        }];
      default:
        return state;
    }
};
