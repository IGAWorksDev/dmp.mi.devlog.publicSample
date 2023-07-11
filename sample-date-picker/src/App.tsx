import React from 'react';
import './App.scss';
import Calendar from "./sample/Calendar";
import DatePicker from "./sample/DatePicker";

function App() {
    return (
        <div className="App">
            <div className={'content'}>
                <DatePicker onChange={(date) => console.log(date)}/>
            </div>
        </div>
    );
}

export default App;
