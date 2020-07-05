import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, FlatList, SectionList, View, Text, TouchableHighlight, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import storage from 'react-native-simple-store';
import moment from 'moment';
import {default as Fake, NumberGenerator} from '../../Data/DataGenerator.js';
import {sortDataAscending} from '../../Data/DataInit.js';
import { FeedItem } from '../HomeTabs/FeedScreen.js';

export default function PostView({route, navigation}) {
  const {post, postingUser, contextUser} = route.params;
  const postObject = JSON.parse(post);
  const postingUserObject = JSON.parse(postingUser);
  const contextUserObject = JSON.parse(contextUser);
  
  const [pastPosts, setPastPosts] = useState([]);
  const [futurePosts, setFuturePosts] = useState([]);
  
  const allData = [
    {
      title: 'Start of thread',
      data: pastPosts
    },
    {
      title: 'Viewing post',
      data: [postObject]
    },
    {
      title: 'Replies',
      data: futurePosts
    }
  ];
  
  useEffect(() => {
    const fetchingPromise = (async () => {
      let feed = await storage.get('feed');
      
      const pastFeed = [];
      if (postObject.parentPost != null) {
        // Find all past posts
        for (thePost of feed) {
          if (postObject.parentPost == thePost.id)
            pastFeed.push(thePost);
          else for (pastFeedPost of pastFeed)
            if (pastFeedPost.parentPost == thePost.id) {
              pastFeed.push(thePost);
              break;
            }
        }
      }
      // Find all future posts
      const futureFeed = [];
      for (thePost of feed) {
        if (thePost.parentPost == postObject.id)
          futureFeed.push(thePost);
        else for (futureFeedPost of futureFeed)
          if (thePost.parentPost == futureFeedPost.id) {
            futureFeed.push(thePost);
            break;
          }
      }
      
      setPastPosts(pastFeed.sort(sortDataAscending));
      setFuturePosts(futureFeed.sort(sortDataAscending));
    });
    fetchingPromise().catch(error => console.error(error));
  }, [post]);
  
  useEffect(() => {
    if (route.params?.newPost) {
      try {
        const sendPromise = (async () => {
          const incomingPost = JSON.parse(route.params.newPost);
          const postsRef = await storage.get('feed');
          let mayPost = incomingPost.body != '';
          for (postRef of postsRef) {
            if (postRef.id == incomingPost.id) {
              mayPost = false;
              break;
            }
          }
          if (mayPost) {
            postsRef.push(incomingPost);
            storage.save('feed', postsRef)
              .then(() => {
                const futurePostsCopy = [...futurePosts]; // Shallow copy
                futurePostsCopy.push(incomingPost);
                setFuturePosts(futurePostsCopy);
              })
              .catch(error => console.error(error));
          }
          else throw new Error('The post already existed somehow; try again later.');
        });
        sendPromise().catch(error => console.error(error));
      }
      catch (error) {
        console.error(error);
      }
    }
  }, [route.params?.newPost]);
  
  return (
    <SectionList
      sections={allData}
      renderItem={({item, section}) => {
        switch (section.title) {
          case 'Viewing post': {
            return (
              <View style={{
                  borderWidth: 1,
                  borderColor: 'lightgrey',
                  borderRadius: 10,
                  backgroundColor: 'white',
                  margin: 10
                }}>
                <FeedItem item={item} contextUser={contextUserObject} onPress={null} />
              </View>
            );
          }
          case 'Replies': {
            return (<FeedItem item={item} mustPush={true} contextUser={contextUserObject} />);
          }
          case 'Start of thread': {
            return (
              <View style={{
                  backgroundColor: '#00000022',
                }}>
                <FeedItem item={item} mustPush={true} contextUser={contextUserObject} />
              </View>
            );
          }
        }
      }}
    />
  );
}
