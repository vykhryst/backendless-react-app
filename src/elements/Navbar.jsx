import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const APP_ID = process.env.REACT_APP_BACKENDLESS_APP_ID;

    useEffect(() => {
        const fetchIsLoggedIn = async () => {
            const currentUser = localStorage.getItem(`Backendless_${APP_ID}`);
            setIsLoggedIn(!!currentUser);
        };
        fetchIsLoggedIn().then(r => r);
    }, []);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">Practice MBaaS</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/register">Register</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/login">Login</Link>
                        </li>
                        {isLoggedIn && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/profile">Profile</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/file-manager">File Manager</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/places">Places</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/friends">Friends</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/feedback">Feedback</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
