import React, {useEffect, useState} from 'react';
import Backendless from 'backendless';
import {Link, useNavigate} from "react-router-dom";

const Profile = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        Backendless.UserService.getCurrentUser()
            .then(currentUser => {
                setUser(currentUser);
            })
            .catch(error => {
                console.error('Error getting current user:', error);
            });
    }, []);

    const logoutUser = () => {
        Backendless.UserService.logout()
            .then(() => {
                console.log("user has been logged out");
                navigate('/login');
            })
            .catch(error => {
                console.log('Error logging out:', error);
            });
    };

    return (
        <section className="vh-100" style={{backgroundColor: '#eee'}}>
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-12 col-xl-8">
                        <div className="card text-black" style={{borderRadius: '25px'}}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <div className="col-md-10 col-lg-9 col-xl-6 order-2 order-lg-1">
                                        <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 ">User Profile</p>
                                        <div className="text-center mb-4">
                                            <img
                                                src="https://blush.design/api/download?shareUri=cSe9iIMVktXRz7Ms&w=800&h=800&fm=png"
                                                className="img-fluid rounded-circle" style={{width: '120px'}}
                                                alt={'Avatar'}/>
                                        </div>
                                        <div className="text-center">
                                            <p className="h5 mb-1">{user ? user.username : 'Loading...'}</p>
                                            <p className="text-muted">{user ? user.email : 'Loading...'}</p>
                                        </div>
                                        <div className="mt-4">
                                            <p><strong>Age:</strong> {user ? user.age : 'Loading...'}</p>
                                            <p><strong>Country:</strong> {user ? user.country : 'Loading...'}</p>
                                            <p><strong>Gender:</strong> {user ? user.gender : 'Loading...'}</p>
                                        </div>

                                    </div>
                                    <div className="row justify-content-center mt-4 order-1 order-lg-2">
                                        <div className="col-md-10 col-lg-9 col-xl-12 text-center">
                                            <Link to="/file-manager"
                                                  className="btn btn-primary me-md-2 mb-2 mb-md-0">
                                                File Management
                                            </Link>
                                            <Link to="/reset-password"
                                                  className="btn btn-secondary me-md-2 mb-2 mb-md-0">
                                                Reset Password
                                            </Link>
                                            <button onClick={logoutUser}
                                                    className="btn btn-danger me-md-2 mb-2 mb-md-0">
                                                Logout
                                            </button>
                                        </div>
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

export default Profile;
