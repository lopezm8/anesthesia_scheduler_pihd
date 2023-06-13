import { 
  SET_SCHEDULES, 
  FETCH_SCHEDULES,
} from '../../actions/types';


const initialState = {
  schedules: [],
  loading: false,
  anesthesiologists: [],
  weekdayFirstCallCounts: {},
  weekdaySecondCallCounts: {},
};

const SET_WEEKDAY_FIRST_CALL_COUNTS = 'SET_WEEKDAY_FIRST_CALL_COUNTS';
const SET_WEEKDAY_SECOND_CALL_COUNTS = 'SET_WEEKDAY_SECOND_CALL_COUNTS';


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
    default:
      return state;
  }
};

export { SET_SCHEDULES, FETCH_SCHEDULES, SET_WEEKDAY_FIRST_CALL_COUNTS, SET_WEEKDAY_SECOND_CALL_COUNTS }; 