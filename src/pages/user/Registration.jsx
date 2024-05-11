import React, {useState} from 'react';
import Backendless from 'backendless';

const Registration = () => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [country, setCountry] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const registerUser = async (user) => {
        try {
            return await Backendless.UserService.register(user);
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = {
                email,
                password,
                name,
                age: parseInt(age), // Parsing age to an integer
                country,
                gender
            };
            await registerUser(user);
            console.log('User registered successfully!');
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
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

                                        <form className="mx-1 mx-md-3" onSubmit={handleSubmit}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init="" className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="text"
                                                        id="form3Example1c"
                                                        className="form-control"
                                                        placeholder='Name (login)'
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init="" className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="email"
                                                        id="form3Example3c"
                                                        className="form-control"
                                                        placeholder={'Email'}
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init="" className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="password"
                                                        id="form3Example4c"
                                                        className="form-control"
                                                        placeholder={'Password'}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>


                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init="" className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="text"
                                                        id="form3Example5c"
                                                        className="form-control"
                                                        placeholder={'Age'}
                                                        value={age}
                                                        onChange={(e) => setAge(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-globe fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init="" className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="text"
                                                        id="form3Example6c"
                                                        className="form-control"
                                                        placeholder={'Country'}
                                                        value={country}
                                                        onChange={(e) => setCountry(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-venus-mars fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init="" className="form-outline flex-fill mb-0">
                                                    <select
                                                        id="form3Example7c"
                                                        className="form-select"
                                                        value={gender}
                                                        onChange={(e) => setGender(e.target.value)}
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className={error ? 'text-danger text-center mb-3' : 'd-none'}>
                                                {error}
                                            </div>

                                            <div className="form-check d-flex justify-content-center mb-3">
                                                <input className="form-check-input me-2" type="checkbox" value=""
                                                       id="form2Example3c"/>
                                                <label className="form-check-label" htmlFor="form2Example3">
                                                    I agree all statements in <a href="#">Terms of service</a>
                                                </label>
                                            </div>

                                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                                <button
                                                    type="submit"
                                                    data-mdb-button-init=""
                                                    data-mdb-ripple-init=""
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
                                            className="img-fluid" alt="Sample image"/>
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
