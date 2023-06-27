import axios from 'axios';
import { FETCH_ANESTHESIOLOGISTS, ADD_ANESTHESIOLOGIST, SET_SCHEDULES, FETCH_SCHEDULES, SET_FIRST_CALL, SET_SELECTED_DATE } from './types';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchAnesthesiologists = () => async (dispatch) => {
  const response = await axios.get(`${API_URL}/anesthesiologists`);
  dispatch({ type: FETCH_ANESTHESIOLOGISTS, payload: response.data });
};

export const generateRandomSchedule = (selectedMonth) => (dispatch, getState) => {
  const anesthesiologists = getState().anesthesiologist;

  console.log('State of anesthesiologists before scheduling: ', anesthesiologists);

  const vacations = getState().vacations;
  const setFirstCall = getState().schedule.firstCallAssignments;

  if (!selectedMonth) {
    throw new Error("Selected month is not set");
  }
  const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();

  let firstCallList = [...anesthesiologists];
  let secondCallList = [...anesthesiologists];
  let remainingCallList = [...anesthesiologists];
  let weekendList = [...anesthesiologists];
  
  let schedule = [];
  let yesterday = {};
  let dayBeforeYesterday = {};

  for (let i = 1; i <= daysInMonth; i++) {
    const anesthesiologistsOnVacationToday = getAnesthesiologistsOnVacation(vacations, new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i));

    let today = {};
    today.date = i;
    const dayOfWeek = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i).getDay();
    today.weekday = (dayOfWeek !== 0) && (dayOfWeek !== 6);

    if(dayOfWeek === 0) { // Sunday Call
      today.firstCall = yesterday.secondCall;
      today.secondCall = yesterday.firstCall;
      today.remainingCalls = [];
    } else {
      // Choose First call
  if (today.weekday && setFirstCall[i]) {
    today.firstCall = setFirstCall[i].anesthesiologistId;
  } else if (dayOfWeek === 6 || dayOfWeek === 0) {  // For weekend days
    let constraints = [yesterday.firstCall, yesterday.secondCall, dayBeforeYesterday.firstCall, dayBeforeYesterday.secondCall, ...anesthesiologistsOnVacationToday];
    today.firstCall = chooseAnesthesiologist(today, yesterday, weekendList, constraints, "firstCall", anesthesiologists, vacations);
    weekendList = weekendList.filter(a => a !== today.firstCall);
    if (weekendList.length === 0) {
      weekendList = [...anesthesiologists];
      yesterday.firstCall = null;
      yesterday.secondCall = null;
    }
  } else {  // For weekdays
    let constraints = [yesterday.firstCall, yesterday.secondCall, dayBeforeYesterday.firstCall, dayBeforeYesterday.secondCall, ...anesthesiologistsOnVacationToday];
    today.firstCall = chooseAnesthesiologist(today, yesterday, firstCallList, constraints, "firstCall", anesthesiologists, vacations);
    firstCallList = firstCallList.filter(a => a !== today.firstCall);
    if (firstCallList.length === 0) {
      firstCallList = [...anesthesiologists];
      yesterday.firstCall = null;
    }
  }
  
  // Choose Second call
  if (dayOfWeek === 6 || dayOfWeek === 0) {  // For weekend days
    let constraints = [today.firstCall, yesterday.firstCall, yesterday.secondCall, dayBeforeYesterday.firstCall, dayBeforeYesterday.secondCall, ...anesthesiologistsOnVacationToday];
    today.secondCall = chooseAnesthesiologist(today, yesterday, weekendList, constraints, "secondCall", anesthesiologists, vacations);
    weekendList = weekendList.filter(a => a !== today.secondCall);
    if (weekendList.length === 0) {
      weekendList = [...anesthesiologists];
      yesterday.firstCall = null;
      yesterday.secondCall = null;
    }
  } else {  // For weekdays
    let constraints = [today.firstCall, yesterday.firstCall, yesterday.secondCall, dayBeforeYesterday.firstCall, dayBeforeYesterday.secondCall, ...anesthesiologistsOnVacationToday];
    today.secondCall = chooseAnesthesiologist(today, yesterday, secondCallList, constraints, "secondCall", anesthesiologists, vacations);
    secondCallList = secondCallList.filter(a => a !== today.secondCall);
    if (secondCallList.length === 0) {
      secondCallList = [...anesthesiologists];
      yesterday.secondCall = null;
    }
  }

      // Choose Remaining Call
      if (today.weekday) {
        remainingCallList = remainingCallList.filter(a => ![today.firstCall, today.secondCall, ...anesthesiologistsOnVacationToday].includes(a));
        if (yesterday.secondCall && remainingCallList.includes(yesterday.secondCall)) {
          today.lastCall = yesterday.secondCall;
          remainingCallList = remainingCallList.filter(a => a !== yesterday.secondCall);
        }
        if (yesterday.thirdCall && remainingCallList.includes(yesterday.thirdCall)) {
          today.secondToLastCall = yesterday.thirdCall;
          remainingCallList = remainingCallList.filter(a => a !== yesterday.thirdCall);
        }
        today.remainingCalls = shuffle(remainingCallList);
        remainingCallList = [...anesthesiologists];
      } else {
        today.remainingCalls = [];
      }
    }

    // Save on-call assignments
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i).toISOString().split('T')[0];
    const onCallAnesthesiologists = [today.firstCall, today.secondCall, ...today.remainingCalls];
    onCallAnesthesiologists.forEach((anesthesiologist, index) => {
      let callType = '';
      if (index === 0) {
        callType = 'first';
      } else if (index === 1) {
        callType = 'second';
      } else if (index === onCallAnesthesiologists.length - 2) {
        callType = 'secondToLast';
      } else if (index === onCallAnesthesiologists.length - 1) {
        callType = 'last';
      } else {
        callType = 'remaining';
      }
      schedule.push({
        anesthesiologist: anesthesiologist,
        on_call_date: date,
        call_type: callType,
      });
    });  

    dayBeforeYesterday.firstCall = yesterday.firstCall;
    dayBeforeYesterday.secondCall = yesterday.secondCall;
    yesterday.firstCall = today.firstCall;
    yesterday.secondCall = today.secondCall;
  }

  let callCounts = tallyCalls(schedule);
  console.log('callCounts: ', callCounts);

  dispatch({
    type: 'SET_CALL_COUNTS',
    payload: callCounts,
  });

  dispatch({ type: SET_SCHEDULES, payload: schedule });
}



export const ADD_VACATION = 'ADD_VACATION';

export const addVacation = (anesthesiologist, startDate, endDate) => {
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
  
  return {
    type: ADD_VACATION,
    anesthesiologist,
    startDate,
    endDate: adjustedEndDate.toISOString().split('T')[0],
  };
};

function chooseAnesthesiologist(today, yesterday, list, constraints, type, originalList, vacations) {
  list = shuffle([...list]);

  let eligibleAnesthesiologists = list.filter(a => !constraints.includes(a));

  // if no eligible anesthesiologists found reset to original list
  if (eligibleAnesthesiologists.length === 0) {
    const anesthesiologistsOnVacationToday = getAnesthesiologistsOnVacation(vacations, today.date);
    eligibleAnesthesiologists = originalList.filter(a => a !== yesterday.firstCall && a !== yesterday.secondCall && !anesthesiologistsOnVacationToday.includes(a));
  }

  const chosen = eligibleAnesthesiologists[0];
  return chosen;
}

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function getAnesthesiologistsOnVacation(vacations, day) {
  return vacations.filter(vacation => {
    const start = new Date(vacation.startDate);
    const end = new Date(vacation.endDate);
    return day >= start && day <= end;
  }).map(vacation => vacation.anesthesiologist);
}

export const addAnesthesiologist = (newAnesthesiologist) => {
  return {
    type: ADD_ANESTHESIOLOGIST,
    payload: newAnesthesiologist
  };
};

export const fetchSchedules = () => async (dispatch) => {
  dispatch({ type: FETCH_SCHEDULES });

  const response = await axios.get(`${API_URL}/schedules`);
  dispatch({ type: SET_SCHEDULES, payload: response.data });
};

export const setFirstCall = (anesthesiologistId, date) => {
  return {
    type: SET_FIRST_CALL,
    payload: { anesthesiologistId, date },
  };
};


export const setSelectedDate = (date) => ({
  type: SET_SELECTED_DATE,
  date,
});

function tallyCalls(schedules) {
  let callCounts = {};

  schedules.forEach((entry) => {
    let anesthesiologist = entry.anesthesiologist;
    let callType = entry.call_type;

    if (!callCounts.hasOwnProperty(anesthesiologist)) {
      callCounts[anesthesiologist] = { first: 0, second: 0, remaining: 0, secondToLast: 0, last: 0 };
    }

    callCounts[anesthesiologist][callType]++;
  });

  return callCounts;
}


