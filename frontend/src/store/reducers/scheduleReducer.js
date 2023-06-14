import { 
  SET_SCHEDULES, 
  FETCH_SCHEDULES,
  SET_FIRST_CALL
} from '../../actions/types';


const initialState = {
  schedules: [],
  loading: false,
  weekdayFirstCallCounts: {},
  weekdaySecondCallCounts: {},
  firstCallAssignments: [],
};

const SET_WEEKDAY_FIRST_CALL_COUNTS = 'SET_WEEKDAY_FIRST_CALL_COUNTS';
const SET_WEEKDAY_SECOND_CALL_COUNTS = 'SET_WEEKDAY_SECOND_CALL_COUNTS';
const SET_SELECTED_DATE = 'SET_SELECTED_DATE';


export const scheduleReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SCHEDULES:
      return {
        ...state,
        loading: true,
      };
    case SET_SCHEDULES:
      return {
        ...state,
        schedules: action.payload,
        loading: false,
      };
    case SET_WEEKDAY_FIRST_CALL_COUNTS:
      return {
        ...state,
        weekdayFirstCallCounts: action.payload,
      };
    case SET_WEEKDAY_SECOND_CALL_COUNTS:
      return {
        ...state,
        weekdaySecondCallCounts: action.payload,
      };
    case SET_FIRST_CALL:
      return {
        ...state,
        firstCallAssignments: [...state.firstCallAssignments, action.payload],
      };
    case SET_SELECTED_DATE:
      return { 
        ...state, selectedDate: action.date 
      };
    
    default:
      return state;
  }
};

export { SET_SCHEDULES, FETCH_SCHEDULES, SET_WEEKDAY_FIRST_CALL_COUNTS, SET_WEEKDAY_SECOND_CALL_COUNTS, SET_FIRST_CALL, SET_SELECTED_DATE }; 