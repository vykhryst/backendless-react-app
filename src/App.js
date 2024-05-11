import React from 'react';
import './App.css';
import Registration from './pages/user/Registration';
import Login from './pages/user/Login';
import Home from './pages/Home';
import Backendless from 'backendless';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";

const APP_ID = '4754ECD1-6072-4B70-B129-655AD3427774';
const API_KEY = '609A83DB-B8D9-4A99-867E-DEC6F7567802';
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
