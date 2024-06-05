import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapFriends = ({ friends, userLocation, radius }) => {
    const markerIcon = new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });

    if (!userLocation) {
        return <p>Your location is not set.</p>;
    }

    const userPosition = [userLocation.y, userLocation.x];

    return (
        <MapContainer center={userPosition} zoom={13} style={{ height: '300px', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={userPosition} icon={markerIcon}>
                <Popup>
                    <span>You are here</span>
                </Popup>
            </Marker>
            {radius && (
                <Circle
                    center={userPosition}
                    radius={radius * 1000}
                    color="blue"
                />
            )}
            {friends.map((friend) => (
                <Marker key={friend.objectId} position={[friend.myLocation.y, friend.myLocation.x]} icon={markerIcon}>
                    <Popup>{friend.username}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

MapFriends.propTypes = {
    friends: PropTypes.arrayOf(
        PropTypes.shape({
            objectId: PropTypes.string.isRequired,
            username: PropTypes.string.isRequired,
            myLocation: PropTypes.shape({
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired
            }).isRequired
        })
    ).isRequired,
    userLocation: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    }),
    radius: PropTypes.string
};

export default MapFriends;
