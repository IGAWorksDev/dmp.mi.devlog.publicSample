import React from 'react';
import './App.scss';
import DatePicker, {ModeDatePicker} from "./sample/DatePicker";

function App() {
    return (
        <div className="App">
            <div className={'content'}>
                <DatePicker onChange={(date) => console.log(date)}/>
            </div>
            <div className={'content'}>
                <DatePicker onChange={(date) => console.log(date)} picker={ModeDatePicker.week}/>
            </div>
            <div className={'content'}>
                <DatePicker onChange={(date) => console.log(date)} picker={ModeDatePicker.month}/>
            </div>
            <div className={'content'}>
                <DatePicker onChange={(date) => console.log(date)} picker={ModeDatePicker.year}/>
            </div>
        </div>
    );
}

export default App;
