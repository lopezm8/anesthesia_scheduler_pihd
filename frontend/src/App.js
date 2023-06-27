import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import store from './store';
import AnesthesiologistForm from './components/AnesthesiologistForm';
import AnesthesiologistList from './components/AnesthesiologistList';
import GenerateScheduleButton from './components/GenerateScheduleButton';
import ScheduleCalendar from './components/ScheduleCalendar';
import DateSelector from './components/DateSelector';


const App = () => {
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substr(0,7));
  console.log('selected date App.js: ', selectedDate);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/anesthesiologists" element={<AnesthesiologistList />} />
          <Route path="/anesthesiologists/new" element={<AnesthesiologistForm />} />
          <Route path="/schedule" element={
              <div>
                  <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                  <ScheduleCalendar selectedDate={selectedDate} />
              </div>
          }/>
          <Route path="/" element={
            <div>
                <AnesthesiologistForm selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
                <AnesthesiologistList />
                <GenerateScheduleButton selectedDate={selectedDate} />
                <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                <ScheduleCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
            </div>
          }/>
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
