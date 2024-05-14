import React, { useState } from 'react';
import Backendless from 'backendless';

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await Backendless.UserService.restorePassword(email);
            setMessage('An email with a link to restore the password has been sent to the user.');
        } catch (err) {
            setError(err.message || 'Password reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="vh-100" style={{ backgroundColor: '#eee' }}>
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-12 col-xl-11">
                        <div className="card text-black" style={{ borderRadius: '25px' }}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                                        <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Reset Password</p>
                                        <form className="mx-1 mx-md-4" onSubmit={handleSubmit} noValidate>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="email"
                                                        id="form3Example3c"
                                                        className={`form-control ${error ? 'is-invalid' : ''}`}
                                                        placeholder="Email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                    <div className="invalid-feedback">{error}</div>
                                                </div>
                                            </div>

                                            <div className={message ? 'text-success text-center mb-3' : 'd-none'}>
                                                {message}
                                            </div>

                                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-lg"
                                                >
                                                    {loading ? 'Loading...' : 'Send Reset Link'}
                                                </button>
                                            </div>
                                        </form>
                                        <div className="text-center">
                                            <p>Remembered your password? <a href="/login">Login</a></p>
                                        </div>
                                    </div>
                                    <div
                                        className="col-md-10 col-lg-6 col-lg-6 d-flex align-items-center order-1 order-lg-2">
                                        <img
                                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                                            className="img-fluid" alt="Sample" />
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

export default PasswordReset;
