import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import Backendless from "backendless";

const Home = () => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await Backendless.UserService.getCurrentUser();
                setCurrentUser(user);
            } catch (error) {
                console.error('Failed to fetch current user', error);
            }
        };
        fetchCurrentUser().then(r => r);
    }, []);

    return (
        <section className="vh-100" style={{backgroundColor: '#eee'}}>
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-12 col-xl-11">
                        <div className="card text-black" style={{borderRadius: '25px'}}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 ">Welcome to Cloud
                                        Service Platform!</p>

                                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

                                        <div className="text-justify">
                                            <p>Functionality:</p>
                                            <ul className="list-group list-group-flush text-start">
                                                <li className="list-group-item"><Link
                                                    to={'/register'}>Registration</Link></li>
                                                <li className="list-group-item"><Link to={'/login'}>Login</Link></li>
                                                {currentUser && (
                                                    <>
                                                        <li className="list-group-item"><Link to={'/profile'}>User
                                                            Profile</Link></li>
                                                        <li className="list-group-item"><Link to={'/reset-password'}>Password
                                                            Recovery</Link></li>
                                                        <li className="list-group-item"><Link to={'/file-manager'}>File
                                                            Management</Link></li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                    <div
                                        className="col-md-10 col-lg-6 col-xl-6 d-flex align-items-center order-1 order-lg-2">
                                        <img
                                            src="https://blush.design/api/download?shareUri=UZNhaukYbPPt58iH&c=Skin_0%7Eca8f67-0.1%7Eff8282-0.2%7Eca8f67&w=800&h=800&fm=png"
                                            className="img-fluid" alt="Registration"></img>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home;
