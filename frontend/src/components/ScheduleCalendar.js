import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Calendar, globalizeLocalizer } from 'react-big-calendar';
import globalize from 'globalize';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { groupBy } from 'lodash';
import './ScheduleCalendar.css'; 


const localizer = globalizeLocalizer(globalize);

const ScheduleCalendar = ({ events, selectedDate, firstCallAssignments }) => {
  console.log('selected date ScheduleCalendar: ', selectedDate);
  console.log(events); // log the events prop here

  const [currentDate, setCurrentDate] = React.useState(() => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1); // add one day
    return date;
  });

  useEffect(() => {
    console.log('selected date ScheduleCalendar2: ', selectedDate);
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1); // add one day
    setCurrentDate(date);
  }, [selectedDate]);

  const handleNavigate = (date) => {
    setCurrentDate(date);
  };
  
  console.log('currentDate ScheduleCalendar.js: ', currentDate)
  
  return (
    <div>
      <Calendar
        key={currentDate}  // add this line
        localizer={localizer}
        events={events}
        style={{ height: "150vh" }}
        date={currentDate}
        onNavigate={handleNavigate}
      />
    </div>
  );
};


const mapStateToProps = state => {
  console.log(state);  // log the entire state

  // Group schedules by the on_call_date
  const schedulesByDate = groupBy(state.schedule.schedules, 'on_call_date'); // change from state.schedules to state.schedule.schedules

  // Map over each group and assign call numbers
  const events = Object.values(schedulesByDate).flatMap((schedulesForOneDay, index) => {
    return schedulesForOneDay.map((schedule, index) => {
      const [year, month, day] = schedule.on_call_date.split("-");
      return {
        title: schedule.anesthesiologist,
        callNumber: index + 1,
        start: new Date(year, month - 1, day),
        end: new Date(year, month - 1, day),
        allDay: true,
      };
    });    
  });

  return { events, vacations: state.vacations, firstCallAssignments: state.schedule.firstCallAssignments };
};



export default connect(mapStateToProps)(ScheduleCalendar);