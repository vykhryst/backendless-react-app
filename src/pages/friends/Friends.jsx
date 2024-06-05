import React, {useState, useEffect, useCallback} from 'react';
import Backendless from 'backendless';
import MapFriends from "./MapFriends";
import SearchFriends from "./SearchFriends";

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
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
            setSearchResults(searchResults.map((result) => {
                if (result.objectId === friendId) {
                    return {
                        ...result,
                        requestStatus: 'SENT'
                    };
                }
                return result;
            }));
            alert('Friend request sent.')
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
        <div className="container mt-5 h-100">
            <h2 className="text-center mb-4">Friends</h2>
            <div className="row">

                <div className="col-xl-6">
                    <h5 className="mb-3">Friend Requests</h5>
                    <ul className="list-group mb-4">
                        {friendRequests.length === 0 ? (
                            <li className="list-group-item text-center">
                                <p className="mt-2 mb-2">No friend requests.</p>
                            </li>
                        ) : (
                            friendRequests.map((request) => (
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
                            ))
                        )}
                    </ul>

                    <h5 className="mb-3">Search for Friends</h5>
                    <SearchFriends searchResults={searchResults} setSearchResults={setSearchResults}
                                   friends={friends} user={user}
                                   handleAddFriend={handleAddFriend}/>

                </div>
                <div className="col-xl-6">
                    <h5 className="mb-3">Your Friends</h5>
                    <ul className="list-group mb-4">
                        {friends.length === 0 ? (
                            <li className="list-group-item text-center">
                                <p className="mt-2 mb-2">You have no friends.</p>
                            </li>
                        ) : (
                            friends.map((friend) => (
                                <li key={friend.objectId}
                                    className="list-group-item d-flex justify-content-between align-items-center">
                                    {friend.username}
                                    <button
                                        onClick={() => handleRemoveFriend(friend.objectId)}
                                        className="btn btn-danger">
                                        Remove Friend
                                    </button>
                                </li>
                            ))
                        )}
                    < /ul>
                    {friends.length > 0 && (
                        <MapFriends friends={friends} userLocation={user?.myLocation}/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Friends;
