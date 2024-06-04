import React, {useEffect, useState} from 'react';
import Backendless from 'backendless';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import MapPlace from "./MapPlace";
import AddPlace from "./AddPlace";
import {MapContainer, Marker, TileLayer, useMapEvents} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Places = () => {
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [user, setUser] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchRadius, setSearchRadius] = useState('');
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    const [mapCenter, setMapCenter] = useState([48.50804740, 32.26517459]);
    const [showSearchForm, setShowSearchForm] = useState(false);
    const [isSearchResults, setIsSearchResults] = useState(false);

    useEffect(() => {
        const initializeData = async () => {
            await fetchCurrentUser();
        };
        initializeData().then(r => r);
    }, []);

    useEffect(() => {
        if (user) {
            fetchPlaces().then(r => r);
        }
    }, [user]);

    const fetchCurrentUser = async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser(true);
            setUser(currentUser);
            setUseCurrentLocation(!!currentUser.myLocation);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchPlaces = async (whereClause = `user.objectId = '${user?.objectId}'`) => {
        if (!user) return; // Ensure user is set before fetching places
        try {
            const places = await getPlacesInfo(whereClause);
            setPlaces(places);
        } catch (error) {
            console.error('Error fetching places:', error);
        }
    };

    async function getPlacesInfo(whereClause) {
        const placesQueryBuilder = Backendless.DataQueryBuilder.create()
            .addAllProperties()
            .addProperty('category.name as categoryName')
            .setRelated(['hashtags', 'user'])
            .setWhereClause(whereClause);

        const places = await Backendless.Data.of('Places').find(placesQueryBuilder);

        const placeIds = places.map(place => place.objectId);
        const likesQueryBuilder = Backendless.DataQueryBuilder.create()
            .setProperties('place.objectId as placeId, Count(objectId) as totalLikes')
            .setWhereClause(`place.objectId IN ('${placeIds.join("','")}')`)
            .setGroupBy('place.objectId');

        const likes = await Backendless.Data.of('Likes').find(likesQueryBuilder);
        const likesMap = likes.reduce((acc, like) => {
            acc[like.placeId] = like.totalLikes;
            return acc;
        }, {});

        return places.map(place => ({
            ...place,
            totalLikes: likesMap[place.objectId] || 0,
        }));
    }

    const handleSearchPlaces = async () => {
        try {
            const whereClauses = [];
            if (searchName) whereClauses.push(`name LIKE '%${searchName}%'`);
            if (searchCategory) whereClauses.push(`category.name LIKE '%${searchCategory}%'`);
            if (searchRadius && (useCurrentLocation || mapCenter)) {
                const searchLocation = useCurrentLocation ? [user.myLocation.y, user.myLocation.x] : mapCenter;
                const distanceClause = `distanceOnSphere(mapLocation, 'POINT(${searchLocation[1]} ${searchLocation[0]})') <= ${searchRadius}`;
                whereClauses.push(distanceClause);
            }
            const whereClause = whereClauses.join(' AND ');
            const places = await getPlacesInfo(whereClause);
            const updatedPlaces = await Promise.all(places.map(async (place) => {
                const likesQueryBuilder = Backendless.DataQueryBuilder.create()
                    .setWhereClause(`place.objectId = '${place.objectId}' AND user.objectId = '${user.objectId}'`);
                const existingLikes = await Backendless.Data.of('Likes').find(likesQueryBuilder);
                const isLiked = existingLikes.length > 0;
                return {...place, isLiked};
            }));
            setPlaces(updatedPlaces);
            setIsSearchResults(true);
        } catch (error) {
            console.error('Error searching places:', error);
        }
    };

    const handleDeletePlace = async (place) => {
        try {
            if (place.user.objectId === user.objectId) {
                await Backendless.Data.of('Likes').bulkDelete(`place.objectId = '${place.objectId}'`);
                await Backendless.Data.of('Places').remove(place);
                await Backendless.Files.remove(place.image);
                await fetchPlaces();
            } else {
                alert('You can delete only your own places');
            }
        } catch (error) {
            console.error('Error deleting place:', error);
        }
    };

    const handleLikePlace = async (place) => {
        try {
            const likesQueryBuilder = Backendless.DataQueryBuilder.create()
                .setWhereClause(`place.objectId = '${place.objectId}' AND user.objectId = '${user.objectId}'`);
            const existingLikes = await Backendless.Data.of('Likes').find(likesQueryBuilder);

            if (existingLikes.length === 0) {
                const like = await Backendless.Data.of('Likes').save({});
                await Backendless.Data.of('Likes').setRelation(like, 'place', [place]);
                await Backendless.Data.of('Likes').setRelation(like, 'user', [user]);
                place.totalLikes += 1;
                place.isLiked = true;
            } else {
                await Backendless.Data.of('Likes').remove(existingLikes[0]);
                place.totalLikes -= 1;
                place.isLiked = false;
            }
            setPlaces([...places]);
        } catch (error) {
            console.error('Error liking/unliking place:', error);
        }
    };

    const handleShowDetails = (place) => setSelectedPlace(place);
    const handleCloseDetails = () => setSelectedPlace(null);
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setMapCenter([e.latlng.lat, e.latlng.lng]);
            }
        });

        return mapCenter === null ? null : (
            <Marker position={mapCenter}>
            </Marker>
        );
    };

    const handleShowSearchForm = () => setShowSearchForm(true);
    const handleCloseSearchForm = () => {
        setShowSearchForm(false);
        setSearchName('');
        setSearchCategory('');
        setSearchRadius('');
        fetchPlaces().then(r => r);
        setIsSearchResults(false);
    };

    return (
        <div className="container mt-5 h-100 col-xl-8">
            <h2 className="text-center mb-4">{isSearchResults ? 'Search Results' : 'My Places'}</h2>
            <Button variant="primary" className="mb-3" onClick={handleShowAddModal}>
                Add New Place
            </Button>
            <Button variant="secondary" className="mb-3 ms-2"
                    onClick={showSearchForm ? handleCloseSearchForm : handleShowSearchForm}>
                {showSearchForm ? 'Close Search' : 'Search Places'}
            </Button>

            {showSearchForm && (
                <Form className="mb-3">
                    <Form.Group className="mb-2">
                        <Form.Label>Search by Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter place name"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Search by Category</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter category name"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>Search Radius (meters)</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter radius in meters"
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(e.target.value)}
                        />
                    </Form.Group>
                    {!useCurrentLocation && (
                        <div style={{height: '200px', marginTop: '10px'}}>
                            <MapContainer center={mapCenter} zoom={13} style={{height: '100%', width: '100%'}}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                <LocationMarker/>
                            </MapContainer>
                        </div>
                    )}
                    <Form.Check
                        type="radio"
                        label="Use current location"
                        checked={useCurrentLocation}
                        onChange={() => setUseCurrentLocation(true)}
                        disabled={!user?.myLocation}
                    />
                    <Form.Check
                        type="radio"
                        label="Select location on map"
                        checked={!useCurrentLocation}
                        onChange={() => setUseCurrentLocation(false)}
                    />

                    <Button variant="primary" className="mt-3" onClick={handleSearchPlaces}>
                        Search Places
                    </Button>
                    <Button variant="secondary" className="mt-3 ms-2" onClick={handleCloseSearchForm}>
                        Close Search
                    </Button>
                </Form>
            )}

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {places.map((place) => (
                    <div className="col" key={place.objectId}>
                        <div className="card h-100">
                            {place.image && (
                                <img
                                    src={place.image}
                                    className="card-img-top"
                                    alt="Place"
                                    style={{width: '100%', height: '200px', objectFit: 'cover'}}
                                />
                            )}
                            <div className="card-body">
                                <p className="card-text text-muted text-end mb-0">
                                    {place.categoryName}
                                </p>
                                <h5 className="card-title mb-1">{place.name}</h5>
                                <p className="card-text mb-1" style={{color: '#0030a2'}}>
                                    {place.hashtags.map(hashtag => `#${hashtag.name}`).join(' ')}
                                </p>
                                <p className="card-text mb-2 fs-5">
                                    <i className="fa fa-heart" style={{color: 'red'}}></i> {place.totalLikes}
                                </p>
                                <div className="text-end mt-2">
                                    {isSearchResults && place.user.objectId !== user.objectId && (
                                        <button className="btn btn-sm btn-light me-2"
                                                onClick={() => handleLikePlace(place)}>
                                            {place?.isLiked ? (
                                                <span><i className="fa-solid fa-heart me-1"
                                                         style={{color: 'red'}}></i>Liked</span>
                                            ) : (<span><i className="fa-regular fa-heart me-1"
                                                          style={{color: 'red'}}></i>Like</span>
                                            )}
                                        </button>

                                    )}
                                    <button
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        onClick={() => handleShowDetails(place)}>
                                        Details
                                    </button>
                                    {place.user.objectId === user.objectId && (
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeletePlace(place)}
                                        >
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="card-footer">
                                <small className="text-muted">
                                    Created {new Date(place.created).toLocaleString()}
                                </small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal centered show={!!selectedPlace} onHide={handleCloseDetails}>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedPlace?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1" style={{color: '#0030A2FF'}}>
                        {selectedPlace?.hashtags?.map(hashtag => `#${hashtag.name}`).join(' ')}
                    </p>
                    <p className="mb-1"><b>Category:</b> {selectedPlace?.categoryName}</p>
                    <p className="mb-1"><b>Description:</b> {selectedPlace?.description}</p>
                    <p className="mb-1"><b>Likes:</b> {selectedPlace?.totalLikes}</p>
                    {selectedPlace?.mapLocation && (
                        <>
                            <p className="mb-1"><b>Map Location:</b></p>
                            <MapPlace place={selectedPlace}/>
                        </>
                    )}
                    <div className="card-footer mb-1 mt-2">
                        <small className="text-muted">
                            Created {new Date(selectedPlace?.created).toLocaleString()}
                        </small>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetails}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <AddPlace show={showAddModal} handleClose={handleCloseAddModal} fetchPlaces={fetchPlaces} user={user}/>
        </div>
    );
};

export default Places;
