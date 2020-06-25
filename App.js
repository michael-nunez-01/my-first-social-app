import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

import FeedScreen from 'Screens/MainScreen/FeedScreen.js';

/* TODO
Make screens for:
MessagesScreen
ProfileScreen
MessageView
PostView
*/

enableScreens();
const MainStack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
    	<MainStack.Navigator>
				<MainStack.Screen name='HomeTabs' component={HomeTabs}
					options={headerShown: false}
				/>
				<MainStack.Screen name='MessageView' component={MessageView} />
				<MainStack.Screen name='PostView' component={PostView} />
			</Stack.Navigator>
    </NavigationContainer>
  );
}

const HomeTab = createBottomTabNavigator(); 

function HomeTabs() {
  return (
    <HomeTab.Navigator
    	initialRouteName='Feed'
    	tabBarOptions={showLabel: true}
    	screenOptions={({route}) => ({
	    	tabBarIcon: {({ focused, color, size }) => {
					const iconName = 'hash';
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
				}}
    	})}
    	>
      <HomeTab.Screen name='Feed' component={FeedScreen} />
			<HomeTab.Screen name='Messages' component={MessagesScreen} />
			<HomeTab.Screen name='Profile' component={Profile} />
    </Tab.Navigator>
  );
}
