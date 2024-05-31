import React, {useState, useEffect, useRef} from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import L from 'leaflet';
import CreatableSelect from 'react-select/creatable';
import Backendless from 'backendless';
import 'leaflet/dist/leaflet.css';

// Override Leaflet's default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const AddPlace = ({show, handleClose, fetchPlaces}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [hashtags, setHashtags] = useState([]);
    const [existingHashtags, setExistingHashtags] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [user, setUser] = useState(null);
    const [useCurrentLocation, setUseCurrentLocation] = useState(true);

    useEffect(() => {
        fetchData().then(r => r);
    }, []);

    const fetchData = async () => {
        try {
            await Promise.all([fetchCategories(), fetchHashtags(), fetchUserData()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchCategories = async () => {
        const categories = await Backendless.Data.of('Categories').find();
        setCategories(categories);
    };

    const fetchHashtags = async () => {
        const hashtags = await Backendless.Data.of('Hashtags').find();
        setExistingHashtags(hashtags.map(ht => ({label: ht.name, value: ht.name, objectId: ht.objectId})));
    };

    const fetchUserData = async () => {
        const currentUser = await Backendless.UserService.getCurrentUser(true);
        setUser(currentUser);
        if (currentUser && currentUser.myLocation) {
            setCurrentLocation([currentUser.myLocation.y, currentUser.myLocation.x]);
            setMarkerPosition([currentUser.myLocation.y, currentUser.myLocation.x]);
        } else {
            setUseCurrentLocation(false);
        }
    };

    const handleAddPlace = async () => {
        if (!markerPosition) {
            alert('Please set a location on the map.');
            return;
        }

        try {
            const category = selectedCategory.objectId || (await saveNewCategory());
            const imageUrl = image ? await uploadImage() : null;

            const hashtagsToSave = await saveHashtags();

            const location = useCurrentLocation && currentLocation ? currentLocation : markerPosition;

            const place = {
                name,
                description,
                image: imageUrl,
                mapLocation: new Backendless.Data.Point().setLatitude(location[0]).setLongitude(location[1]),
            };

            const savedPlace = await Backendless.Data.of('Places').save(place);
            await Promise.all([
                Backendless.Data.of('Places').setRelation(savedPlace, 'user', [user]),
                Backendless.Data.of('Places').setRelation(savedPlace, 'category', [category]),
                Backendless.Data.of('Places').setRelation(savedPlace, 'hashtags', hashtagsToSave)
            ]);

            handleCloseModal();
            fetchPlaces();
        } catch (error) {
            console.error('Error adding place:', error);
        }
    };

    const saveNewCategory = async () => {
        const newCategoryObject = await Backendless.Data.of('Categories').save({name: newCategory});
        return newCategoryObject.objectId;
    };

    const uploadImage = async () => {
        const path = `users/${user.username}/places`;
        const fileURLs = await Backendless.Files.upload(image, path, true);
        return fileURLs.fileURL;
    };

    const saveHashtags = async () => {
        const hashtagsToSave = [];
        for (const tag of hashtags) {
            const existingHashtag = existingHashtags.find(ht => ht.value === tag.value);
            if (!existingHashtag) {
                const newHashtag = await Backendless.Data.of('Hashtags').save({name: tag.value});
                hashtagsToSave.push(newHashtag.objectId);
            } else {
                hashtagsToSave.push(existingHashtag.objectId);
            }
        }
        return hashtagsToSave;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    function resetState() {
        setName('');
        setDescription('');
        setImage(null);
        setSelectedCategory('');
        setNewCategory('');
        setHashtags([]);
        setMarkerPosition(null);
        setUseCurrentLocation(true);
    }

    const handleCloseModal = () => {
        handleClose();
        resetState();
    };

    const DraggableMarker = () => {
        const markerRef = useRef(null);

        const eventHandlers = {
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setMarkerPosition([marker.getLatLng().lat, marker.getLatLng().lng]);
                }
            }
        };

        return (
            <Marker draggable eventHandlers={eventHandlers}
                    position={markerPosition || currentLocation || [48.50810421, 32.26516951]} ref={markerRef}>
                <Popup minWidth={90}>Drag marker to set location</Popup>
            </Marker>
        );
    };

    return (
        <Modal show={show} onHide={handleCloseModal} centered size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Add New Place</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <div className="d-flex flex-wrap ">
                        <div className="w-50 pe-3">
                            <Form.Group className="mb-2">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text"
                                              value={name}
                                              onChange={(e) => setName(e.target.value)}
                                              placeholder="Enter place name"/>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea"
                                              rows={3}
                                              value={description}
                                              onChange={(e) => setDescription(e.target.value)}
                                              placeholder="Enter place description"/>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Category</Form.Label>
                                <CreatableSelect
                                    isClearable
                                    value={selectedCategory}
                                    onChange={(newValue) => {
                                        setSelectedCategory(newValue);
                                        setNewCategory('');
                                    }}
                                    options={categories.map(category => ({
                                        value: category.name, label: category.name, objectId: category.objectId
                                    }))}
                                    placeholder="Select or create a category"/>
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Hashtags</Form.Label>
                                <CreatableSelect
                                    isMulti
                                    value={hashtags}
                                    onChange={setHashtags}
                                    options={existingHashtags}
                                    placeholder="#hashtags"
                                    maxMenuHeight={150}
                                />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>Image</Form.Label>
                                <Form.Control type="file" onChange={handleImageChange}/>
                                <div className="text-center">
                                    {image && (
                                        <img src={URL.createObjectURL(image)} alt="Selected"
                                             style={{width: '30%', marginTop: '10px'}}/>
                                    )}
                                </div>
                            </Form.Group>
                        </div>
                        <div className="w-50 ps-3 align-content-center">
                            <Form.Group className="mb-2">
                                <Form.Label>Location</Form.Label>
                                {currentLocation ? (
                                    <>
                                        <Form.Check
                                            type="radio"
                                            label="Use current location"
                                            checked={useCurrentLocation}
                                            onChange={() => setUseCurrentLocation(true)}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Set location on map (drag the marker)"
                                            checked={!useCurrentLocation}
                                            onChange={() => setUseCurrentLocation(false)}
                                        />
                                    </>
                                ) : (
                                    <p className="text-muted">Drag marker to set location on the map </p>
                                )}
                                <div style={{height: '340px'}}>
                                    <MapContainer
                                        center={markerPosition || currentLocation || [48.50810421, 32.26516951]}
                                        zoom={16}
                                        style={{height: '100%', width: '100%'}}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                                        {useCurrentLocation && currentLocation ? (
                                            <Marker position={currentLocation}>
                                                <Popup>Your current location</Popup>
                                            </Marker>
                                        ) : (
                                            <DraggableMarker/>
                                        )}
                                    </MapContainer>
                                </div>
                            </Form.Group>
                        </div>
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAddPlace}>
                    Add Place
                </Button>
            </Modal.Footer>
        </Modal>
    );

}

export default AddPlace;
