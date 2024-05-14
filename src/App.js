import React from 'react';
import Backendless from 'backendless';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Registration from './pages/user/Registration';
import Login from './pages/user/Login';
import Profile from './pages/user/Profile';
import Navbar from './elements/Navbar';
import PasswordReset from "./pages/user/PasswordReset";

// Встановлення змінних середовища з файлу .env
const APP_ID = process.env.REACT_APP_BACKENDLESS_APP_ID;
const API_KEY = process.env.REACT_APP_BACKENDLESS_API_KEY;

Backendless.serverURL = 'https://api.backendless.com';
Backendless.initApp(APP_ID, API_KEY);

function App() {
    return (
        <Router>
            <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/reset-password" element={<PasswordReset />} />
                </Routes>
        </Router>
    );
}

export default App;
