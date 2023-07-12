import axios from 'axios';
import { FETCH_ANESTHESIOLOGISTS, ADD_ANESTHESIOLOGIST, SET_SCHEDULES, FETCH_SCHEDULES, SET_FIRST_CALL, SET_SELECTED_DATE, EDIT_VACATION, DELETE_VACATION } from './types';
import { CLEAR_ANESTHESIOLOGIST_DATA, CLEAR_VACATION_DATA, CLEAR_FIRST_CALL_DATA } from './types';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchAnesthesiologists = () => async (dispatch) => {
  const response = await axios.get(`${API_URL}/anesthesiologists`);
  dispatch({ type: FETCH_ANESTHESIOLOGISTS, payload: response.data });
};

export const generateRandomSchedule = (selectedMonth) => (dispatch, getState) => {
  console.log('Selected Month: ', selectedMonth);
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;


  const anesthesiologists = getState().anesthesiologist;
  const vacations = getState().vacations;

  // If the list of anesthesiologists is empty, dispatch an empty schedule
  if (!anesthesiologists || anesthesiologists.length === 0) {
    console.log("No anesthesiologists available. Dispatching an empty schedule.");
    dispatch({ type: 'SET_SCHEDULES', payload: [] });

    const emptyCounts = emptyCallCounts(anesthesiologists);
    dispatch({ type: 'SET_CALL_COUNTS', payload: emptyCounts });
    
    return;
  }

  let firstCallAssignments = getState().schedule.firstCallAssignments;

  console.log(anesthesiologists);

  const schedules = [];

  const totalDays = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate(); 

  let previousFirstCall = null;
  let previousSecondCall = null;
  let previousThirdCall = null;

  let firstCallAssignmentsMap = {};
  let onCallAnesthesiologistsPerDay = new Set();

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

  let firstCallAssignmentsObj = {};
  firstCallAssignments.forEach(assignment => {
    const assignmentDate = new Date(assignment.date);
    const dateKey = assignmentDate.toISOString().split('T')[0];
    firstCallAssignmentsObj[dateKey] = assignment;
  });

  for (let i = 0; i < totalDays; i++) {
    let preserveFirstCall = false;
    if (date.getDay() === 0) {
      sundayFirstCall = previousFirstCall;
    }
    if (date.getDay() === 1) {
      firstCallOfWeek = [];
    }

     const dateKey = date.toISOString().split('T')[0];
    
     if (firstCallAssignmentsObj[dateKey]) {
      const firstCallAssignment = firstCallAssignmentsObj[dateKey];
      schedules.push({
        anesthesiologist: firstCallAssignment.anesthesiologistId,
        on_call_date: dateKey,
        call_type: 'first',
      });
      eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => anesthesiologist !== firstCallAssignment.anesthesiologistId);
      onCallAnesthesiologistsPerDay.add(firstCallAssignment.anesthesiologistId);
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
    
    let tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1); 

    eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => !onCallAnesthesiologistsPerDay.has(anesthesiologist));

    if (i !== 0) {
      const todayFirstCallAssignment = firstCallAssignments.find(assignment => {
        const assignmentDate = new Date(assignment.date);
        return assignmentDate.getDate() === date.getDate() &&
          assignmentDate.getMonth() === date.getMonth() &&
          assignmentDate.getFullYear() === date.getFullYear();
      });
    
      if (todayFirstCallAssignment || i !== 0) {
        eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist =>
          (!todayFirstCallAssignment || anesthesiologist !== todayFirstCallAssignment.anesthesiologist) &&
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
        eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => 
          anesthesiologist !== previousFirstCall &&
          anesthesiologist !== previousSecondCall
        );
      }      

      eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => {
        return anesthesiologist !== previousSecondCall && anesthesiologist !== previousThirdCall;
      });

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
        const nextDayKey = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if(!firstCallAssignmentsObj[nextDayKey] || (firstCallAssignmentsObj[nextDayKey] && firstCallAssignmentsObj[nextDayKey].anesthesiologist !== previousThirdCall)){
            onCallAnesthesiologists.push(previousThirdCall);
        }
    }
      
    if(previousSecondCall && anesthesiologists.includes(previousSecondCall)) {
        const nextDayKey = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if(!firstCallAssignmentsObj[nextDayKey] || (firstCallAssignmentsObj[nextDayKey] && firstCallAssignmentsObj[nextDayKey].anesthesiologist !== previousSecondCall)){
            onCallAnesthesiologists.push(previousSecondCall);
        }
    }
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
              const isOnVacationToday = vacations.some(vacation => {
                return vacation.anesthesiologist === anesthesiologist &&
                    new Date(vacation.startDate) <= date &&
                    new Date(vacation.endDate) >= date;
              });
              const tomorrow = new Date(date);
              tomorrow.setDate(date.getDate() + 1);
              const isOnVacationTomorrow = vacations.some(vacation => {
                return vacation.anesthesiologist === anesthesiologist &&
                    new Date(vacation.startDate) <= tomorrow &&
                    new Date(vacation.endDate) >= tomorrow;
              });
              return !isOnVacationToday && !isOnVacationTomorrow;
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
  
    if (callType === 'first') {
      const secondOrThirdCallDayBefore = schedules.some(schedule => 
        new Date(schedule.on_call_date).getTime() === new Date(date.getTime() - ONE_DAY_IN_MS).getTime() &&
        (schedule.call_type === 'second' || schedule.call_type === 'third') &&
        schedule.anesthesiologist === anesthesiologist
      );
      if (secondOrThirdCallDayBefore) {
        return;
      }
  
      const firstCallExists = schedules.some(schedule => 
        schedule.on_call_date === date.toISOString().split('T')[0] && 
        schedule.call_type === 'first'
      );
  
      if (firstCallExists) {
        return;
      }
    }
    
    else {
      const firstCallNextDay = schedules.some(schedule => 
        new Date(schedule.on_call_date).getTime() === new Date(date.getTime() + ONE_DAY_IN_MS).getTime() &&
        schedule.call_type === 'first' &&
        schedule.anesthesiologist === anesthesiologist
      );
  
      if (firstCallNextDay) {
        return;
      }
    }
  
    schedules.push({
      anesthesiologist: anesthesiologist,
      on_call_date: date.toISOString().split('T')[0],
      call_type: callType,
    });
  });
  


    onCallAnesthesiologistsPerDay.clear();

    previousFirstCall = onCallAnesthesiologists[0];
    previousSecondCall = onCallAnesthesiologists[1];
    previousThirdCall = onCallAnesthesiologists[2];

    date.setDate(date.getDate() + 1);
  }

  let schedulesCopy = [...schedules];

  schedulesCopy.forEach((schedule, index) => {
    if (schedule.call_type !== 'first') {
      return;
    }

    let duplicateIndex = schedules.findIndex(dupSchedule =>
      dupSchedule.call_type === 'third' &&
      dupSchedule.anesthesiologist === schedule.anesthesiologist &&
      dupSchedule.on_call_date === schedule.on_call_date
    );

    if (duplicateIndex !== -1) {
      schedules.splice(duplicateIndex, 1);
    }
  });

  let callCounts = tallyCalls(schedules);
  console.log('callCounts: ', callCounts);
  console.log("This is the index.js schedules before balancing: ", schedules);
  firstCallAssignments = getState().schedule.firstCallAssignments;
  console.log("This is the first call assignments going into balance calls ", firstCallAssignments);
  balanceCalls(schedules, callCounts, firstCallAssignments);
  console.log("This is the schedule after balancing ", schedules);
  callCounts = tallyCalls(schedules);

  for (let i = 0; i < schedules.length; i++) {
    const currentSchedule = schedules[i];
    const currentDate = new Date(currentSchedule.on_call_date);
    const dayOfWeek = currentDate.getUTCDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const previousDay = new Date(currentDate.getTime() - ONE_DAY_IN_MS);
      const previousDayStr = previousDay.toISOString().split('T')[0];

      const previousFirstCall = schedules.find(schedule =>
        schedule.on_call_date === previousDayStr &&
        schedule.call_type === 'first' &&
        schedule.anesthesiologist === currentSchedule.anesthesiologist
      );

      if (previousFirstCall) {
        schedules.splice(i, 1);
        i--;
      }
    }
  }

  for (let i = 0; i < schedules.length; i++) {
    const currentSchedule = schedules[i];
    const currentDate = new Date(currentSchedule.on_call_date);
    const dayOfWeek = currentDate.getUTCDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // get currently scheduled anesthesiologists
      const scheduledAnesthesiologists = schedules
        .filter(schedule => schedule.on_call_date === currentSchedule.on_call_date)
        .map(schedule => schedule.anesthesiologist);
      
      // filter out anesthesiologists on vacation or first call the day prior
      const eligibleAnesthesiologists = [...anesthesiologists]
      .filter(anesthesiologist =>
        !vacations.some(vacation => {
          const vacationStartDate = new Date(vacation.startDate);
          const vacationEndDate = new Date(vacation.endDate);
          return vacation.anesthesiologist === anesthesiologist &&
            (
              vacationStartDate.getUTCFullYear() < currentDate.getUTCFullYear() ||
              (vacationStartDate.getUTCFullYear() === currentDate.getUTCFullYear() && vacationStartDate.getUTCMonth() < currentDate.getUTCMonth()) ||
              (vacationStartDate.getUTCFullYear() === currentDate.getUTCFullYear() && vacationStartDate.getUTCMonth() === currentDate.getUTCMonth() && vacationStartDate.getUTCDate() <= currentDate.getUTCDate())
            ) &&
            (
              vacationEndDate.getUTCFullYear() > currentDate.getUTCFullYear() ||
              (vacationEndDate.getUTCFullYear() === currentDate.getUTCFullYear() && vacationEndDate.getUTCMonth() > currentDate.getUTCMonth()) ||
              (vacationEndDate.getUTCFullYear() === currentDate.getUTCFullYear() && vacationEndDate.getUTCMonth() === currentDate.getUTCMonth() && vacationEndDate.getUTCDate() >= currentDate.getUTCDate())
            );
        }) && 
          !schedules.some(schedule =>
            schedule.anesthesiologist === anesthesiologist &&
            new Date(schedule.on_call_date).getTime() === new Date(currentDate.getTime() - ONE_DAY_IN_MS).getTime() &&
            schedule.call_type === 'first'
          )
        );
        
      for (let anesthesiologist of eligibleAnesthesiologists) {
        if (!scheduledAnesthesiologists.includes(anesthesiologist)) {
          const isOnVacation = vacations.some(vacation =>
            vacation.anesthesiologist === anesthesiologist &&
            new Date(vacation.startDate) <= currentDate &&
            new Date(vacation.endDate) >= currentDate
          );
          if (!isOnVacation) {
            schedules.push({
              anesthesiologist: anesthesiologist,
              on_call_date: currentDate.toISOString().split('T')[0],
              call_type: 'third',
            });
          }
        }
      }
    }
  }

  for (let i = 0; i < schedules.length; i++) {
    const currentSchedule = schedules[i];
    const currentDate = new Date(currentSchedule.on_call_date);

    const isOnVacation = vacations.some(vacation => {
      const vacationStartDate = new Date(vacation.startDate);
      const vacationEndDate = new Date(vacation.endDate);
      return vacation.anesthesiologist === currentSchedule.anesthesiologist &&
        (
          vacationStartDate.getUTCFullYear() < currentDate.getUTCFullYear() ||
          (vacationStartDate.getUTCFullYear() === currentDate.getUTCFullYear() && vacationStartDate.getUTCMonth() < currentDate.getUTCMonth()) ||
          (vacationStartDate.getUTCFullYear() === currentDate.getUTCFullYear() && vacationStartDate.getUTCMonth() === currentDate.getUTCMonth() && vacationStartDate.getUTCDate() <= currentDate.getUTCDate())
        ) &&
        (
          vacationEndDate.getUTCFullYear() > currentDate.getUTCFullYear() ||
          (vacationEndDate.getUTCFullYear() === currentDate.getUTCFullYear() && vacationEndDate.getUTCMonth() > currentDate.getUTCMonth()) ||
          (vacationEndDate.getUTCFullYear() === currentDate.getUTCFullYear() && vacationEndDate.getUTCMonth() === currentDate.getUTCMonth() && vacationEndDate.getUTCDate() >= currentDate.getUTCDate())
        );
    });

    if (isOnVacation) {
      schedules.splice(i, 1);
      i--;
    }
}

// Update call counts after processing day-off after 'first' calls
callCounts = tallyCalls(schedules);

dispatch({
  type: 'SET_CALL_COUNTS',
  payload: callCounts,
});
dispatch({ type: 'SET_SCHEDULES', payload: schedules });
};


export const fetchSchedules = () => async (dispatch) => {
  dispatch({ type: FETCH_SCHEDULES });

  const response = await axios.get(`${API_URL}/schedules`);
  dispatch({ type: SET_SCHEDULES, payload: response.data });
};

export const ADD_VACATION = 'ADD_VACATION';

export const addVacation = (anesthesiologist, startDate, endDate) => {
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setDate(adjustedEndDate.getDate());
  
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

function balanceCalls(schedules, callCounts, firstCallAssignments) {
  let changeMade = true;
  
  while(changeMade) {
    changeMade = false;
    
    balanceCallType('first');
    balanceCallType('second');
  }
  
  function balanceCallType(callType) {
    let anesthesiologists = Object.keys(callCounts);

    for (let i = 0; i < anesthesiologists.length; i++) {
      let anesthesiologist = anesthesiologists[i];

      let minCallCount = Math.min(...anesthesiologists.map(a => callCounts[a][callType]));
      let maxCallCount = Math.max(...anesthesiologists.map(a => callCounts[a][callType]));
      let difference = maxCallCount - minCallCount;
      
      if (difference > 1 && callCounts[anesthesiologist][callType] === maxCallCount) {
        for (let j = 0; j < schedules.length; j++) {
          if (schedules[j].anesthesiologist === anesthesiologist && schedules[j].call_type === callType) {
            if (isWeekend(schedules[j].on_call_date)) {
              continue;
            }

            for (let k = 0; k < anesthesiologists.length; k++) {
              let replacement = anesthesiologists[k];

              if (callCounts[replacement][callType] === minCallCount && 
                  schedules.some(s => s.on_call_date === schedules[j].on_call_date && 
                                      s.call_type === 'third' && 
                                      s.anesthesiologist === replacement &&
                                      !isWeekend(s.on_call_date))) {
                let replacementScheduleIndex = schedules.findIndex(s => s.on_call_date === schedules[j].on_call_date && 
                  s.call_type === 'third' && s.anesthesiologist === replacement);
                
                let hasFirstCallAssignment = firstCallAssignments.some(a => a.anesthesiologistId === anesthesiologist && 
                  a.date === schedules[j].on_call_date);
                
                let replacementHasFirstCallAssignment = firstCallAssignments.some(a => a.anesthesiologistId === replacement && 
                  a.date === schedules[j].on_call_date);

                if (!hasFirstCallAssignment && !replacementHasFirstCallAssignment) {
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
                      if (nextDaySchedules[l].anesthesiologist === '' && anesthesiologist !== firstCallAssignments.anesthesiologist) {
                        nextDaySchedules[l].anesthesiologist = anesthesiologist;
                      }
                    }
                  }
                  changeMade = true;
                  break;
                }
              }
            }
            if (changeMade) {
              break;
            }
          }
        }
        if (changeMade) {
          break;
        }
      }
    }
  }
}

function isWeekend(dateStr) {
  const date = new Date(dateStr + "T00:00:00Z");
  const dayOfWeek = date.getUTCDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

export const addAnesthesiologist = anesthesiologist => ({
  type: 'ADD_ANESTHESIOLOGIST',
  anesthesiologist,
});

export const editAnesthesiologist = (index, newAnesthesiologist) => ({
  type: 'EDIT_ANESTHESIOLOGIST',
  index,
  newAnesthesiologist,
});

export const deleteAnesthesiologist = index => ({
  type: 'DELETE_ANESTHESIOLOGIST',
  index,
});

export const editVacation = (index, newVacation) => dispatch => {
  dispatch({
    type: EDIT_VACATION,
    index,
    newVacation,
  });
};

export const deleteVacation = index => dispatch => {
  dispatch({
    type: DELETE_VACATION,
    index,
  });
};

export const editFirstCall = (index, updatedAssignment) => {
  return {
    type: 'EDIT_FIRST_CALL',
    index,
    updatedAssignment
  }
};

export const deleteFirstCall = (index) => {
  return {
    type: 'DELETE_FIRST_CALL',
    index
  }
};

export const clearMonthData = (month) => {
  console.log('Clear month data action dispatched with month:', month);
  return (dispatch) => {
    dispatch({ type: CLEAR_ANESTHESIOLOGIST_DATA, payload: month });
    dispatch({ type: CLEAR_VACATION_DATA, payload: month });
    dispatch({ type: CLEAR_FIRST_CALL_DATA, payload: month });
  };
};

function emptyCallCounts(anesthesiologists) {
  let callCounts = {};

  anesthesiologists.forEach((anesthesiologist) => {
    callCounts[anesthesiologist] = { first: 0, second: 0, remaining: 0, secondToLast: 0, last: 0 };
  });

  return callCounts;
}