import React from 'react';
import './Dashboard.css';
import AnesthesiologistForm from './components/AnesthesiologistForm';
import AnesthesiologistList from './components/AnesthesiologistList';
import GenerateScheduleButton from './components/GenerateScheduleButton';
import DateSelector from './components/DateSelector';

const Dashboard = ({selectedDate, setSelectedDate}) => {
    return (
        <div className="dashboard-grid">
            <AnesthesiologistForm selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            <AnesthesiologistList />
            <div className="center-container">
                <div className="generate-schedule">
                    <GenerateScheduleButton selectedDate={selectedDate} />
                    <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
