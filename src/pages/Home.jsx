import React from 'react';
import {Link} from "react-router-dom";

const Home = () => {
    return (
        <section className="vh-100" style={{backgroundColor: '#eee'}}>
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-12 col-xl-11">
                        <div className="card text-black" style={{borderRadius: '25px'}}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Welcome to Cloud
                                        Service Platform!</p>

                                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

                                        <div className="text-justify">
                                            <p>This platform allows you to manage users and files through our
                                                Backendless service.</p>
                                            <p>Here are some key functionalities:</p>
                                            <ul className="list-group list-group-flush text-start">
                                                <li className="list-group-item"><Link
                                                    to={'/register'}>Registration</Link></li>
                                                <li className="list-group-item"><Link to={'/login'}>Login</Link></li>
                                                <li className="list-group-item"><Link to={'/recover'}>Password
                                                    Recovery</Link></li>

                                                <li className="list-group-item">User Management: Create, Update,
                                                    Delete
                                                </li>
                                                <li className="list-group-item">File Management: Upload, Download,
                                                    Delete
                                                </li>
                                                <li className="list-group-item">Shared Access to Files</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div
                                        className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                                        <img
                                            // src="https://blush.design/api/download?shareUri=NyawDjLfFmHXfUDZ&c=Skin_0%7E09b9c6-0.1%7Eca8f67&w=800&h=800&fm=png"
                                            src="https://blush.design/api/download?shareUri=UZNhaukYbPPt58iH&c=Skin_0%7Eca8f67-0.1%7Eff8282-0.2%7Eca8f67&w=800&h=800&fm=png"
                                            className="img-fluid" alt="Registration" style={{maxWidth: '100%'}}/>
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
