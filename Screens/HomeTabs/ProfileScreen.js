import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableHighlight, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import storage from 'react-native-simple-store';
import moment from 'moment';
import {default as Fake} from '../../Data/DataGenerator.js';
import DataInit, {sortDataDescending} from '../../Data/DataInit.js';
import { FeedItem } from './FeedScreen.js';

export default function ProfileScreen({route, navigation}) {
  const [posts, setPosts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [followCount, setFollowCount] = useState(null); // How many follow this person
  const [followingCount, setFollowingCount] = useState(null); // How many this person is following
  const [faveCount, setFaveCount] = useState(null); // How many this person favorited
  
  const areStatsLoaded = followCount != null && followingCount != null && faveCount != null;
  
  const fetchPromise = (async () => {
    let myUser = await storage.get('currentUser');
    let selectedUser = route.params?.user
      ? JSON.parse(route.params.user)
      : myUser;
    setCurrentUser(myUser);
    setViewingUser(selectedUser);
    setIsFollowed(myUser.id == selectedUser.id);
    
    let feed = (await storage.get('feed')).filter((post, index) => {
      return post.userId === selectedUser.id;
    });
    setPosts(feed != null ? feed.sort(sortDataDescending) : []);
    
    setIsLoaded(true);
  });
  const followPromise = (async () => {
    if (currentUser === null) throw new Error('Current user was not set yet!!!');
    const toFollow = (await storage.get('userFollowsUser')).filter(follow => {
      return follow.userId == currentUser.id && follow.targetId == viewingUser.id;
    });
    toFollow.forEach(follow => {
      if (isFollowed == false)
        setIsFollowed(true);
    });
    if (toFollow.length <= 0)
      setIsFollowed(false);
  });
  const statsPromise = (async () => {
    if (currentUser === null) throw new Error('Current user was not set yet!!!');
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
  
  useEffect(() => {
    if (currentUser != null && viewingUser != null) {
      followPromise().catch(error => console.error(error));
      statsPromise().catch(error => console.error(error));
    }
  }, [currentUser, viewingUser]);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      DataInit().catch(error => console.warn(error)).finally(() => {
        if (currentUser === null && viewingUser === null) {
          fetchPromise().catch(error => console.error(error));
        }
      });
    });
    return unsubscribe;
  }, [navigation]);
  
  useEffect(() => {
    if (route.params?.newPost) {
      try {
        const sendPromise = (async () => {
          const incomingPost = JSON.parse(route.params.newPost);
          const postsRef = posts;
          if (postsRef == null)
            postsRef = await storage.get('feed');
          let mayPost = incomingPost.body != '';
          for (post of postsRef)
            if (post.id == incomingPost.id) {
              mayPost = false;
              break;
            }
          if (mayPost) {
            postsRef.push(incomingPost);
            setPosts(postsRef.sort(sortDataDescending));
            storage.save('feed', posts)
              .catch(error => {throw error;});
          }
          else throw new Error('The post contents did not meet the valid criteria.');
        });
        sendPromise().catch(error => console.error(error));
      }
      catch (error) {
        console.error(error);
      }
    }
    return (() => {
      
    });
  }, [route.params?.newPost]);
  
  return isLoaded
    ? (
    <>
      <FlatList
        data={posts}
        renderItem={({item}) => <FeedItem item={item} contextUser={currentUser} />}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}>
            <View style={{
              fles: 1,
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: 'lightgrey',
                width: 135,
                length: 135,
                borderRadius: 75
                }}
                >
                <Text style={{width: 135, height: 135}}></Text>
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={{
                  fontSize: 24
                }}>{viewingUser.displayName}</Text>
                <Text style={{
                  fontSize: 16,
                  color: '#2A878D'
                }}>@{viewingUser.name}</Text>
              </View>
            </View>
            {areStatsLoaded
              ? (
              <View style={{
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'space-evenly',
                borderTopWidth: StyleSheet.hairlineWidth,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderColor: 'lightgrey',
                paddingVertical: 10,
                marginTop: 10
                }}>
                <TouchableOpacity style={{flex: 1, alignItems: 'center'}}
                  onPress={() => {
                    // TODO Open new screen
                    navigation.push('StatsTabs', {
                      viewingUser: JSON.stringify(viewingUser),
                      screen: 'Followers',
                      params: {
                        currentUser: JSON.stringify(currentUser),
                        viewingUser: JSON.stringify(viewingUser),
                      }
                    });
                  }}>
                  <Text style={{fontSize: 24}}>
                    {shortenedValueAsString(followingCount)}
                  </Text>
                  <Text>Followers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex: 1, alignItems: 'center'}}
                  onPress={() => {
                    // TODO Open new screen
                    navigation.push('StatsTabs', {
                      viewingUser: JSON.stringify(viewingUser),
                      screen: 'Following',
                      params: {
                        currentUser: JSON.stringify(currentUser),
                        viewingUser: JSON.stringify(viewingUser),
                      }
                    });
                  }}>
                  <Text style={{fontSize: 24}}>
                    {shortenedValueAsString(followCount)}
                  </Text>
                  <Text>Following</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex: 1, alignItems: 'center'}}
                  onPress={() => {
                    // TODO Open new screen
                    navigation.push('StatsTabs', {
                      viewingUser: JSON.stringify(viewingUser),
                      screen: 'Favorites',
                      params: {
                        currentUser: JSON.stringify(currentUser),
                        viewingUser: JSON.stringify(viewingUser),
                      }
                    });
                  }}>
                  <Text style={{fontSize: 24}}>
                    {shortenedValueAsString(faveCount)}
                  </Text>
                  <Text>Favorites</Text>
                </TouchableOpacity>
              </View>
              )
              : null
            }
            {currentUser.id == viewingUser.id
              ? null
              : (
              <View style={{
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'space-evenly',
                marginTop: 10
                }}>
                <ProfileButtonWithText
                  text='Message'
                  iconName='message-square'
                  textColor='black'
                  underlayColor='#A68BBB'
                  onPress={() => navigation.navigate('WritingView', {
                    viewingUser: JSON.stringify(currentUser),
                    receivingUser: JSON.stringify(viewingUser)
                  })}
                />
                <ProfileButtonWithText
                  disabled={currentUser.id == viewingUser.id}
                  backgroundColor={isFollowed ? '#90DADF' : 'transparent'}
                  text={isFollowed ? 'Following' : 'Follow'}
                  iconName={isFollowed ? 'check' : 'plus-circle'}
                  textColor={isFollowed ? '#1C5A5E' : 'black'}
                  underlayColor='#65cad1'
                  onPress={() => {
                    storage.get('userFollowsUser')
                      .then(follows => {
                        let newFollowStatus, oldFollowIndex;
                        if (follows != null) {
                          const myFollows = [...follows].filter((follow, index) => {
                            const shouldRemove = follow.userId == currentUser.id && follow.targetId == viewingUser.id;
                            if (shouldRemove && oldFollowIndex === undefined)
                              oldFollowIndex = index;
                            return shouldRemove;
                          })
                          if (myFollows.length > 1) throw new Error('Too many follows for the current user!');
                          else if (myFollows.length == 1)
                            newFollowStatus = false;
                        }
                        if (newFollowStatus === undefined)
                          newFollowStatus = true;
                        if (currentUser.id == viewingUser.id)
                          throw new Error('You are not allowed to follow yourself.');
                        
                        switch (newFollowStatus) {
                          case false: {
                            if (oldFollowIndex === undefined) throw new Error('The old follow was not found!');
                            if (follows.splice(oldFollowIndex, 1).length != 1)
                              throw new Error('Follow removal failed!');
                            break;
                          }
                          case true: {
                            follows.push({
                              userId: currentUser.id,
                              targetId: viewingUser.id,
                              dateCreated: Date.now()
                            })
                            break;
                          }
                        }
                        return storage.save('userFollowsUser', follows)
                                .then(() => setIsFollowed(newFollowStatus));
                      })
                      .catch(error => console.error(error));
                  }}
                />
              </View>
              )
            }
          </View>
        }
        ListFooterComponent={ () =>
          <View style={{minHeight: 80, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20}}>
            <Text style={{color: 'grey', fontStyle: 'italic'}}>{null}</Text>
            {currentUser.id == viewingUser.id
              ? (
              <Icon.Button name='trash-2'
                backgroundColor='#ab2346'
                iconStyle={{marginRight: 10}}
                color='white'
                onPress={() => {
                  storage.keys()
                    .then(keys => Promise.all(keys.map(key => storage.delete(key))))
                    .then(values => {
                      values.forEach(() => {}); // Nothing really; to confirm all keys were removed.
                      console.error('All keys cleared! Time to reset the app.');
                    })
                }}
                >
                [DEV] Clear data
              </Icon.Button>
              )
              : null
            }
          </View>
        }
      />
    </>
    )
    : (<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size='large' style={{height: 50, width: 50}} />
      </View>);
}

export function ProfileButtonWithText({ backgroundColor='transparent', underlayColor, onPress, iconName, textColor, text }) {
  return (
    <TouchableHighlight
      underlayColor={underlayColor}
      onPress={onPress}
      style={{
        backgroundColor: backgroundColor,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'lightgrey'
      }}
      >
      <View style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10
        }}>
        <Icon name={iconName} size={32} color={textColor} />
        <Text style={{color: textColor}}>{text}</Text>
      </View>
    </TouchableHighlight>
  );
}

export function shortenedValueAsString(number) {
  if (!Number.isInteger(number))
    throw new Error('Input wasn\'t an integer value.');
  let newString = number.toString();
  if (number > 1000)
    newString = `${(number/1000).toFixed(1)}k`
  return newString;
}

const styles = StyleSheet.create({
  
});
