import React, {useState} from 'react';
import Backendless from 'backendless';
import {useNavigate} from "react-router-dom";

const Registration = () => {
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [country, setCountry] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateInputs = () => {
        const newErrors = {};
        const ageRegex = /^(?:[6-9]|[1-9][0-9]+)$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        if (!username) newErrors.username = 'Username is required.';
        else if (!usernameRegex.test(username)) newErrors.username = 'Username can only contain letters, numbers, and underscores.';
        if (!email) newErrors.email = 'Email is required';
        else if (!emailRegex.test(email)) newErrors.email = 'Invalid email format';
        if (!password) newErrors.password = 'Password is required.';
        if (!age) newErrors.age = 'Age is required.';
        else if (!ageRegex.test(age)) newErrors.age = 'Age must be a number greater than 5.';
        if (!gender) newErrors.gender = 'Gender is required.';
        if (!country) newErrors.country = 'Country is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const registerUser = async (user) => {
        try {
            const registeredUser = await Backendless.UserService.register(user);
            await Backendless.Files.createDirectory(`/users/${user.username}`);
            await Backendless.Files.createDirectory(`/users/${user.username}/shared_with_me`);
            return registeredUser;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (!validateInputs()) {
            setLoading(false);
            return;
        }

        try {
            const user = {
                email,
                password,
                username,
                age: parseInt(age),
                country,
                gender
            };
            await registerUser(user);
            navigate('/');
        } catch (error) {
            if (error.code === 3033) {
                setErrors((prev) => ({...prev, username: 'User with this username already exists.'}));
            } else {
                setErrors((prev) => ({...prev, general: error.message || 'Registration failed. Please try again.'}));
            }
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
                                        <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>

                                        <form className="mx-1 mx-md-3 needs-validation" onSubmit={handleSubmit}
                                              noValidate>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="text"
                                                        id="form3Example1c"
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
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="email"
                                                        id="form3Example3c"
                                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                        placeholder='Email'
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                    <div className="invalid-feedback">{errors.email}</div>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
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

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="text"
                                                        id="form3Example5c"
                                                        className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                                                        placeholder='Age'
                                                        value={age}
                                                        onChange={(e) => setAge(e.target.value)}
                                                        required
                                                    />
                                                    <div className="invalid-feedback">{errors.age}</div>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-globe fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="text"
                                                        id="form3Example6c"
                                                        className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                                                        placeholder='Country'
                                                        value={country}
                                                        onChange={(e) => setCountry(e.target.value)}
                                                        required
                                                    />
                                                    <div className="invalid-feedback">{errors.country}</div>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-venus-mars fa-lg me-3 fa-fw"></i>
                                                <div className="form-outline flex-fill mb-0">
                                                    <select
                                                        id="form3Example7c"
                                                        className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                                                        value={gender}
                                                        onChange={(e) => setGender(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                    <div className="invalid-feedback">{errors.gender}</div>
                                                </div>
                                            </div>

                                            <div className={errors.general ? 'text-danger text-center mb-3' : 'd-none'}>
                                                {errors.general}
                                            </div>

                                            <div className="form-check d-flex justify-content-center mb-3">
                                                <input className="form-check-input me-2" type="checkbox" value=""
                                                       id="form2Example3c" required/>
                                                <label className="form-check-label" htmlFor="form2Example3">
                                                    I agree to all statements in <a href="#!">Terms of service</a>
                                                </label>
                                            </div>

                                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-lg"
                                                >
                                                    {loading ? 'Loading...' : 'Register'}
                                                </button>
                                            </div>
                                        </form>

                                        <div className="text-center">
                                            <p>Already a member? <a href="/login">Login</a></p>
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

export default Registration;
