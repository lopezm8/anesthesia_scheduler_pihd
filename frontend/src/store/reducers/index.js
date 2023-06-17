import { combineReducers } from 'redux';
import { anesthesiologistReducer } from './anesthesiologistReducer';
import { scheduleReducer } from './scheduleReducer';
import { vacationReducer } from './vacationReducer';
import { firstCallReducer } from './firstCallReducer';

export default combineReducers({
  anesthesiologist: anesthesiologistReducer,
  schedule: scheduleReducer,
  vacations: vacationReducer,
  firstCall: firstCallReducer,
});
