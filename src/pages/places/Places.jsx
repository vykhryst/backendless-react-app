import React, {useState, useEffect} from 'react';
import Backendless from 'backendless';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import MapPlace from "./MapPlace";
import AddPlace from "./AddPlace";

const Places = () => {
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchPlaces().then(r => r);
    }, []);

    const fetchPlaces = async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser(true);
            setUser(currentUser);
            const placesQueryBuilder = Backendless.DataQueryBuilder.create()
                .addAllProperties()
                .addProperty('category.name as categoryName')
                .setRelated(['hashtags'])
                .setWhereClause(`user.objectId = '${currentUser.objectId}'`);

            const places = await Backendless.Data.of('Places').find(placesQueryBuilder);

            const updatedPlaces = await Promise.all(places.map(async (place) => {
                const likesQueryBuilder = Backendless.DataQueryBuilder.create()
                    .setProperties('Count(objectId) as totalLikes')
                    .setWhereClause(`place.objectId = '${place.objectId}'`);

                const likes = await Backendless.Data.of('Likes').find(likesQueryBuilder);
                const totalLikes = likes[0]?.totalLikes || 0;
                return {...place, totalLikes};
            }));

            setPlaces(updatedPlaces);
            console.log('Places with likes:', updatedPlaces);
        } catch (error) {
            console.error('Error fetching places:', error);
        }
    };

    const handleDeletePlace = async (objectId) => {
        try {
            await Backendless.Data.of('Places').remove({objectId});
            await fetchPlaces();
        } catch (error) {
            console.error('Error deleting place:', error);
        }
    };

    const handleShowDetails = (place) => setSelectedPlace(place);
    const handleCloseDetails = () => setSelectedPlace(null);
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    return (
        <div className="container mt-5 h-100 col-xl-8">
            <h2 className="text-center mb-4">My Places</h2>
            <Button variant="primary" className="mb-3" onClick={handleShowAddModal}>
                Add New Place
            </Button>
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
                                <div className="text-end">
                                    <button
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => handleShowDetails(place)}
                                    >
                                        Details
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeletePlace(place.objectId)}
                                    >
                                        <i className="fa-regular fa-trash-can"></i>
                                    </button>
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
            <AddPlace show={showAddModal} handleClose={handleCloseAddModal} fetchPlaces={fetchPlaces}
                      user={user}/>

        </div>
    );
};

export default Places;
