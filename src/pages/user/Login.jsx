import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Backendless from 'backendless';

export const loginUser = async (username, password) => {
    try {
        return await Backendless.UserService.login(username, password, true);
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const navigate = useNavigate();

    /*const isValidSession = async () => {
        try {
            return await Backendless.UserService.isValidLogin();
        } catch (error) {
            console.error('Failed to validate login session:', error);
            throw error;
        }
    };

    useEffect(() => {
        const checkValidSession = async () => {
            try {
                const isValid = await isValidSession();
                if (isValid) {
                    navigate('/login');
                }
            } catch (error) {
                setGeneralError(error.message || 'Failed to validate login session.');
            }
        };
        checkValidSession().then(r => r);
    }, [navigate]);*/

    const validateInputs = () => {
        const newErrors = {};
        if (!username) newErrors.username = 'Username is required.';
        if (!password) newErrors.password = 'Password is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        if (!validateInputs()) {
            setLoading(false);
            return;
        }

        try {
            await loginUser(username, password);
            console.log('User logged in successfully!');
            navigate('/profile');
        } catch (error) {
            setGeneralError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="vh-100" style={{backgroundColor: '#eee'}}>
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-12 col-xl-11">
                        <div className="card text-black" style={{borderRadius: '25px'}}>
                            <div className="card-body p-md-5">
                                <div className="row justify-content-center">
                                    <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                                        <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Login</p>
                                        <form className="mx-1 mx-md-4 needs-validation" onSubmit={handleSubmit}
                                              noValidate>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init="" className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="text"
                                                        id="form3Example3c"
                                                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                                        placeholder='Username'
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                    <div className="invalid-feedback">{errors.username}</div>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init="" className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="password"
                                                        id="form3Example4c"
                                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                        placeholder='Password'
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                    <div className="invalid-feedback">{errors.password}</div>
                                                </div>
                                            </div>

                                            <div className={generalError ? 'text-danger text-center mb-3' : 'd-none'}>
                                                {generalError}
                                            </div>

                                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                <button
                                                    type="submit"
                                                    data-mdb-button-init=""
                                                    data-mdb-ripple-init=""
                                                    className="btn btn-primary btn-lg"
                                                >
                                                    {loading ? 'Loading...' : 'Login'}
                                                </button>
                                            </div>
                                        </form>
                                        <div className="text-center">
                                            <p>Not a member? <Link to="/register">Register</Link></p>
                                            <p><Link to="/reset-password">Forgot password?</Link></p>
                                        </div>
                                    </div>
                                    <div
                                        className="col-md-10 col-lg-6 col-lg-6 d-flex align-items-center order-1 order-lg-2">
                                        <img
                                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                                            className="img-fluid" alt="Sample"/>
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

export default Login;
