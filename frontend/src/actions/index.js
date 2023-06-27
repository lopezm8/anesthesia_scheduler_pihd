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
    today.firstCall = chooseAnesthesiologist(today, yesterday, firstCallList, constraints, "firstCall", anesthesiologists, vacations, selectedMonth);
    weekendList = weekendList.filter(a => a !== today.firstCall);
    if (weekendList.length === 0) {
      weekendList = [...anesthesiologists];
      yesterday.firstCall = null;
      yesterday.secondCall = null;
    }
  } else {  // For weekdays
    let constraints = [yesterday.firstCall, yesterday.secondCall, dayBeforeYesterday.firstCall, dayBeforeYesterday.secondCall, ...anesthesiologistsOnVacationToday];
    today.firstCall = chooseAnesthesiologist(today, yesterday, firstCallList, constraints, "firstCall", anesthesiologists, vacations, selectedMonth);
    firstCallList = firstCallList.filter(a => a !== today.firstCall);
    if (firstCallList.length === 0) {
      firstCallList = [...anesthesiologists];
      yesterday.firstCall = null;
    }
  }
  
  // Choose Second call
  if (dayOfWeek === 6 || dayOfWeek === 0) {  // For weekend days
    let constraints = [today.firstCall, yesterday.firstCall, yesterday.secondCall, dayBeforeYesterday.firstCall, dayBeforeYesterday.secondCall, ...anesthesiologistsOnVacationToday];
    today.secondCall = chooseAnesthesiologist(today, yesterday, secondCallList, constraints, "secondCall", anesthesiologists, vacations, selectedMonth);
    weekendList = weekendList.filter(a => a !== today.secondCall);
    if (weekendList.length === 0) {
      weekendList = [...anesthesiologists];
      yesterday.firstCall = null;
      yesterday.secondCall = null;
    }
  } else {  // For weekdays
    let constraints = [today.firstCall, yesterday.firstCall, yesterday.secondCall, dayBeforeYesterday.firstCall, dayBeforeYesterday.secondCall, ...anesthesiologistsOnVacationToday];
    today.secondCall = chooseAnesthesiologist(today, yesterday, secondCallList, constraints, "secondCall", anesthesiologists, vacations, selectedMonth);
    secondCallList = secondCallList.filter(a => a !== today.secondCall);
    if (secondCallList.length === 0) {
      secondCallList = [...anesthesiologists];
      yesterday.secondCall = null;
    }
  }

      // Choose Remaining Call
      if (today.weekday) {
        let todayDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), today.date);
        remainingCallList = remainingCallList.filter(a => {
          let notInFirstAndSecondCall = ![today.firstCall, today.secondCall].includes(a);
          let notOnVacation = !isAnesthesiologistOnVacation(vacations, a, todayDate);
          return notInFirstAndSecondCall && notOnVacation;
        });
        
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

function chooseAnesthesiologist(today, yesterday, list, constraints, type, originalList, vacations, selectedMonth) {
  let todayDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), today.date);
  list = shuffle([...list]);

  let eligibleAnesthesiologists = list.filter(a => {
    let notInConstraints = !constraints.includes(a);
    let notOnVacation = !isAnesthesiologistOnVacation(vacations, a, todayDate);
    return notInConstraints && notOnVacation;
  });

  // if no eligible anesthesiologists found reset to original list
  let attempts = 0;
  while (eligibleAnesthesiologists.length === 0 && attempts < 5) {
    eligibleAnesthesiologists = originalList.filter(a => {
      let notInYesterdaysCalls = a !== yesterday.firstCall && a !== yesterday.secondCall;
      let notOnVacation = !isAnesthesiologistOnVacation(vacations, a, todayDate);
      return notInYesterdaysCalls && notOnVacation;
    });
    attempts++;
  }

  // If no eligible anesthesiologists found after multiple attempts, reset the list and try again
  if (eligibleAnesthesiologists.length === 0) {
    eligibleAnesthesiologists = [...originalList];
    eligibleAnesthesiologists = eligibleAnesthesiologists.filter(a => !isAnesthesiologistOnVacation(vacations, a, todayDate));
  }

  const chosen = eligibleAnesthesiologists[0];
  return chosen;
}

function isAnesthesiologistOnVacation(vacations, anesthesiologistId, date) {
  return vacations.some(vacation => {
    let start = new Date(vacation.startDate);
    let end = new Date(vacation.endDate);
    return vacation.anesthesiologist === anesthesiologistId && date >= start && date <= end;
  });
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
  const currentDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  return vacations.filter(vacation => {
    const start = new Date(new Date(vacation.startDate).getFullYear(), new Date(vacation.startDate).getMonth(), new Date(vacation.startDate).getDate());
    const end = new Date(new Date(vacation.endDate).getFullYear(), new Date(vacation.endDate).getMonth(), new Date(vacation.endDate).getDate());
    return currentDate >= start && currentDate <= end;
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


