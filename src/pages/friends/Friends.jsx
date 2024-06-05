import React, {useState, useEffect, useCallback} from 'react';
import Backendless from 'backendless';
import {Link} from 'react-router-dom';

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [user, setUser] = useState(null);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const currentUser = await Backendless.UserService.getCurrentUser();
            setUser(currentUser);
            await Promise.all([
                fetchFriends(currentUser.objectId),
                fetchFriendRequests(currentUser.objectId),
            ]);
        } catch (error) {
            console.error('Error getting current user:', error);
        }
    }, []);

    const fetchFriends = async (userId) => {
        try {
            const friendRelations = await Backendless.Data.of('Friends').find(
                Backendless.DataQueryBuilder.create()
                    .setWhereClause(`userOne.objectId = '${userId}' OR userTwo.objectId = '${userId}'`)
                    .setRelated(['userOne', 'userTwo'])
            );
            const friendsList = friendRelations.map((relation) =>
                relation.userOne.objectId === userId ? relation.userTwo : relation.userOne
            );
            setFriends(friendsList);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const fetchFriendRequests = async (userId) => {
        try {
            const requests = await Backendless.Data.of('FriendRequests').find(
                Backendless.DataQueryBuilder.create()
                    .setWhereClause(`status = 'PENDING' AND toUser.objectId = '${userId}'`)
                    .setRelated('fromUser')
            );
            setFriendRequests(requests);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        }
    };

    const handleSearch = async () => {
        try {
            const results = await Backendless.Data.of('Users').find(
                Backendless.DataQueryBuilder.create()
                    .setWhereClause(`username LIKE '%${searchQuery}%' AND objectId != '${user.objectId}'`)
            );

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

    const handleAddFriend = async (friendId) => {
        try {
            const existingRequest = await Backendless.Data.of('FriendRequests').findFirst(
                Backendless.DataQueryBuilder.create()
                    .setWhereClause(`fromUser.objectId = '${user.objectId}' AND toUser.objectId = '${friendId}'`)
            );

            if (existingRequest) {
                alert('Friend request already sent.');
                return;
            }

            const request = await Backendless.Data.of('FriendRequests').save({ownerId: user.objectId});
            await Promise.all([
                Backendless.Data.of('FriendRequests').setRelation(request.objectId, 'toUser', [{objectId: friendId}]),
                Backendless.Data.of('FriendRequests').setRelation(request.objectId, 'fromUser', [{objectId: user.objectId}])
            ]);
            alert('Friend request sent');
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const handleAcceptRequest = async (requestId, friendId) => {
        try {
            const savedFriend = await Backendless.Data.of('Friends').save({ownerId: user.objectId});
            await Promise.all([
                Backendless.Data.of('Friends').setRelation(savedFriend.objectId, 'userOne', [{objectId: user.objectId}]),
                Backendless.Data.of('Friends').setRelation(savedFriend.objectId, 'userTwo', [{objectId: friendId}]),
            ]);
            await Backendless.Data.of('FriendRequests').save({
                objectId: requestId,
                status: 'ACCEPTED',
            });
            setFriendRequests(friendRequests.filter((req) => req.objectId !== requestId));
            await fetchFriends(user.objectId);
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            await Backendless.Data.of('FriendRequests').save({
                objectId: requestId,
                status: 'DECLINED',
            });
            setFriendRequests(friendRequests.filter((req) => req.objectId !== requestId));
        } catch (error) {
            console.error('Error declining friend request:', error);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        try {
            const friendsWhereClause = `(userOne.objectId = '${user.objectId}' AND userTwo.objectId = '${friendId}') 
                OR (userOne.objectId = '${friendId}' AND userTwo.objectId = '${user.objectId}')`;
            await Backendless.Data.of('Friends').bulkDelete(friendsWhereClause);

            const friendWhereClause = `(fromUser.objectId = '${user.objectId}' AND toUser.objectId = '${friendId}') 
                OR (fromUser.objectId = '${friendId}' AND toUser.objectId = '${user.objectId}')`;
            await Backendless.Data.of('FriendRequests').bulkDelete(friendWhereClause);
            setFriends(friends.filter((friend) => friend.objectId !== friendId));
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    };

    useEffect(() => {
        fetchCurrentUser().then(r => r);
    }, [fetchCurrentUser]);

    return (
        <div className="container mt-5 h-100 col-xl-5">
            <h2 className="text-center mb-4">Friends</h2>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search for friends"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    onClick={handleSearch}
                    className="btn btn-primary mt-2">
                    Search
                </button>
            </div>

            <ul className="list-group mb-4">
                {searchResults.map((result) => (
                    <li key={result.objectId}
                        className="list-group-item d-flex justify-content-between align-items-center">
                        {result.username}
                        {result.isFriend ? (
                            <button className="btn btn-secondary" disabled>Already Friend</button>
                        ) : result.requestStatus ? (
                            <button className="btn btn-secondary"
                                    disabled>Request {result.requestStatus.toLowerCase()}</button>
                        ) : (
                            <button
                                onClick={() => handleAddFriend(result.objectId)}
                                className="btn btn-success">
                                Add Friend
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <h5 className="mb-3">Friend Requests</h5>
            <ul className="list-group mb-4">
                {friendRequests.map((request) => (
                    <li key={request.objectId}
                        className="list-group-item d-flex justify-content-between align-items-center">
                        {request.fromUser.username}
                        <div>
                            <button
                                onClick={() => handleAcceptRequest(request.objectId, request.fromUser.objectId)}
                                className="btn btn-success me-2">
                                Accept
                            </button>
                            <button
                                onClick={() => handleDeclineRequest(request.objectId)}
                                className="btn btn-danger">
                                Decline
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            <h5 className="mb-3">Your Friends</h5>
            <ul className="list-group mb-4">
                {friends.map((friend) => (
                    <li key={friend.objectId}
                        className="list-group-item d-flex justify-content-between align-items-center">
                        {friend.username}
                        <button
                            onClick={() => handleRemoveFriend(friend.objectId)}
                            className="btn btn-danger">
                            Remove Friend
                        </button>
                    </li>
                ))}
            </ul>

            <div className="row justify-content-center mt-4">
                <div className="col-md-10 col-lg-9 col-xl-12 text-center">
                    <Link to="/profile" className="btn btn-secondary me-md-2 mb-2 mb-md-0">
                        Back to Profile
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Friends;
