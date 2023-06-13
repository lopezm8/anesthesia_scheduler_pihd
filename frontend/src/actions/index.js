import axios from 'axios';
import { FETCH_ANESTHESIOLOGISTS, ADD_ANESTHESIOLOGIST, SET_SCHEDULES, FETCH_SCHEDULES } from './types';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchAnesthesiologists = () => async (dispatch) => {
  const response = await axios.get(`${API_URL}/anesthesiologists`);
  dispatch({ type: FETCH_ANESTHESIOLOGISTS, payload: response.data });
};

export const generateRandomSchedule = (selectedMonth) => (dispatch, getState) => {
  console.log('Selected Month: ', selectedMonth);

  const anesthesiologists = getState().anesthesiologist;
  const vacations = getState().vacations;

  console.log(anesthesiologists);

  const schedules = [];

  const totalDays = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate(); 

  let previousFirstCall = null;
  let previousSecondCall = null;
  let previousThirdCall = null;

  let firstCallOfWeek = []; // Array to keep track of anesthesiologists who have been on first call during the week
  let weekendCallAnesthesiologists = []; // Array to keep track of anesthesiologists who have been on weekend call
  let eligibleAnesthesiologists = [];

  let weekendQueue = [...anesthesiologists]; // Make a copy of all anesthesiologists for the weekend queue

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
    if (date.getDay() === 0) { // If it's Sunday, update sundayFirstCall
      sundayFirstCall = previousFirstCall;
    }
    if (date.getDay() === 1) { // If it's Monday, reset the firstCallOfWeek list
      firstCallOfWeek = [];
    }

    const isWeekday = date.getDay() >= 1 && date.getDay() <= 5;

    let onCallAnesthesiologists = [];

    console.log('vacations', vacations);
    console.log('anesthesiologists' , anesthesiologists);
    // filter anesthesiologists not on vacation
    eligibleAnesthesiologists = anesthesiologists.filter(anesthesiologist => {
      const isOnVacation = vacations.some(vacation => {
        return vacation.anesthesiologist === anesthesiologist &&
              new Date(vacation.startDate) <= date &&
              new Date(vacation.endDate) >= date;
      });
      return !isOnVacation;
    });

    if (isWeekday) {
      if (date.getDay() === 1) { // If it's Monday
        console.log('Monday\'s date:', date, 'Sunday First Call:', sundayFirstCall);
        eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => anesthesiologist !== sundayFirstCall);
        // Reorder the list of eligibleAnesthesiologists so the secondCall from Sunday is last
        eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => anesthesiologist !== previousSecondCall).concat(previousSecondCall ? [previousSecondCall] : []);
      } else {
        eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => anesthesiologist !== previousFirstCall);
      }

      eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => {
        return anesthesiologist !== previousSecondCall && anesthesiologist !== previousThirdCall;
      });

       // Shuffle eligibleAnesthesiologists again before assigning to onCallAnesthesiologists
      for (let i = eligibleAnesthesiologists.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [eligibleAnesthesiologists[i], eligibleAnesthesiologists[j]] = [eligibleAnesthesiologists[j], eligibleAnesthesiologists[i]];
      }

      onCallAnesthesiologists = [...eligibleAnesthesiologists];

      if(previousThirdCall && anesthesiologists.includes(previousThirdCall)) {
        onCallAnesthesiologists.push(previousThirdCall);
      }
      
      if(previousSecondCall && anesthesiologists.includes(previousSecondCall)) {
        onCallAnesthesiologists.push(previousSecondCall);
      }

      // Swap first call if anesthesiologist is scheduled for the second time during the week
      if (firstCallOfWeek.includes(onCallAnesthesiologists[0])) {
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

      firstCallOfWeek.push(onCallAnesthesiologists[0]);

      if(date.getDay() === 5) { // If it's Friday
        // Get the upcoming Saturday first call anesthesiologist
        const upcomingSaturdayFirstCall = eligibleAnesthesiologists[0]; 
    
        // Move upcomingSaturdayFirstCall to the second to last position in the onCallAnesthesiologists array
        onCallAnesthesiologists = onCallAnesthesiologists.filter(anesthesiologist => anesthesiologist !== upcomingSaturdayFirstCall);
        onCallAnesthesiologists.splice(onCallAnesthesiologists.length - 1, 0, upcomingSaturdayFirstCall);
      }
    } else {
      if (date.getDay() === 6) {
        // It's a weekend
        eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => {
          // Check that anesthesiologist was not on call last weekend
          if (lastWeekendOnCall[anesthesiologist] !== null) {
            const daysSinceLastWeekend = Math.round((date.getTime() - lastWeekendOnCall[anesthesiologist].getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceLastWeekend > 7;
          }
          return true;
        });

        // Calculate the minimum count of weekend calls across all anesthesiologists
        const minWeekendCount = Math.min(...Object.values(weekendCounts).map(data => data.count));
        
        eligibleAnesthesiologists = eligibleAnesthesiologists.filter(anesthesiologist => {
          const anesWeekendData = weekendCounts[anesthesiologist];
      
          // Check if this anesthesiologist had a call in the last two weekends
          const recentWeekends = anesWeekendData.dates.filter(callDate => {
            const daysAgo = (date.getTime() - new Date(callDate).getTime()) / 1000 / 60 / 60 / 24;
            return daysAgo <= 14;
          });
      
          // Only consider this anesthesiologist if they have not had a call in the last two weekends,
          // or if all anesthesiologists have had recent weekend calls and this one has the fewest total calls
          return recentWeekends.length === 0 || anesWeekendData.count === minWeekendCount;
        });

        // Assign a weekend to an anesthesiologist from the queue
        let weekendAnesthesiologist = weekendQueue.find(anesthesiologist => eligibleAnesthesiologists.includes(anesthesiologist));

        // If no eligible anesthesiologists in queue, just pick the first eligible anesthesiologist
        if (!weekendAnesthesiologist) {
          weekendAnesthesiologist = eligibleAnesthesiologists[0];
        }

        onCallAnesthesiologists.forEach((anesthesiologist, index) => {
          if (index < 2) {
            weekendCounts[anesthesiologist].count += 1;
            weekendCounts[anesthesiologist].dates.push(date.toISOString().split('T')[0]);
            weekendHistory[anesthesiologist] = date.toISOString().split('T')[0];
          }
          if (index < 2) {
            lastWeekendOnCall[anesthesiologist] = date;
          }
        });

        onCallAnesthesiologists.push(weekendAnesthesiologist);
        weekendQueue = weekendQueue.filter(anesthesiologist => anesthesiologist !== weekendAnesthesiologist);

        // If all anesthesiologists have been scheduled for a weekend, reset the queue
        if (weekendQueue.length === 0) {
          weekendQueue = [...anesthesiologists];
        }

        // Assign two anesthesiologists for first and second calls randomly
        while (onCallAnesthesiologists.length < Math.min(2, eligibleAnesthesiologists.length)) {
          const randomAnesthesiologist = eligibleAnesthesiologists[Math.floor(Math.random() * eligibleAnesthesiologists.length)];
          if (!onCallAnesthesiologists.includes(randomAnesthesiologist)) {
            onCallAnesthesiologists.unshift(randomAnesthesiologist);
          }
        }

    onCallAnesthesiologists.forEach((anesthesiologist, index) => {
  if (index < 2) {
    // Initialize the object if it does not exist yet
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
    } else if (date.getDay() === 0) { // It's a Sunday
      onCallAnesthesiologists = [previousSecondCall, previousFirstCall];
      sundayFirstCall = onCallAnesthesiologists[0]; // Track Sunday's first call
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
  adjustedEndDate.setDate(adjustedEndDate.getDate());
  
  return {
    type: ADD_VACATION,
    anesthesiologist,
    startDate,
    endDate: adjustedEndDate.toISOString().split('T')[0],
  };
};
