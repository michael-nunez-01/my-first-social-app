import React, {useState, useEffect} from 'react';
import { StyleSheet, View, Text, FlatList, TouchableHighlight } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import storage from 'react-native-simple-store';
import {sortDataDescending} from '../../Data/DataInit.js';

export default function FollowingScreen(props) {
  let targetParams = props.route?.params;
  if (targetParams === undefined || !targetParams?.currentUser) {
    const routes = useNavigationState(state => state.routes);
    for (selectedRoute of routes) {
      if (!targetParams?.currentUser && selectedRoute.params?.currentUser) {
        targetParams = selectedRoute.params;
        break;
      }
    }
  }
  let navigation = props?.navigation;
  if (navigation === undefined || navigation === null)
    navigation = useNavigation();
  const currentUser = JSON.parse(targetParams.currentUser);
  const viewingUser = JSON.parse(targetParams.viewingUser);
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchPromise = (async () => {
      const allFollows = await storage.get('userFollowsUser');
      // Get all follows from this user
      const followingMe = allFollows.sort(sortDataDescending).filter(follow => {
        return follow.userId == viewingUser.id;
      });
      const users = await storage.get('users');
      const selectedUsers = followingMe.map(followItem => {
        const targetUser = users.find(user => user.id == followItem.targetId);
        // Set a special attribute to tell if the user is followed by the current user.
        if (targetUser !== undefined)
          targetUser.isFollowed = allFollows.filter(follow => {
            return follow.userId == currentUser.id && follow.targetId == targetUser.id;
          }).length === 1;
        return targetUser;
      });
      setData(selectedUsers);
    });
    const unsub = navigation.addListener('focus', () => {
      fetchPromise().catch(error => console.error(error));
    });
    return unsub;
  }, [navigation]);
  return (
    <FlatList
      data={data}
      renderItem={({item}) => <UserItem item={item} currentUser={currentUser} />}
      ItemSeparatorComponent={ () =>
        <View style={{
          height: 1,
          width: 'auto',
          borderBottomColor: 'lightgrey',
          borderBottomWidth: StyleSheet.hairlineWidth
        }}></View>
      }
      keyExtractor={item => item.id.toString()}
    />
  );
}

export function UserItem({item, currentUser}) {
  const navigation = useNavigation();
  const isCurrentUser = item.id == currentUser.id;
  // Uses special attribute (see above)
  const [isFollowing, setIsFollowing] = useState(item.isFollowed);
  
  useEffect(() => {
    // This listener triggers not upon first load, but upon first return to this screen.
    const unsub = navigation.addListener('focus', () => {
      storage.get('userFollowsUser')
        .then(follows => {
          // TODO If previous entries are kept, see if the follow state is reacquired.
          // Get the record showing that the current user is following this user (item)
          const thisFollowers = follows.filter(follow =>
            follow.userId == currentUser.id && follow.targetId == item.id
          );
          if (thisFollowers.length > 1) throw new Error('There cannot be more than one follow record!');
          else if (thisFollowers.length === 0)
            setIsFollowing(false);
          else
            setIsFollowing(true);
        })
        .catch(error => console.error(error));
    });
    return unsub;
  }, [navigation]);
  return (
    <TouchableHighlight underlayColor='#65cad1'
      onPress={ ()=>navigation.push('ProfileView', {user: JSON.stringify(item)}) }>
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 10,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
        }}>
        <View style={{
          backgroundColor: 'lightgrey',
          width: 50,
          length: 50,
          borderRadius: 50
          }}
          >
          <Text style={{width: 50, height: 50}}></Text>
        </View>
        <View style={{
          marginLeft: 10,
          flex: 1,
          flexDirection: 'column'
          }}>
          <View style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center'
            }}>
            <Text>
              {item.displayName}
            </Text>
          </View>
          <View>
            <Text style={{
              color: 'grey',
              fontSize: 12
            }}>
              {'@'+item.name}
            </Text>
          </View>
        </View>
        {/* TODO Put additional buttons here; will be displayed as row */}
        { isCurrentUser
          ? null
          : (
            <View>
              <TouchableHighlight
                underlayColor='#33acb5'
                style={{
                  backgroundColor: isFollowing ? '#90DADF' : 'transparent',
                  borderWidth: 1,
                  borderColor: 'lightgrey',
                  borderRadius: 10,
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                onPress={() => {
                  let expectedFollow = isFollowing;
                  storage.get('userFollowsUser')
                    .then(follows => {
                      // Get the record showing that the current user is following this user (item)
                      const thisFollowers = follows.filter(follow =>
                        follow.userId == currentUser.id && follow.targetId == item.id
                      );
                      if (thisFollowers.length > 1) throw new Error('There cannot be more than one follow record!');
                      else if (thisFollowers.length === 0) {
                        expectedFollow = true;
                        return storage.push('userFollowsUser', {
                          userId: currentUser.id,
                          targetId: item.id,
                          dateCreated: Date.now()
                        });
                      }
                      else {
                        const toRemove = thisFollowers[0];
                        const newFollows = follows.filter(follow =>
                          follow.userId != toRemove.userId || follow.targetId != toRemove.targetId
                        );
                        expectedFollow = false;
                        return storage.save('userFollowsUser', newFollows);
                      }
                    })
                    .then(() => setIsFollowing(expectedFollow))
                    .catch(error => console.error(error));
                }}
                >
                <>
                  <Icon name={isFollowing ? 'check' : 'plus-circle'}
                    size={20} color={isFollowing ? '#1C5A5E' : 'black'} />
                  <Text style={{
                    color: isFollowing ? '#1C5A5E' : 'black',
                    marginLeft: 10
                    }}>{isFollowing ? 'Following' : 'Follow'}</Text>
                </>
              </TouchableHighlight>
            </View>
          )
        }
      </View>
    </TouchableHighlight>
  );
}
