import React, {useEffect, useState} from 'react';
import Backendless from 'backendless';
import {Link, useNavigate} from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({age: '', country: '', email: '', gender: ''});
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [fileList, setFileList] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [trackLocation, setTrackLocation] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const currentUser = await Backendless.UserService.getCurrentUser();
                setUser(currentUser);
                setTrackLocation(!!currentUser.myLocation)
                setFormData({
                    age: currentUser.age ? currentUser.age.toString() : '',
                    country: currentUser.country || '',
                    email: currentUser.email || '',
                    gender: currentUser.gender || '',
                });
                await fetchUserFiles(currentUser.username);
            } catch (error) {
                console.error('Error getting current user:', error);
            }
        };

        getCurrentUser().then(r => r);
    }, []);

    useEffect(() => {
        let locationInterval;
        if (trackLocation) {
            updateLocation().then(r => r);
            locationInterval = setInterval(() => {
                updateLocation().then(r => r);
            }, 60000); // Оновлення кожну хвилину
        }
        return () => {
            if (locationInterval) clearInterval(locationInterval);
        };
    }, [trackLocation]);

    const updateLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const {latitude, longitude} = position.coords;
                const updatedUser = {
                    ...user,
                    myLocation: new Backendless.Data.Point().setLatitude(latitude).setLongitude(longitude)
                };
                await Backendless.UserService.update(updatedUser);
            }, (error) => {
                console.error('Failed to get geolocation:', error);
            });
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const handleTrackLocationChange = async () => {
        const newTrackLocation = !trackLocation;
        setTrackLocation(newTrackLocation);
        if (newTrackLocation) {
            await updateLocation();
        } else {
            // Якщо вимкнено відстеження місцезнаходження, очищаємо поле myLocation
            const updatedUser = {...user, myLocation: null};
            await Backendless.UserService.update(updatedUser);
            setUser(updatedUser);
        }
    };


    const fetchUserFiles = async (username) => {
        try {
            const files = await Backendless.Files.listing(`/users/${username}`, '*.{jpg,png,gif,jpeg,svg,JPG,PNG,GIF,JPEG,SVG}');
            setFileList(files);
        } catch (error) {
            console.error('Error fetching user files:', error);
        }
    };

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateInputs = () => {
        const newErrors = {};
        const ageRegex = /^(?:[6-9]|[1-9][0-9]+)$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!emailRegex.test(formData.email.trim())) newErrors.email = 'Invalid email format';
        if (!formData.age.trim()) newErrors.age = 'Age is required.';
        else if (!ageRegex.test(formData.age.trim())) newErrors.age = 'Age must be a number greater than 5.';
        if (!formData.country.trim()) newErrors.country = 'Country is required.';
        if (!formData.gender.trim()) newErrors.gender = 'Gender is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveChanges = async () => {
        if (!validateInputs()) return;

        if (user) {
            user.age = parseInt(formData.age.trim(), 10); // Ensure age is an integer
            user.country = formData.country.trim();
            user.email = formData.email.trim();
            user.gender = formData.gender.trim();
            if (selectedAvatar) {
                user.avatarUrl = selectedAvatar.publicUrl;
            }
            try {
                const updatedUser = await Backendless.UserService.update(user);
                setUser(updatedUser);
                setIsEditing(false);
                setErrors({});
            } catch (error) {
                console.error('Error updating user:', error);
            }
        }
    };

    const handleAvatarSelection = (fileURL) => {
        const selectedFile = fileList.find((file) => file.url === fileURL);
        setSelectedAvatar(selectedFile);
    };

    const logoutUser = async () => {
        try {
            await Backendless.UserService.logout();
            console.log('User has been logged out');
            navigate('/login');
        } catch (error) {
            console.log('Error logging out:', error);
        }
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
                                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4">User Profile</p>
                                        <div className="text-center mb-2">
                                            <img
                                                className="img-fluid rounded-circle" style={{width: '120px'}}
                                                alt={'Avatar'}
                                                src={selectedAvatar?.publicUrl || user?.avatarUrl || 'https://via.placeholder.com/150'}
                                            />
                                        </div>
                                        {isEditing ? (
                                            <div className="mt-3">
                                                <div className="mb-2">
                                                    <label className="form-label" htmlFor="avatar">
                                                        Avatar:
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        id="avatar"
                                                        name="avatar"
                                                        onChange={(e) => handleAvatarSelection(e.target.value)}
                                                    >
                                                        <option key="default" value="">
                                                            Select Avatar
                                                        </option>
                                                        {fileList.map((file) => (
                                                            <option key={file.url} value={file.url}>
                                                                {file.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-2">
                                                    <label className="form-label" htmlFor="email">
                                                        Email:
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                    />
                                                    {errors.email && (
                                                        <div className="text-danger">{errors.email}</div>
                                                    )}
                                                </div>
                                                <div className="mb-2">
                                                    <label className="form-label" htmlFor="age">
                                                        Age:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        id="age"
                                                        name="age"
                                                        value={formData.age}
                                                        onChange={handleInputChange}
                                                    />
                                                    {errors.age && <div className="text-danger">{errors.age}</div>}
                                                </div>
                                                <div className="mb-2">
                                                    <label className="form-label" htmlFor="country">
                                                        Country:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="country"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleInputChange}
                                                    />
                                                    {errors.country && (
                                                        <div className="text-danger">{errors.country}</div>
                                                    )}
                                                </div>
                                                <div className="mb-2">
                                                    <label className="form-label" htmlFor="gender">
                                                        Gender:
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        id="gender"
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                    {errors.gender && (
                                                        <div className="text-danger">{errors.gender}</div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={handleSaveChanges}
                                                    className="btn btn-success mt-1">
                                                    Save Changes
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setErrors({});
                                                    }}
                                                    className="btn btn-secondary ms-2 mt-1">
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mt-2">
                                                    <p className="text-center h5 mt-1">
                                                        {user ? user.username : 'Loading...'}
                                                    </p>
                                                    <p>
                                                        <strong>Email:</strong> {user ? user.email : 'Loading...'}
                                                    </p>
                                                    <p>
                                                        <strong>Age:</strong> {user ? user.age : 'Loading...'}
                                                    </p>
                                                    <p>
                                                        <strong>Country:</strong>{' '}
                                                        {user ? user.country : 'Loading...'}
                                                    </p>
                                                    <p>
                                                        <strong>Gender:</strong> {user ? user.gender : 'Loading...'}
                                                    </p>
                                                    <div className="form-check form-switch mt-2">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="trackLocationSwitch"
                                                            checked={trackLocation}
                                                            onChange={handleTrackLocationChange}
                                                        />
                                                        <label className="form-check-label"
                                                               htmlFor="trackLocationSwitch">Track my location</label>
                                                    </div>

                                                    <button onClick={() => setIsEditing(true)}
                                                            className="btn btn-light mt-2">
                                                        <i className="fa-solid fa-pen me-2"></i>Edit Profile
                                                    </button>
                                                </div>
                                                <div className="row justify-content-center mt-2 order-2 order-lg-2">
                                                    <div className="col-md-10 col-lg-9 col-xl-12 text-center">
                                                        <Link
                                                            to="/file-manager"
                                                            className="btn btn-primary me-md-2 mb-2 mb-md-0 mt-2">
                                                            File Management
                                                        </Link>
                                                        <Link
                                                            to="/reset-password"
                                                            className="btn btn-secondary me-md-2 mb-2 mb-md-0 mt-2">
                                                            Reset Password
                                                        </Link>
                                                        <Link
                                                            to="/places"
                                                            className="btn btn-info me-md-2 mb-2 mb-md-0 mt-2">
                                                            Places
                                                        </Link>
                                                        <button
                                                            onClick={logoutUser}
                                                            className="btn btn-danger me-md-2 mb-2 mb-md-0 mt-2">
                                                            Logout
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
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