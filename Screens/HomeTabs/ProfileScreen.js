import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableHighlight, ActivityIndicator } from 'react-native';
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
	const [isFollowed, setIsFollowed] = useState(false);	// TODO Temporary value; data from posts to follow
	
	useEffect(() => {
		DataInit().catch(error => console.warn(error)).finally(() => {
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
			fetchPromise();
		});
	}, []);
	
	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
      const fetchPromise = (async () => {
				let myUser = await storage.get('currentUser');
				let selectedUser = route.params?.user
					? JSON.parse(route.params.user)
					: myUser;
				
				let feed = (await storage.get('feed')).filter((post, index) => {
					return post.userId === selectedUser.id;
				});
				setPosts(feed != null ? feed.sort(sortDataDescending) : []);
				
				setIsLoaded(true);
			});
			fetchPromise();
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
	
	// TODO Objects must NOT be directly passed to navigation params, or it will interfere with state!
	return isLoaded
		? (
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
									onPress={() => alert('Message pressed!')}
								/>
								<ProfileButtonWithText
									disabled={currentUser.id == viewingUser.id}
									backgroundColor={isFollowed ? '#90DADF' : 'transparent'}
									text={isFollowed ? 'Following' : 'Follow'}
									iconName='plus-circle'
									textColor={isFollowed ? '#1C5A5E' : 'black'}
									underlayColor='#65cad1'
									onPress={() => {
										setIsFollowed(!isFollowed);
									}}
								/>
							</View>
							)
						}
					</View>
				}
				ListFooterComponent={ () =>
					<View style={{minHeight: 80, flex: 1, justifyContent: 'center', paddingHorizontal: 20}}>
						<Text style={{color: 'grey', fontStyle: 'italic'}}>End of profile reached</Text>
					</View>
				}
			/>
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


const styles = StyleSheet.create({
	
});
