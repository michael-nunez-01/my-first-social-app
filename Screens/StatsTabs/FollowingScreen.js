import React, {useState, useEffect} from 'react';
import { StyleSheet, View, Text, FlatList, TouchableHighlight } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import storage from 'react-native-simple-store';

export default function FollowingScreen({route, navigation}) {
  let targetParams = route.params;
  if (!targetParams?.currentUser) {
    const routes = useNavigationState(state => state.routes);
    for (selectedRoute of routes) {
      if (!targetParams?.currentUser && selectedRoute.params?.currentUser) {
        targetParams = selectedRoute.params;
        break;
      }
    }
  }
  const currentUser = JSON.parse(targetParams.currentUser);
  const viewingUser = JSON.parse(targetParams.viewingUser);
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchPromise = (async () => {
      const allFollows = await storage.get('userFollowsUser');
      // Get all follows from this user
      const followingMe = allFollows.filter(follow => {
        return follow.userId == viewingUser.id;
      });
      const users = await storage.get('users');
      const selectedUsers = followingMe.map(followItem => {
        return users.find(user => user.id == followItem.targetId);
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

function UserItem({item, currentUser}) {
  const navigation = useNavigation();
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
          alignSelf: 'flex-start',
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
      </View>
    </TouchableHighlight>
  );
}
