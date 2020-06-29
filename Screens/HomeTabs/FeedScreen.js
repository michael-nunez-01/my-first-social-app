import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableHighlight, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import Collapsible from 'react-native-collapsible';
import storage from 'react-native-simple-store';
import moment from 'moment';
import {default as Fake, NumberGenerator, DEFAULT_POST_ID_LIMIT} from '../../Data/DataGenerator.js';
import DataInit, {sortDataDescending} from '../../Data/DataInit.js';
import { PostingTextBox } from '../MainStack/PostingView.js';

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
		const unsubscribe = navigation.addListener('focus', () => {
      storage.get('feed')
				.then(feed => {
					setPosts(feed != null ? feed.sort(sortDataDescending) : []);
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
						storage.save('feed', postsRef)
							.catch(error => {throw error;});
					}
					else throw new Error('The post contents did not meet the valid criteria.');
				});
				sendPromise();
			}
			catch (error) {
				console.error(error);
			}
		}
	}, [route.params?.newPost]);
	
	// TODO Objects must NOT be directly passed to navigation params, or it will interfere with state!
	return isLoaded
		? (
			<>
				<FlatList
					data={posts}
					renderItem={({item}) => <FeedItem item={item} contextUser={currentUser} />}
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
							onPress={() => alert('Search pressed!\nThis feature is pending!')}
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

// TODO There is a bug on submit in the Collapsible;
// the button needs another press to actually respond.
// React says that might be a source for memory leaks,
// and that I should dispose of the object when I'm done.
export function FeedItem({item, contextUser, mustPush, onPress}) {
	const [isFaved, setIsFaved] = useState(false);	// TODO Temporary value; data from posts to follow
	const [isReplying, setIsReplying] = useState(false);
	const [postingUser, setPostingUser] = useState({});
	const [repliedToUser, setRepliedToUser] = useState(null);
	const navigation = useNavigation();
	
	if (onPress === undefined) {
		if (mustPush !== undefined && mustPush)
			onPress = ()=>navigation.push('PostView', {
				post: JSON.stringify(item),
				postingUser: JSON.stringify(postingUser),
				contextUser: JSON.stringify(contextUser)
			});
		else
			onPress = ()=>navigation.navigate('PostView', {
				post: JSON.stringify(item),
				postingUser: JSON.stringify(postingUser),
				contextUser: JSON.stringify(contextUser)
			});
	}
	
	useEffect(() => {
		const userDetailsPromise = (async () => {
			let users = await storage.get('users');
			let assignedPostingUser = null;
			for (user of users)
				if (user.id == item.userId)
					assignedPostingUser = user;
			setPostingUser(assignedPostingUser);
			
			if (item.parentPost !== undefined && item.parentPost != null) {
				let assignedRepliedToUser = null;
				let otherPosts = (await storage.get('feed')).filter(post => {
					return post.id == item.parentPost;
				});
				for (otherPost of otherPosts) {
					for (user of users)
						if (user.id == otherPost.userId) {
							assignedRepliedToUser = user;
							break;
						}
					if (assignedRepliedToUser != null) break;
				}
				setRepliedToUser(assignedRepliedToUser);
			}
		});
		const favoritePromise = (async () => {
			let faves = await storage.get('userFavesPost');
			if (faves != null) {
				const filteredFaves = faves.filter(favorite => {
					return favorite.userId == contextUser.id && favorite.postId == item.id;
				});
				filteredFaves.forEach(favorite => {
					if (isFaved == false)
						setIsFaved(true);
				});
				if (filteredFaves.length <= 0) setIsFaved(false);
			}
		});
		
		userDetailsPromise().catch(error => console.error(error));
		favoritePromise().catch(error => console.error(error));
	}, [item]);
	
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
					<TouchableWithoutFeedback onPress={() => {
							if (Object.keys(postingUser).length > 0)
								navigation.push('ProfileView', {user: JSON.stringify(postingUser)});
							else console.warn('Oops! You weren\'t supposed to touch that mock data!');
						}}>
						<View style={{
							backgroundColor: 'lightgrey',
							width: 50,
							length: 50,
							borderRadius: 50,
							borderWidth: StyleSheet.hairlineWidth,
							borderColor: 'grey'
						}}>
							<Text style={{width: 50, height: 50}}></Text>
						</View>
					</TouchableWithoutFeedback>
					<View style={{
						flexGrow: 1,
						marginLeft: 10
					}}>
						<View style={{maxWidth: '90%'}}>
							<Text style={{
								fontSize: 18
							}}>
								{postingUser?.displayName
									? postingUser.displayName
									: <Icon name='more-horizontal' size={18} color='lightgrey' />
								}
							</Text>
						</View>
						<View style={{
								maxWidth: '90%',
								display: 'flex',
								flexDirection: 'row',
								flexWrap: 'wrap',
								alignItems: 'center'
							}}>
							{ repliedToUser != null
								? (
								<>
									<Icon name='corner-down-left' size={14} color='grey'
										style={{marginHorizontal: 5}}
									/>
									<Text style={{fontSize: 14, color: 'grey'}}>
										{(repliedToUser.id == postingUser.id
											? 'self'
											: repliedToUser.displayName)
											.concat(' • ')
										}
									</Text>
								</>
								)
								: null
							}
							{ postDateMoment.isBefore(postEditedMoment)
								? (
								<>
									<Text style={{color: 'grey'}}>
										{postDateMoment.fromNow().toString()}
									</Text>
									<Text style={{color: 'grey'}}>{' • '}</Text>
									<Text style={{color: 'grey'}}>{'Edited'}</Text>
								</>
								)
								: (<Text style={{color: 'grey'}}>{postDateMoment.fromNow()}</Text>)
							}
						</View>
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
						backgroundColor={isReplying ? '#90DADF' : 'transparent'}
						text='Reply'
						iconName='corner-down-left'
						textColor={isReplying ? '#2A878D' : 'black'}
						underlayColor='#65cad1'
						onPress={() => setIsReplying(!isReplying)}
					/>
					<FeedButtonWithText
						backgroundColor={isFaved ? '#efc88bff' : 'transparent'}
						text='Favorite'
						iconName='star'
						textColor={isFaved ? '#48300A' : 'black'}
						underlayColor='#E4A33A'
						onPress={() => {
							storage.get('userFavesPost')
								.then(faves => {
									let newFaveStatus, oldFaveIndex;
									if (faves != null) {
										const myFaves = [...faves].filter((favorite, index) => {
											const shouldRemove = favorite.userId == contextUser.id && favorite.postId == item.id;
											if (shouldRemove && oldFaveIndex === undefined)
												oldFaveIndex = index;
											return shouldRemove;
										})
										if (myFaves.length > 1) throw new Error('Too many favorites for this post!');
										else if (myFaves.length == 1)
											newFaveStatus = false;
									}
									if (newFaveStatus === undefined)
										newFaveStatus = true;
									
									switch (newFaveStatus) {
										case false: {
											if (oldFaveIndex === undefined) throw new Error('The old favorite was not found!');
											if (faves.splice(oldFaveIndex, 1).length != 1)
												throw new Error('Favorite removal failed!');
											break;
										}
										case true: {
											faves.push({
												userId: contextUser.id,
												postId: item.id,
												dateCreated: Date.now()
											})
											break;
										}
									}
									return storage.save('userFavesPost', faves)
													.then(() => setIsFaved(newFaveStatus));
								})
								.catch(error => console.error(error));
						}}
					/>
				</View>
				<Collapsible collapsed={isReplying == false}>
					<PostingTextBox
						buttonText={(<Icon name='send' size={20} color={'black'} />)}
						submitCallback={postBody => {
							const today = moment();
							navigation.setParams({newPost: JSON.stringify({
									id: NumberGenerator.makeIntFromRange(DEFAULT_POST_ID_LIMIT+1, DEFAULT_POST_ID_LIMIT*2+1),
									body: postBody,
									dateCreated: today,
									dateModified: moment(today),
									userId: contextUser.id,
									parentPost: item.id
								})
							});
							setIsReplying(false);
						}}
					/>
				</Collapsible>
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
