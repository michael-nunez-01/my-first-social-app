import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableHighlight, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import storage from 'react-native-simple-store';
import moment from 'moment';
import {default as Fake} from '../../Data/DataGenerator.js';
import DataInit, {sortDataDescending} from '../../Data/DataInit.js';

export default function FeedScreen({route, navigation}) {
	const [posts, setPosts] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [currentUser, setCurrentUser] = useState(null);
	
	useEffect(() => {
		DataInit().catch(error => console.warn(error)).finally(() => {
			storage.get('feed')
				.then(feed => {
					setPosts(feed != null ? feed.sort(sortDataDescending) : []);
					return storage.get('currentUser');
				})
				.then(user => {
					setCurrentUser(user);
				})
				.finally(() => setIsLoaded(true));
		});
	}, []);
	
	useEffect(() => {
		if (route.params?.newPost) {
			try {
				const incomingPost = JSON.parse(route.params.newPost);
				const postsRef = posts;
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
			}
			catch (error) {
				console.error(error);
				alert(error.message);
			}
		}
	}, [route.params?.newPost]);
	
	// TODO Objects must NOT be directly passed to navigation params, or it will interfere with state!
	return isLoaded
		? (
			<>
				<FlatList
					data={posts}
					renderItem={({item}) => <FeedItem item={item} />}
					keyExtractor={(item) => item.id.toString()}
					ListFooterComponent={ () =>
						<View style={{minHeight: 80, flex: 1, justifyContent: 'center', paddingHorizontal: 20}}>
							<Text style={{color: 'grey', fontStyle: 'italic'}}>End of feed reached</Text>
						</View>
					}
				/>
				<View style={{
						position: 'absolute',
						bottom: 0,
						right: 0,
						padding: 20,
						flex: 1,
						flexDirection: 'row'
					}}>
					<View>
						<Icon.Button name='plus'
							backgroundColor='#65cad1'
							color='black'
							onPress={() => {
								navigation.navigate('PostingView', {postingUserId: currentUser.id});
							}}
							>
							New post
						</Icon.Button>
					</View>
					<View style={{marginLeft: 10}}>
						<Icon.Button name='search'
							backgroundColor='lightgrey'
							iconStyle={{marginRight: 0}}
							color='black'
							onPress={() => {
								//alert('Search pressed!\nThis feature is pending!');
								// TODO The actions here are temporary and for debugging purposes!
								storage.keys()
									.then(keys => Promise.all(keys.map(key => storage.delete(key))))
									.then(values => {
										values.forEach(() => {}); // Nothing really; to confirm all keys were removed.
										console.error('All keys cleared! Time to reset the app.');
									})
							}}
							>
						</Icon.Button>
					</View>
				</View>
			</>
			)
		: (
			<View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
				<ActivityIndicator size='large' style={{height: 50, width: 50}} />
			</View>
			);
}

export function FeedItem({item, onPress}) {
	const [isFaved, setIsFaved] = useState(false);	// TODO Temporary value; data from posts to follow
	const [postingUser, setPostingUser] = useState({});
	const navigation = useNavigation();
	
	if (onPress === undefined)
		onPress = ()=>navigation.navigate('PostView', {post: item, postingUser: user});
	
	useEffect(() => {
		storage.get('users')
			.then(users => {
			 	for (user of users)
					if (user.id == item.userId)
						return Promise.resolve(user);
				return Promise.resolve({});
			})
			.then(user => {
				setPostingUser(typeof user === 'object' ? user : {});
				// Anything else to do with the user object?
			});
	}, []);
	
	const postDateMoment = moment(item.dateCreated.valueOf());
	const postEditedMoment = moment(item.dateModified.valueOf());
	
	return (
		<TouchableWithoutFeedback onPress={onPress}>
			<View style={{
				paddingHorizontal: 20,
				paddingVertical: 10
			}}>
				<View style={{
					flex: 1,
					flexDirection: 'row',
					flexWrap: 'nowrap',
					alignItems: 'center',
					marginBottom: 5
				}}>
					<View style={{
						backgroundColor: 'lightgrey',
						width: 50,
						length: 50,
						borderRadius: 50
						}}
						>
						<Text style={{width: 50, height: 50}}></Text>
					</View>
					<View style={{
						flexGrow: 1,
						marginLeft: 10
					}}>
						<Text style={{
							fontSize: 18
						}}>
							{postingUser?.displayName
								? postingUser.displayName
								: <Icon name='more-horizontal' size={18} color='lightgrey' />
							}
						</Text>
						<Text style={{
							color: 'grey'
						}}>
							{ postDateMoment.isBefore(postEditedMoment)
								? postEditedMoment.fromNow().toString().concat(' • ','Edited')
								: postDateMoment.fromNow()
							}
						</Text>
					</View>
				</View>
				<View>
					<Text>{item.body}</Text>
				</View>
				<View style={{
					flex: 1,
					flexDirection: 'row',
					flexWrap: 'nowrap',
					justifyContent: 'space-around'
				}}>
					{/*TODO Put buttons and their associated numbers here*/}
					<FeedButtonWithText
						text='Reply'
						iconName='corner-down-left'
						textColor='black'
						underlayColor='#65cad1'
						onPress={() => alert('Reply pressed!')}
					/>
					<FeedButtonWithText
						backgroundColor={isFaved ? '#efc88bff' : 'transparent'}
						text='Favorite'
						iconName='star'
						textColor={isFaved ? '#48300A' : 'black'}
						underlayColor='#E4A33A'
						onPress={() => {
							setIsFaved(!isFaved);
						}}
					/>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}

export function FeedButtonWithText({ backgroundColor='transparent', underlayColor, onPress, iconName, textColor, text }) {
	return (
		<TouchableHighlight
			underlayColor={underlayColor}
			onPress={onPress}
			style={{
				backgroundColor: backgroundColor,
				flexGrow: 1,
				borderRadius: 10}}
			>
			<View style={{
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				paddingHorizontal: 20,
				paddingVertical: 10
				}}>
				<Icon name={iconName} size={18} color={textColor} />
				<Text style={{color: textColor, marginLeft: 10}}>{text}</Text>
			</View>
		</TouchableHighlight>
	);
}

const styles = StyleSheet.create({
	
});
