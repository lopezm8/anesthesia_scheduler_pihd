import { 
  SET_SCHEDULES, 
  FETCH_SCHEDULES,
  SET_FIRST_CALL
} from '../../actions/types';


const initialState = {
  schedules: [],
  loading: false,
  callCounts: {},
  firstCallAssignments: [],
};

const SET_WEEKDAY_FIRST_CALL_COUNTS = 'SET_WEEKDAY_FIRST_CALL_COUNTS';
const SET_WEEKDAY_SECOND_CALL_COUNTS = 'SET_WEEKDAY_SECOND_CALL_COUNTS';
const SET_SELECTED_DATE = 'SET_SELECTED_DATE';
const SET_CALL_COUNTS = 'SET_CALL_COUNTS'


export const scheduleReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SCHEDULES:
      return {
        ...state,
        loading: true,
      };
    case SET_SCHEDULES:
      console.log('SET_SCHEDULES payload: ', action.payload);
      return {
        ...state,
        schedules: action.payload,
        loading: false,
      };
    case SET_CALL_COUNTS:
      return {
        ...state,
        callCounts: action.payload,
      };
    case SET_FIRST_CALL:
      console.log('SET_FIRST_CALL payload: ', action.payload);
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