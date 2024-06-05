import React, {useState} from 'react';
import MapFriends from "./MapFriends";
import PropTypes from 'prop-types';

const SearchFriends = ({user, friends, handleAddFriend, searchResults, setSearchResults}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchRadius, setSearchRadius] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const handleSearch = async () => {
        if (!user.myLocation) {
            alert('Your location is not set. Enable location tracking in your profile.');
            return;
        }

        try {
            const searchLocation = `POINT(${user.myLocation.x} ${user.myLocation.y})`;
            const radiusClause = searchRadius
                ? `AND distanceOnSphere(myLocation, '${searchLocation}') <= ${searchRadius * 1000}`
                : '';
            const whereClause = `username LIKE '%${searchQuery}%' AND objectId != '${user.objectId}' AND myLocation is not null ${radiusClause}`;

            const query = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
            const results = await Backendless.Data.of('Users').find(query);

            const updatedResults = await Promise.all(results.map(async (result) => {
                const isFriend = friends.some(friend => friend.objectId === result.objectId);
                const existingRequest = await Backendless.Data.of('FriendRequests').findFirst(
                    Backendless.DataQueryBuilder.create()
                        .setWhereClause(
                            `(fromUser.objectId = '${user.objectId}' AND toUser.objectId = '${result.objectId}') OR 
                             (fromUser.objectId = '${result.objectId}' AND toUser.objectId = '${user.objectId}')`
                        )
                );
                return {
                    ...result,
                    isFriend,
                    requestStatus: existingRequest ? existingRequest.status : null,
                };
            }));

            setSearchResults(updatedResults);
        } catch (error) {
            console.error('Error searching for users:', error);
        }
    };

    return (
        <div>
            <div className="mb-3">
                <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="btn btn-primary">
                    {showSearch ? 'Close Search' : 'Search Friends'}
                </button>
            </div>

            {showSearch && (
                <>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Search for friends"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <input
                            type="number"
                            min="0"
                            className="form-control mt-2"
                            placeholder="Search radius in km"
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(e.target.value)}
                        />
                        <button
                            onClick={handleSearch}
                            className="btn btn-primary mt-2">
                            Search
                        </button>
                    </div>
                    <MapFriends friends={searchResults} userLocation={user?.myLocation} radius={searchRadius}/>

                    <ul className="list-group mb-4 mt-3">
                        <h6 className="text-center">Results</h6>
                        {searchResults.map((result) => {
                            let buttonComponent;
                            if (result.isFriend) {
                                buttonComponent =
                                    <button className="btn btn-secondary" disabled>Already Friend</button>;
                            } else if (result.requestStatus) {
                                buttonComponent = <button className="btn btn-secondary"
                                                          disabled>Request {result.requestStatus.toLowerCase()}</button>;
                            } else {
                                buttonComponent = <button onClick={() => handleAddFriend(result.objectId)}
                                                          className="btn btn-success">Add Friend</button>;
                            }
                            return (
                                <li key={result.objectId}
                                    className="list-group-item d-flex justify-content-between align-items-center">
                                    {result.username}
                                    {buttonComponent}
                                </li>
                            );
                        })}
                    </ul>

                </>
            )}
        </div>
    );
};

SearchFriends.propTypes = {
    user: PropTypes.object.isRequired,
    friends: PropTypes.array.isRequired,
    handleAddFriend: PropTypes.func.isRequired,
    searchResults: PropTypes.array.isRequired,
    setSearchResults: PropTypes.func.isRequired,
};

export default SearchFriends;
