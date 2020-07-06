import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { YellowBox, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Feather';
import storage from 'react-native-simple-store';

import FeedScreen from './Screens/HomeTabs/FeedScreen.js';
import MessagesScreen from './Screens/HomeTabs/MessagesScreen.js';
import ProfileScreen, { shortenedValueAsString } from './Screens/HomeTabs/ProfileScreen.js';

import FollowersScreen from './Screens/StatsTabs/FollowersScreen.js';
import FollowingScreen from './Screens/StatsTabs/FollowingScreen.js';
import FavoritesScreen from './Screens/StatsTabs/FavoritesScreen.js';

import PostingView from './Screens/MainStack/PostingView.js';
import PostView from './Screens/MainStack/PostView.js';
import WritingView from './Screens/MainStack/WritingView.js';
import ConverseView from './Screens/MainStack/ConverseView.js';

YellowBox.ignoreWarnings([
  'ReactNativeFiberHostComponent: '
  +'Calling `getNode()` on the ref of an Animated component is no longer necessary.'
]);

const MainStack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <MainStack.Navigator mode='modal'>
        <MainStack.Screen name='HomeTabs' component={HomeTabs}
          options={{headerShown: false}}
        />
        <MainStack.Screen name='StatsTabs' component={StatsTabs}
          options={{
            headerShown: true,
            headerStyle: {
              elevation: 0,
              shadowOpacity: 0
            }
          }}
        />
        <MainStack.Screen name='PostingView' component={PostingView}
          options={{title: 'Write post'}}
        />
        <MainStack.Screen name='PostView' component={PostView}
          options={{title: 'View post'}}
        />
        <MainStack.Screen name='WritingView' component={WritingView}
          options={{title: 'Write message'}}
        />
        <MainStack.Screen name='ConverseView' component={ConverseView}
          options={{title: 'View conversation'}}
        />
        <MainStack.Screen name='ProfileView' component={ProfileScreen}
          options={{title: '', headerTransparent: true}}
        />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}

const HomeTab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <HomeTab.Navigator
      initialRouteName='Feed'
      tabBarOptions={{
        showIcon: true,
        showLabel: true,
        keyboardHidesTabBar: true
      }}
      screenOptions={({route}) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'hash';
          switch (route.name) {
            case 'Feed': {
              iconName = 'align-left';
              break;
            }
            case 'Messages': {
              iconName = 'message-square';
              break;
            }
            case 'Profile': {
              iconName = 'user';
              break;
            }
          }
          return <Icon name={iconName} color={color} size={size} />
        }
      })}
      >
      <HomeTab.Screen name='Feed' component={FeedScreen} />
      <HomeTab.Screen name='Messages' component={MessagesScreen} />
      <HomeTab.Screen name='Profile' component={ProfileScreen} />
    </HomeTab.Navigator>
  );
}

const StatsTab = createMaterialTopTabNavigator();

function StatsTabs({route, navigation}) {
  const viewingUser = JSON.parse(route.params.viewingUser);
  const [followCount, setFollowCount] = useState(null); // How many follow this person
  const [followingCount, setFollowingCount] = useState(null); // How many this person is following
  const [faveCount, setFaveCount] = useState(null); // How many this person favorited
  
  const iconPlaceholder = <Icon name='more-horizontal' size={24} color='lightgrey' />;
  
  const statsPromise = (async () => {
    // if (currentUser === null) throw new Error('Current user was not set yet!!!');
    const allFollows = await storage.get('userFollowsUser');
    // Count all follows from this user
    const myFollows = allFollows.filter(follow => {
      return follow.userId == viewingUser.id;
    });
    setFollowCount(myFollows.length);
    // Count all follows to this user
    const followingMe = allFollows.filter(follow => {
      return follow.targetId == viewingUser.id;
    });
    setFollowingCount(followingMe.length);
    // Count all this user's favorites
    const allFaves = await storage.get('userFavesPost');
    const myFaves = allFaves.filter(fave => {
      return fave.userId == viewingUser.id;
    });
    setFaveCount(myFaves.length);
  });
  
  const areStatsLoaded = followCount != null && followingCount != null && faveCount != null;
  if (!areStatsLoaded)
    statsPromise().catch(error => console.error(error));
  
  return (
    <StatsTab.Navigator
      backBehavior='initialRoute'
      tabBarOptions={{
        showIcon: false,
        showLabel: true
      }}
      screenOptions={({route}) => ({
        tabBarLabel: ({focused, color}) => {
          let countString = iconPlaceholder;
          switch (route.name) {
            case 'Followers': {
              if (followingCount !== null)
                countString = shortenedValueAsString(followingCount);
              break;
            }
            case 'Following': {
              if (followCount !== null)
                countString = shortenedValueAsString(followCount);
              break;
            }
            case 'Favorites': {
              if (faveCount !== null)
                countString = shortenedValueAsString(faveCount);
              break;
            }
          }
          return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{
                fontSize: 24,
                color: color
              }}>{countString}</Text>
              <Text style={{
                fontSize: 14,
                color: color
              }}>{route.name}</Text>
            </View>
          )
        }
      })}>
      <StatsTab.Screen name='Followers' component={FollowersScreen} />
      <StatsTab.Screen name='Following' component={FollowingScreen} />
      <StatsTab.Screen name='Favorites' component={FavoritesScreen} />
    </StatsTab.Navigator>
  );
}
