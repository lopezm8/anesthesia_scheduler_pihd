import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Calendar, globalizeLocalizer } from 'react-big-calendar';
import globalize from 'globalize';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { groupBy } from 'lodash';
import './ScheduleCalendar.css'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
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

export const printDocument = () => {
  window.scrollTo(0, 0);

  const input = document.getElementById('root');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [input.offsetHeight, input.offsetWidth]
  });

  html2canvas(input, {
    allowTaint: true,
    useCORS: true,
    scrollY: -window.scrollY
  })
  .then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let pdfPageHeight = pdf.internal.pageSize.getHeight();
    let yImagePosition = 0;

    pdf.addImage(imgData, 'PNG', 0, yImagePosition, pdfWidth, pdfHeight);
    yImagePosition += pdfPageHeight;

    // add extra pages if the content is overflowing
    while (yImagePosition < pdfHeight) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, yImagePosition * -1, pdfWidth, pdfHeight);
      yImagePosition += pdfPageHeight;
    }

    pdf.save("download.pdf");
  })
  .catch(err => console.error("Something went wrong: ", err));
};

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

  const convertToExcel = () => {
    // Group events by date
    const groupedByDate = events.reduce((acc, event) => {
        const dateKey = event.start.toISOString().split('T')[0];
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event.title);
        return acc;
    }, {});

    // Sort dates and prepare data for Excel
    const sortedDates = Object.keys(groupedByDate).sort();

    // Define wrapping of schedules on weekends
    const wrapPoints = [];
    for (let i = 0; i < sortedDates.length - 1; i++) {
        const date = sortedDates[i];
        const nextDate = sortedDates[i + 1];
        const hasTwoOrFewer = groupedByDate[date].length <= 2;
        const nextDayHasTwoOrFewer = groupedByDate[nextDate].length <= 2;

        if (hasTwoOrFewer && nextDayHasTwoOrFewer) {
            wrapPoints.push(date);
            const dateObj = new Date(date);
            dateObj.setDate(dateObj.getDate() + (7 - dateObj.getDay()));
            i = sortedDates.indexOf(dateObj.toISOString().split('T')[0]);
        }
    }

    let finalExcelData = [];
    let startIndex = 0;
    let currentWrapPointIndex = 0;

    while (startIndex < sortedDates.length) {
        const endIndex = wrapPoints[currentWrapPointIndex] ?
            sortedDates.indexOf(wrapPoints[currentWrapPointIndex]) + 1 :
            sortedDates.length;

        const segmentDates = sortedDates.slice(startIndex, endIndex);
        let segmentData = [{}];

        segmentDates.forEach((date, index) => {
            // Add headers and date rows
            segmentData[0][index * 2] = date;
            // Add anesthesiologist rows
            groupedByDate[date].forEach((anesthesiologist, rowIndex) => {
                if (!segmentData[rowIndex + 1]) {
                    segmentData[rowIndex + 1] = {};
                }
                segmentData[rowIndex + 1][index * 2] = rowIndex + 1;
                segmentData[rowIndex + 1][index * 2 + 1] = anesthesiologist;
            });
        });

        const maxRows = Math.max(...segmentDates.map(date => groupedByDate[date].length)) + 1;
        for (let row = 0; row < maxRows; row++) {
            segmentData[row] = segmentData[row] || {};
            for (let col = 0; col < segmentDates.length * 2; col++) {
                segmentData[row][col] = segmentData[row][col] || '';
            }
        }

        // Add blank row between weeks and continue
        finalExcelData = finalExcelData.concat(segmentData, [{}]);
        startIndex = endIndex;
        currentWrapPointIndex++;
    }

     // Appending Anesthesiologist callCounts
    const callCounts = countCalls(events); 
    let callCountsArray = [["Anesthesiologist", "First Calls", "Second Calls"]];

    // Convert callCounts object to an array of arrays
    for (let [name, counts] of Object.entries(callCounts)) {
        callCountsArray.push([name, counts.first, counts.second]);
    }

    // Sort Anesthesiologists by alphabetical order
    callCountsArray = callCountsArray.slice(0, 1).concat(callCountsArray.slice(1).sort((a, b) => a[0].localeCompare(b[0])));
    finalExcelData.push([{}], [{}]);

    // Append the callCounts to rest of the schedule
    finalExcelData = finalExcelData.concat(callCountsArray);

    const ws = XLSX.utils.json_to_sheet(finalExcelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");

    // Generate Excel file and download
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    FileSaver.saveAs(data, 'schedule.xlsx');
};
  
  console.log('Rendered ScheduleCalendar with props:', { events, selectedDate });
  console.log('Calendar component events', events);
  return (
    <div id="divToPrint">
      <div style={{ textAlign: 'center' }}>
      <button className="button-list" onClick={convertToExcel}>Save as Excel Spreadsheet</button>
    </div>
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
