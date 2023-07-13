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
        style={{ height: "150vh" }}
        date={currentDate}
        onNavigate={handleNavigate}
        popup
      />
    </div>
  );
};


const mapStateToProps = state => {
  console.log("State in ScheduleCalendar mapStateToProps: ", state);

  let schedulesByDate = groupBy(state.schedule.schedules, 'on_call_date');
  let previousFirstCall = null;

  schedulesByDate = Object.keys(schedulesByDate).sort().reduce(
    (obj, key) => { 
      obj[key] = schedulesByDate[key]; 
      return obj;
    }, 
    {}
  );

  const regularEvents = Object.values(schedulesByDate).flatMap((schedulesForOneDay) => {
    let onCallAnesthesiologists = new Set();

    return schedulesForOneDay.reduce((events, schedule, index) => {
      const [year, month, day] = schedule.on_call_date.split("-");
      const date = new Date(year, month - 1, day);

      if (!isOnVacation(date, schedule.anesthesiologist, state.vacations) &&
          !(index === 0 && previousFirstCall && previousFirstCall === schedule.anesthesiologist && date.getDay() !== 0) &&
          !isAlreadyOnCall(schedule.anesthesiologist, onCallAnesthesiologists)) {
        const event = {
          title: schedule.anesthesiologist,
          callNumber: index + 1,
          start: date,
          end: new Date(year, month - 1, day),
          allDay: true,
        };
        events.push(event);
        onCallAnesthesiologists.add(schedule.anesthesiologist);
      }

      if (index === 0) {
        previousFirstCall = schedule.anesthesiologist;
      }

      return events;
    }, []).sort((a, b) => a.callNumber - b.callNumber);
  });

  const events = [...regularEvents].sort((a, b) => a.start - b.start);
  const callCounts = countCalls(events);

  return { events, vacations: state.vacations, firstCallAssignments: state.schedule.firstCallAssignments };
};

function isOnVacation(date, anesthesiologist, vacations) {
  const dateStr = formatDate(date);
  return vacations.some(vacation => {
    const adjustedStartDate = new Date(vacation.startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);

    const adjustedEndDate = new Date(new Date(vacation.endDate).getTime() + 24 * 60 * 60 * 1000);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    return (
      vacation.anesthesiologist === anesthesiologist && 
      formatDate(adjustedStartDate) <= dateStr && 
      dateStr < formatDate(adjustedEndDate)
    );
  });
}

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;

  return [year, month, day].join('-');
}

function isAlreadyOnCall(anesthesiologist, onCallAnesthesiologists) {
  return onCallAnesthesiologists.has(anesthesiologist);
}

export default connect(mapStateToProps)(ScheduleCalendar);
