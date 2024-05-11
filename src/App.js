import React from 'react';
import config from './config';
import './App.css';
import Registration from './pages/user/Registration';
import Login from './pages/user/Login';
import Home from './pages/Home';
import Backendless from 'backendless';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";

const APP_ID = config.APP_ID;
const API_KEY = config.API_KEY;
Backendless.serverURL = 'https://api.backendless.com';
Backendless.initApp(APP_ID, API_KEY);

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}></Route>
                <Route path="/register" element={<Registration/>}></Route>
                <Route path="/login" element={<Login/>}></Route>
            </Routes>
        </Router>
    );
}

export default App;
