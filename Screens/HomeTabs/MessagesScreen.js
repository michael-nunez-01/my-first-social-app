import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableHighlight, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import storage from 'react-native-simple-store';
import moment from 'moment';
import {default as Fake} from '../../Data/DataGenerator.js';
import DataInit, {sortDataDescending} from '../../Data/DataInit.js';

export default function MessagesScreen({navigation}) {
	const [convos, setConvos] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [currentUser, setCurrentUser] = useState(null);
	
	// TODO See block comment below; do the recommended part.
	const fetchPromise = (async () => {
		const users = await storage.get('users');
		const myUser = await storage.get('currentUser');
		const messages = (await storage.get('messages')).filter(message => {
			return myUser.id == message.userId || myUser.id == message.targetUser;
		});
		
		/*
		1. Get all messages
		2. Get all different userId combos
		3. Create separate arrays resembling conversations
		4. setConvos to the compilation of these arrays
		5. [RECOMMENDED] Optimize this process, the pause is awkwardly 2+ secs long.
		*/
		let convos = [];
		let userIds = new Set();
		for (message of messages) {
			const nextUserId = message.userId == myUser.id
				? message.targetUser
				: message.userId;
			userIds.add(nextUserId)
			const userObject = users.find(user => user.id == nextUserId);
			if (!message?.convoTitle) message.convoTitle = userObject.displayName;
		}
		userIds.forEach(targetUserId => convos.push(
			messages.filter(message => {
				return message.targetUser == targetUserId || message.userId == targetUserId;
			}).sort(sortDataDescending)
		));
		
		setConvos(convos.sort((oneConvo, twoConvo) =>
			sortDataDescending(oneConvo[0], twoConvo[0])
		));
		setCurrentUser(myUser);
		
		setIsLoaded(true);
	});
	
	useEffect(() => {
		DataInit().catch(error => console.warn(error)).finally(() => {
			fetchPromise().catch(error => console.error(error));
		});
	}, []);
	
	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			fetchPromise().catch(error => console.error(error));
    });
    return unsubscribe;
	}, [navigation]);
	
	return isLoaded
		? (
			<>
				<FlatList style={{alignSelf: 'stretch'}}
					data={convos}
					renderItem={({item}) => (<ConvoItem tweakedItem={item} viewingUser={currentUser} />)}
					keyExtractor={(item, index) => item.length.toString().concat('_', index)}
					ItemSeparatorComponent={ () =>
						<View style={{
							height: 1,
							width: 'auto',
							borderBottomColor: 'lightgrey',
							borderBottomWidth: StyleSheet.hairlineWidth
						}}></View>
					}
					ListFooterComponent={ () =>
						<View style={{minHeight: 80, flex: 1, justifyContent: 'center', paddingHorizontal: 20}}>
							<Text style={{color: 'grey', fontStyle: 'italic'}}>End of list reached</Text>
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
							backgroundColor='#7F5B9A'
							color='white'
							onPress={() => navigation.navigate('WritingView', {
								viewingUser: JSON.stringify(currentUser)
							})}
							>
							New message
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

function ConvoItem({tweakedItem, viewingUser}) {
	const navigation = useNavigation();
	const latestMessage = tweakedItem[0];
	const subjectUser = {
		displayName: latestMessage.convoTitle,
		id: latestMessage.targetUser != viewingUser.id
				? latestMessage.targetUser
				: latestMessage.userId
	}
	const isLatestMessageFromYou = latestMessage.userId == viewingUser.id;
	// TODO Do not pass in any object to a navigation function! Not even the conversation!
	return (
		<TouchableHighlight underlayColor='#A68BBB'
			onPress={()=>{
				//alert(user.displayName.concat(':\n\n', latestMessage.body));
				navigation.navigate('ConverseView', {
					viewingUser: JSON.stringify(viewingUser),
					subjectUser: JSON.stringify(subjectUser),
					convo: JSON.stringify(tweakedItem)
				});
			}}>
			<View style={{
				paddingHorizontal: 20,
				paddingVertical: 10,
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center'
				}}>
				<View style={{
					alignSelf: 'flex-start',
					backgroundColor: 'lightgrey',
					width: 50,
					length: 50,
					borderRadius: 50
					}}
					>
					<Text style={{width: 50, height: 50}}></Text>
				</View>
				<View style={{
					marginLeft: 10,
					flex: 1,
					flexDirection: 'column'
					}}>
					<View style={{
						display: 'flex',
						flexDirection: 'row',
						flexWrap: 'nowrap',
						alignItems: 'center'
						}}>
						<Text>
							{subjectUser != null && subjectUser.displayName != ''
								? subjectUser.displayName
								: <Icon name='more-horizontal' size={14} color='lightgrey' />
							}
						</Text>
						<Text style={{
							color: 'grey',
							fontSize: 12
						}}>
							{' • '+moment(latestMessage.dateCreated.valueOf()).fromNow()}
						</Text>
					</View>
					<View>
						<Text style={isLatestMessageFromYou
							? {fontStyle: 'italic', color: 'grey'}
							: {}
							}>
							{cutArticle((isLatestMessageFromYou ? 'You: ' : '')
													+ latestMessage.body, 40)}
						</Text>
					</View>
				</View>
			</View>
		</TouchableHighlight>
	);
}

function cutArticle(body, targetLength, ending = '...') {
	const simplifiedBody = body.replace('\n', ' ');
	if (targetLength > simplifiedBody.length) return simplifiedBody;
	return simplifiedBody.substring(0, targetLength - ending.length).concat(ending);
}

const styles = StyleSheet.create({
	
});
