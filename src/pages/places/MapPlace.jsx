import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapPlace = ({place}) => {
    if (!place?.mapLocation) {
        return null;
    }

    const markerIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });

    const position = [place.mapLocation.y, place.mapLocation.x];

    return (
        <MapContainer center={position} zoom={15} style={{height: '270px', width: '100%'}}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position} icon={markerIcon}>
                <Popup>
                    {place.name}
                </Popup>
            </Marker>
        </MapContainer>
    );
};

// Define the propTypes for the component
MapPlace.propTypes = {
    place: PropTypes.shape({
        name: PropTypes.string,
        mapLocation: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired
        }).isRequired
    }).isRequired
};

export default MapPlace;
