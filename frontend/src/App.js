import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import store from './store';
import Dashboard from './Dashboard';
import ScheduleCalendar from './components/ScheduleCalendar';

const App = () => {
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substr(0,7));
  console.log('selected date App.js: ', selectedDate);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/schedule" element={
              <div>
                  <Dashboard selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
                  <ScheduleCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
              </div>
          }/>
          <Route path="/" element={
            <div>
                <Dashboard selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
                <ScheduleCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            </div>
          }/>
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
