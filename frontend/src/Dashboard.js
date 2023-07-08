import React from 'react';
import './Dashboard.css';
import AnesthesiologistForm from './components/AnesthesiologistForm';
import AnesthesiologistList from './components/AnesthesiologistList';
import GenerateScheduleButton from './components/GenerateScheduleButton';
import DateSelector from './components/DateSelector';
import { useDispatch } from 'react-redux';
import { clearMonthData, generateRandomSchedule } from './actions';

const Dashboard = ({selectedDate, setSelectedDate}) => {
    const dispatch = useDispatch();
    const handleClearMonth = async () => {
        dispatch(clearMonthData(new Date(selectedDate).getMonth() + 2));
        dispatch(generateRandomSchedule(new Date(selectedDate)));
    }

    return (
        <div className="dashboard-grid">
            <AnesthesiologistForm selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            <AnesthesiologistList />
            <div className="center-container">
                <div className="generate-schedule">
                    <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                    <GenerateScheduleButton selectedDate={selectedDate} />  
                    <button onClick={handleClearMonth}>Clear Month</button>     
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
