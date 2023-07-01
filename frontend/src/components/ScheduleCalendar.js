import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Calendar, globalizeLocalizer } from 'react-big-calendar';
import globalize from 'globalize';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { groupBy } from 'lodash';
import './ScheduleCalendar.css'; 

const localizer = globalizeLocalizer(globalize);

function countCalls(events) {
  let callCounts = {};

  events.forEach((event) => {
    let anesthesiologist = event.title;
    let callType = event.callNumber;

    if (!callCounts.hasOwnProperty(anesthesiologist)) {
      callCounts[anesthesiologist] = { first: 0, second: 0 };
    }
    if (callType === 1) {
      callCounts[anesthesiologist].first++;
    } else if (callType === 2) {
      callCounts[anesthesiologist].second++;
    }
  });

  return callCounts;
}

function balanceCalls(schedules, callCounts, firstCallAssignment) {
  console.log('Balancing calls with schedules: ', schedules, ' and callCounts: ', callCounts);
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

const ScheduleCalendar = ({ events, selectedDate }) => {
  const [currentDate, setCurrentDate] = React.useState(() => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    return date;
  });

  useEffect(() => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setCurrentDate(date);
  }, [selectedDate]);

  const handleNavigate = (date) => {
    console.log('Date from handleNavigate: ', date);
    setCurrentDate(date);
  };

  console.log('Rendered ScheduleCalendar with props:', { events, selectedDate });
  console.log('Calendar component events', events);
  return (
    <div>
      <Calendar
        key={currentDate}
        localizer={localizer}
        events={events}
        style={{ height: "125vh" }}
        date={currentDate}
        onNavigate={handleNavigate}
        popupOffset={{y: 10000}}
      />
    </div>
  );
};


const mapStateToProps = state => {
  console.log("State in ScheduleCalendar mapStateToProps: ", state);
  const schedulesByDate = groupBy(state.schedule.schedules, 'on_call_date');
  const regularEvents = Object.values(schedulesByDate).flatMap((schedulesForOneDay, index) => {
    schedulesForOneDay.sort((a, b) => {
      const isAOnFirstCall = state.schedule.firstCallAssignments.some(assignment =>
        assignment.date === a.on_call_date &&
        assignment.anesthesiologistId === a.anesthesiologist
      );

      const isBOnFirstCall = state.schedule.firstCallAssignments.some(assignment =>
        assignment.date === b.on_call_date &&
        assignment.anesthesiologistId === b.anesthesiologist
      );

      if (isAOnFirstCall && !isBOnFirstCall) {
        return -1;
      } else if (!isAOnFirstCall && isBOnFirstCall) {
        return 1;
      } else {
        return 0;
      }
    });

    return schedulesForOneDay.map((schedule, index) => {
      const [year, month, day] = schedule.on_call_date.split("-");
      const event = {
        title: schedule.anesthesiologist,
        callNumber: index + 1,
        start: new Date(year, month - 1, day),
        end: new Date(year, month - 1, day),
        allDay: true,
      };

      return event;
    }).sort((a, b) => a.callNumber - b.callNumber);
  });

  const events = [...regularEvents].sort((a, b) => a.start - b.start);
  const callCounts = countCalls(events);

  console.log('Call counts before balance: ', callCounts);

  balanceCalls(state.schedule.schedules, callCounts, state.schedule.firstCallAssignments);

  console.log('Call counts after balance: ', callCounts);

  return { events, vacations: state.vacations, firstCallAssignments: state.schedule.firstCallAssignments };

};

export default connect(mapStateToProps)(ScheduleCalendar);
