import 'react-native-gesture-handler';
import React from 'react';
import { YellowBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

import FeedScreen from './Screens/HomeTabs/FeedScreen.js';
import MessagesScreen from './Screens/HomeTabs/MessagesScreen.js';
import ProfileScreen from './Screens/HomeTabs/ProfileScreen.js';

import PostingView from './Screens/MainStack/PostingView.js';
import PostView from './Screens/MainStack/PostView.js';
import WritingView from './Screens/MainStack/WritingView.js';
import ConverseView from './Screens/MainStack/ConverseView.js';

/* TODO
Then, make interactions for:
FeedScreen
MessagesScreen
ProfileScreen
PostingView
PostView
WriteView
ConverseView

Finally, replace temporary data for:
FeedScreen
MessagesScreen
ProfileScreen
PostView
*/
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
