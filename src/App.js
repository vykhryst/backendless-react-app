import React from 'react';
import Backendless from 'backendless';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from './pages/Home';
import Registration from './pages/user/Registration';
import Login from './pages/user/Login';
import Profile from './pages/user/Profile';
import Navbar from './elements/Navbar';
import PasswordReset from "./pages/user/PasswordReset";
import FileManager from "./pages/FileManager";
import Places from "./pages/places/Places";

// Встановлення змінних середовища з файлу .env
const APP_ID = process.env.REACT_APP_BACKENDLESS_APP_ID;
const API_KEY = process.env.REACT_APP_BACKENDLESS_API_KEY;

Backendless.serverURL = 'https://api.backendless.com';
Backendless.initApp(APP_ID, API_KEY);

function App() {
    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/register" element={<Registration/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/reset-password" element={<PasswordReset/>}/>
                <Route path={'/file-manager'} element={<FileManager/>}/>
                <Route path="/my-places" element={<Places />} />
                <Route path="*" element={<h1 className="text-center mt-5"> Page Not Found </h1>}/>
            </Routes>
        </Router>
    );
}

export default App;
