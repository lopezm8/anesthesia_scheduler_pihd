import { CLEAR_VACATION_DATA } from '../../actions/types';

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
    case 'EDIT_VACATION':
      return state.map((vacation, index) => {
        if (index !== action.index) {
          return vacation;
        }
    
        return {
          ...vacation,
          anesthesiologist: action.anesthesiologist,
          startDate: action.startDate,
          endDate: action.endDate
        };
      });
    case 'DELETE_VACATION':
      return state.filter((vacation, index) => index !== action.index);
    case CLEAR_VACATION_DATA:
      return [];
    default:
      return state;
  }
};
