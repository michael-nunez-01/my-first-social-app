import React, {useState, useEffect} from 'react';
import { StyleSheet, View, Text, FlatList, TouchableHighlight } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import storage from 'react-native-simple-store';
import {sortDataDescending} from '../../Data/DataInit.js';
import { UserItem } from './FollowingScreen.js';

export default function FollowersScreen(props) {
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
  
  const fetchPromise = (async () => {
    const allFollows = await storage.get('userFollowsUser');
    // Get all follows to this user
    const myFollows = allFollows.sort(sortDataDescending).filter(follow => {
      return follow.targetId == viewingUser.id;
    });
    const users = await storage.get('users');
    const selectedUsers = myFollows.map(followItem => {
      const targetUser = users.find(user => user.id == followItem.userId);
      // Set a special attribute to tell if the user is followed by the current user.
      if (targetUser !== undefined)
        targetUser.isFollowed = allFollows.filter(follow => {
          return follow.userId == currentUser.id && follow.targetId == targetUser.id;
        }).length === 1;
      return targetUser;
    });
    setData(selectedUsers);
  });
  
  useEffect(() => {
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
