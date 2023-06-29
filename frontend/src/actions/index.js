import axios from 'axios';
import { FETCH_ANESTHESIOLOGISTS, ADD_ANESTHESIOLOGIST, SET_SCHEDULES, FETCH_SCHEDULES, SET_FIRST_CALL, SET_SELECTED_DATE } from './types';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchAnesthesiologists = () => async (dispatch) => {
  const response = await axios.get(`${API_URL}/anesthesiologists`);
  dispatch({ type: FETCH_ANESTHESIOLOGISTS, payload: response.data });
};

export const generateRandomSchedule = (selectedMonth) => (dispatch, getState) => {
  console.log('Selected Month: ', selectedMonth);

  const anesthesiologists = getState().anesthesiologist;
  const vacations = getState().vacations;

  let firstCallAssignments = getState().schedule.firstCallAssignments;

  console.log(anesthesiologists);

  const schedules = [];

  const totalDays = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate(); 

  let previousFirstCall = null;
  let previousSecondCall = null;
  let previousThirdCall = null;

  let firstCallAssignmentsMap = {};

  let firstCallOfWeek = [];
  let weekendCallAnesthesiologists = [];
  let eligibleAnesthesiologists = [];
  let weekendQueue = [...anesthesiologists];

  let weekendCounts = anesthesiologists.reduce((acc, curr) => {
    acc[curr] = { count: 0, dates: [] };
    return acc;
  }, {});

  let weekendHistory = anesthesiologists.reduce((acc, curr) => {
    acc[curr] = null;
    return acc;
  }, {});

  let lastWeekendOnCall = anesthesiologists.reduce((acc, curr) => {
    acc[curr] = null;
    return acc;
  }, {});

  const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);

  let sundayFirstCall = null;

  for (let i = 0; i < totalDays; i++) {
    let preserveFirstCall = false;
    if (date.getDay() === 0) {
      sundayFirstCall = previousFirstCall;
    }
    if (date.getDay() === 1) {
      firstCallOfWeek = [];
    }

    const isWeekday = date.getDay() >= 1 && date.getDay() <= 5;

    let firstCallAssignment;
    if (firstCallAssignments) {
      console.log(`generateRandomSchedule - firstCallAssignments: ${JSON.stringify(firstCallAssignments)}`);
      let firstCallAssignment = firstCallAssignments.find(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate.getDate() === date.getDate() &&
          assignmentDate.getMonth() === date.getMonth() &&
          assignmentDate.getFullYear() === date.getFullYear();
      });
      if (firstCallAssignment) {
        if (firstCallAssignmentsMap[firstCallAssignment.date]) {
          console.warn(`Duplicate first call assignment found for date ${firstCallAssignment.date}`);
          firstCallAssignment = null;
        } else {
          firstCallAssignmentsMap[firstCallAssignment.date] = firstCallAssignment;
          firstCallAssignments = firstCallAssignments.filter(assignment => assignment !== firstCallAssignment);
        }
      }
    }
    
    let onCallAnesthesiologists = [];

    console.log('vacations', vacations);
    console.log('anesthesiologists' , anesthesiologists);
    eligibleAnesthesiologists = anesthesiologists.filter(anesthesiologist => {
      const isOnVacation = vacations.some(vacation => {
        return vacation.anesthesiologist === anesthesiologist &&
              new Date(vacation.startDate) <= date &&
              new Date(vacation.endDate) >= date;
      });
      return !isOnVacation;
    });

    if (i !== 0) {
      // Adding condition to exclude anesthesiologists that were first or second call the previous day
      const tomorrowFirstCallAssignment = firstCallAssignments.find(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate.getDate() === date.getDate() + 1 &&
          assignmentDate.getMonth() === date.getMonth() &&
          assignmentDate.getFullYear() === date.getFullYear();
      });
      
      if (tomorrowFirstCallAssignment || i !== 0) {
        eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist =>
          (!tomorrowFirstCallAssignment || anesthesiologist !== tomorrowFirstCallAssignment.anesthesiologist) &&
          anesthesiologist !== previousFirstCall && anesthesiologist !== previousSecondCall
        );
      }
    }

    if (isWeekday) {
      if (date.getDay() === 1) { // If it's Monday
        if(firstCallAssignment && eligibleAnesthesiologists.includes(firstCallAssignment.anesthesiologist)){
          eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => anesthesiologist !== firstCallAssignment.anesthesiologist);
          eligibleAnesthesiologists.unshift(firstCallAssignment.anesthesiologist);
        } else {
          eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => anesthesiologist !== sundayFirstCall);
          eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => anesthesiologist !== previousSecondCall).concat(previousSecondCall ? [previousSecondCall] : []);
        }
      } else {
        // For other weekdays, remove the previous day's first and second call from the eligible list
        eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => 
          anesthesiologist !== previousFirstCall &&
          anesthesiologist !== previousSecondCall
        );
      }      

      eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => {
        return anesthesiologist !== previousSecondCall && anesthesiologist !== previousThirdCall;
      });

      // If there is a first call assignment and the assigned anesthesiologist is eligible
      let firstCallAnesthesiologist = null;

      if (firstCallAssignment) {
        firstCallAnesthesiologist = eligibleAnesthesiologists.find(anesthesiologist => anesthesiologist === firstCallAssignment.anesthesiologist);
        
        if (firstCallAnesthesiologist) {
          eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => anesthesiologist !== firstCallAnesthesiologist);
          preserveFirstCall = true;
        }
      }

      // Shuffle the remaining eligible anesthesiologists
      for (let i = eligibleAnesthesiologists.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [eligibleAnesthesiologists[i], eligibleAnesthesiologists[j]] = [eligibleAnesthesiologists[j], eligibleAnesthesiologists[i]];
      }

      // Add the shuffled eligible anesthesiologists to the onCall list
      onCallAnesthesiologists.push(...eligibleAnesthesiologists);

      // Add the assigned first call anesthesiologist at the start of the onCall list
      if (firstCallAnesthesiologist) {
        onCallAnesthesiologists.unshift(firstCallAnesthesiologist);
      }

      if(previousThirdCall && anesthesiologists.includes(previousThirdCall)) {
        onCallAnesthesiologists.push(previousThirdCall);
      }
      
      if(previousSecondCall && anesthesiologists.includes(previousSecondCall)) {
        onCallAnesthesiologists.push(previousSecondCall);
      }

      // Swap first call if anesthesiologist is scheduled for the second time during the week
      if (!preserveFirstCall) {
        if (!preserveFirstCall && firstCallOfWeek.includes(onCallAnesthesiologists[0])) {
          const replacement = onCallAnesthesiologists.find((anesthesiologist, index) => {
            return !firstCallOfWeek.includes(anesthesiologist) && index > 0;
          });

        if (replacement) {
          const replacementIndex = onCallAnesthesiologists.indexOf(replacement);
          [onCallAnesthesiologists[0], onCallAnesthesiologists[replacementIndex]] = [onCallAnesthesiologists[replacementIndex], onCallAnesthesiologists[0]];
        } else { // If there's no suitable replacement
          // Find any anesthesiologist who is not in the last or second to last call positions
          const anyReplacement = onCallAnesthesiologists.find((anesthesiologist, index) => {
            return index > 0 && index < onCallAnesthesiologists.length - 2;
          });

          if (anyReplacement) {
            const replacementIndex = onCallAnesthesiologists.indexOf(anyReplacement);
            [onCallAnesthesiologists[0], onCallAnesthesiologists[replacementIndex]] = [onCallAnesthesiologists[replacementIndex], onCallAnesthesiologists[0]];
          }
        }
      }
    }

      firstCallOfWeek.push(onCallAnesthesiologists[0]);

      // Check if first call assignment was not correctly assigned due to weekend call
      if (firstCallAssignment) {
        const firstCallAnesthesiologist = onCallAnesthesiologists.find(anesthesiologist => anesthesiologist === firstCallAssignment.anesthesiologist);
        if (firstCallAnesthesiologist) {
          const index = onCallAnesthesiologists.indexOf(firstCallAnesthesiologist);
          if (index > -1) {
            [onCallAnesthesiologists[0], onCallAnesthesiologists[index]] = [onCallAnesthesiologists[index], onCallAnesthesiologists[0]];
          }
        } else {
          console.warn(`Could not find assigned first call anesthesiologist ${firstCallAssignment.anesthesiologist} in list of on-call anesthesiologists for ${firstCallAssignment.date}`);
        }
      }

      if(date.getDay() === 5) { // If it's Friday
        const upcomingSaturdayFirstCall = eligibleAnesthesiologists[0]; 
        onCallAnesthesiologists = onCallAnesthesiologists.filter(anesthesiologist => anesthesiologist !== upcomingSaturdayFirstCall);
        onCallAnesthesiologists.splice(onCallAnesthesiologists.length - 1, 0, upcomingSaturdayFirstCall);
      }
    } else {
      if (date.getDay() === 6) {  // It's a Saturday
          eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => {
              if (lastWeekendOnCall[anesthesiologist] !== null) {
                  const daysSinceLastWeekend = Math.round((date.getTime() - lastWeekendOnCall[anesthesiologist].getTime()) / (1000 * 60 * 60 * 24));
                  return daysSinceLastWeekend > 7;
              }
              return true;
          });
  
          if (eligibleAnesthesiologists.length < 2) {
              eligibleAnesthesiologists = [...anesthesiologists]; 
              eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => {
                  const isOnVacation = vacations.some(vacation => {
                      return vacation.anesthesiologist === anesthesiologist &&
                          new Date(vacation.startDate) <= date &&
                          new Date(vacation.endDate) >= date;
                  });
                  return !isOnVacation;
              });
          }
  
          // Assign two anesthesiologists for first and second calls randomly
          while (onCallAnesthesiologists.length < 2) {
              const randomAnesthesiologist = eligibleAnesthesiologists[Math.floor(Math.random() * eligibleAnesthesiologists.length)];
              if (!onCallAnesthesiologists.includes(randomAnesthesiologist)) {
                  onCallAnesthesiologists.unshift(randomAnesthesiologist);
              }
          }
  
          onCallAnesthesiologists.forEach((anesthesiologist, index) => {
              if (index < 2) {
                  if (!weekendCounts[anesthesiologist]) {
                      weekendCounts[anesthesiologist] = {
                          count: 0,
                          dates: [],
                      };
                  }
                  weekendCounts[anesthesiologist].count += 1;
                  weekendCounts[anesthesiologist].dates.push(date.toISOString().split('T')[0]);
                  weekendHistory[anesthesiologist] = date.toISOString().split('T')[0];
                  lastWeekendOnCall[anesthesiologist] = date;
              }
          });
  
          // If all anesthesiologists have been scheduled for a weekend, reset the queue
          if (weekendQueue.length === 0) {
              weekendQueue = [...anesthesiologists];
          }
      } 
      else if (date.getDay() === 0) { // It's a Sunday
          onCallAnesthesiologists = [previousSecondCall, previousFirstCall];
          sundayFirstCall = onCallAnesthesiologists[0];
      }
  }
  
    onCallAnesthesiologists.forEach((anesthesiologist, index) => {
      const callType = index === 0 ? 'first' : (index === 1 ? 'second' : 'third');
      schedules.push({
        anesthesiologist: anesthesiologist,
        on_call_date: date.toISOString().split('T')[0],
        call_type: callType,
      });
    });

    previousFirstCall = onCallAnesthesiologists[0];
    previousSecondCall = onCallAnesthesiologists[1];
    previousThirdCall = onCallAnesthesiologists[2];

    date.setDate(date.getDate() + 1);
  }

  let callCounts = tallyCalls(schedules);
  console.log('callCounts: ', callCounts);

  balanceCalls(schedules, callCounts, firstCallAssignments);

  dispatch({
    type: 'SET_CALL_COUNTS',
    payload: callCounts,
  });
  console.log("This is the callCounts: ", callCounts);
  console.log("This is the index.js schedules: ", schedules);
  dispatch({ type: 'SET_SCHEDULES', payload: schedules });
};


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

export const setFirstCall = (anesthesiologistId, date) => {
  console.log(`setFirstCall in actions index.js - anesthesiologistId: ${anesthesiologistId}, date: ${date}`);
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

function balanceCalls(schedules, callCounts, firstCallAssignment) {
  function balanceCallType(callType) {
    let anesthesiologists = Object.keys(callCounts);
    for (let i = 0; i < anesthesiologists.length; i++) {
      let anesthesiologist = anesthesiologists[i];

      if (firstCallAssignment && firstCallAssignment.anesthesiologist === anesthesiologist) {
        continue;
      }

      if (callCounts[anesthesiologist][callType] > 4) {
        for (let j = 0; j < schedules.length; j++) {
          if (schedules[j].anesthesiologist === anesthesiologist && schedules[j].call_type === callType) {
            for (let k = 0; k < anesthesiologists.length; k++) {
              let replacement = anesthesiologists[k];
              if (callCounts[replacement][callType] < 4 && schedules.some(s => s.on_call_date === schedules[j].on_call_date && s.call_type === 'third' && s.anesthesiologist === replacement)) {
                let replacementScheduleIndex = schedules.findIndex(s => s.on_call_date === schedules[j].on_call_date && s.call_type === 'third' && s.anesthesiologist === replacement);
                schedules[j].anesthesiologist = replacement;
                schedules[replacementScheduleIndex].anesthesiologist = anesthesiologist;

                callCounts[anesthesiologist][callType]--;
                callCounts[replacement][callType]++;

                if(callType === 'first') {
                  let nextDay = new Date(schedules[j].on_call_date);
                  nextDay.setDate(nextDay.getDate() + 1);
                  let nextDayStr = nextDay.toISOString().split('T')[0];

                  let nextDaySchedules = schedules.filter(s => s.on_call_date === nextDayStr);
                  for (let l = 0; l < nextDaySchedules.length; l++) {
                    if (nextDaySchedules[l].anesthesiologist === replacement) {
                      nextDaySchedules[l].anesthesiologist = '';
                    }
                    if (nextDaySchedules[l].anesthesiologist === '' && anesthesiologist !== firstCallAssignment.anesthesiologist) {
                      nextDaySchedules[l].anesthesiologist = anesthesiologist;
                    }
                  }
                }

                break;
              }
            }
          }
        }
      }
    }
  }
  balanceCallType('first');
  balanceCallType('second');
}
