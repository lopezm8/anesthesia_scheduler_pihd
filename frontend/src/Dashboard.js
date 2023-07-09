import React from 'react';
import './Dashboard.css';
import AnesthesiologistForm from './components/AnesthesiologistForm';
import AnesthesiologistList from './components/AnesthesiologistList';
import GenerateScheduleButton from './components/GenerateScheduleButton';
import DateSelector from './components/DateSelector';
import { useDispatch } from 'react-redux';
import { clearMonthData, generateRandomSchedule } from './actions';
import abc_prop from './assets/abc_prop.jpg';

const Dashboard = ({selectedDate, setSelectedDate}) => {
    const dispatch = useDispatch();
    const handleClearMonth = async () => {
        dispatch(clearMonthData(new Date(selectedDate).getMonth() + 2));
        dispatch(generateRandomSchedule(new Date(selectedDate)));
    }

    return (
        <>
            <div className="title-container">
                <div className="inner-container">
                    <img src={abc_prop} alt="Website Icon" className="website-icon"/>
                    <div className="title-description">
                        <h1>PropofolOnDemand: Anesthesia Scheduler</h1>
                        <p>
                            A Roc'n tool for generating balanced random on-call scheduling for anesthesiologists <br></br>
                            Please add anesthesiologists first before assigning vacations or first calls. <br></br>
                            The random generator will keep track of the number of first and second calls for each anesthesiologist. <br></br>
                            You may continue to generate a random schedule until you find an appropriate balance.
                        </p>
                    </div>
                </div>
            </div>
            <div className="dashboard-grid">
                <AnesthesiologistForm selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                <AnesthesiologistList />
                <div className="center-container">
                    <div className="generate-schedule">
                        <div className="calendar-container">
                            <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                        </div>
                        <GenerateScheduleButton selectedDate={selectedDate} />  
                        <button onClick={handleClearMonth}>Clear Month</button>     
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
