import React, {useState, useEffect} from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import storage from 'react-native-simple-store';
import {sortDataDescending} from '../../Data/DataInit.js';
import { FeedItem } from '../HomeTabs/FeedScreen.js';

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
  const [data, setData] = useState([]);
  
  const fetchPromise = (async () => {
    const allFaves = await storage.get('userFavesPost');
    // Get all faves from this user
    // NOTE: This sorts my recently favorited, not by chronological order.
    const myFaves = allFaves.sort(sortDataDescending).filter(fave => {
      return fave.userId == viewingUser.id;
    });
    
    const posts = await storage.get('feed');
    const favedPosts = myFaves.map(fave => posts.find(post => post.id == fave.postId));
    
    setData(favedPosts);
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
      renderItem={({item}) => <FeedItem item={item} contextUser={currentUser} mustPush={true} />}
      keyExtractor={item => item.id.toString()}
    />
  );
}
