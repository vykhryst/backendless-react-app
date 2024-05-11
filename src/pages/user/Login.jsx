import React, {useState} from 'react';
import Backendless from 'backendless';

const Login = () => {
    const [login, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loginUser = async (login, password) => {
        try {
            return await Backendless.UserService.login(login, password, true);
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await loginUser(login, password);
            console.log('User logged in successfully!');
        } catch (error) {
            setError(error.message || 'Login failed. Please try again.');
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
                                        <form className="mx-1 mx-md-4" onSubmit={handleSubmit}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                                <div data-mdb-input-init="" className="form-outline flex-fill mb-0">
                                                    <input
                                                        type="login"
                                                        id="form3Example3c"
                                                        className="form-control"
                                                        placeholder={'Login'}
                                                        value={login}
                                                        onChange={(e) => setName(e.target.value)}
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

                                            <div className={error ? 'text-danger text-center mb-3' : 'd-none'}>
                                                {error}
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
                                            <p>Not a member? <a href="/register">Register</a></p>
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

export default Login;
