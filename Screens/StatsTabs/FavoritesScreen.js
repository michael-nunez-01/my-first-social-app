import React, {useState, useEffect} from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import storage from 'react-native-simple-store';

export default function FavoritesScreen(props) {
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
  
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Favorites</Text>
    </View>
  );
}
