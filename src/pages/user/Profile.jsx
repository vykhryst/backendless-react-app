import React, {useEffect, useState} from 'react';
import Backendless from 'backendless';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        Backendless.UserService.getCurrentUser()
            .then(currentUser => {
                setUser(currentUser);
            })
            .catch(error => {
                console.error('Error getting current user:', error);
            });
    }, []);

    return (
        <section className="vh-100" style={{backgroundColor: '#eee'}}>
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-12 col-xl-8">
                        <div className="card text-black" style={{borderRadius: '25px'}}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
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
