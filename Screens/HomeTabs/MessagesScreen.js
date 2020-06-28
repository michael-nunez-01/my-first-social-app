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
	
	useEffect(() => {
		DataInit().catch(error => console.warn(error)).finally(() => {
			const finalPromise = (async () => {
				let users = await storage.get('users');
				let myUser = await storage.get('currentUser');
				let conversations = (await storage.get('messages')).filter(convo => {
					return myUser.id == convo[0].userId || myUser.id == convo[0].targetUser;
				});
				
				for (messages of conversations) {
					messages.sort(sortDataDescending);
					for (message of messages) {
						for (user of users)
							if (!message?.convoTitle
									&& (user.id == message.userId || user.id == message.targetUser)
									&& user.id != myUser.id)
								message.convoTitle = user.displayName;
					}
				}
				conversations.sort((oneConvo, twoConvo) => 
					sortDataDescending(oneConvo[0], twoConvo[0]));
				setConvos(conversations != null ? conversations : []);
				setCurrentUser(myUser);
				
				setIsLoaded(true);
			});
			finalPromise();
		});
	}, []);
	
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
							onPress={() => navigation.navigate('WritingView', {sendingUserId: currentUserId})}
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
					viewingUser: viewingUser,
					subjectUser: subjectUser,
					convo: tweakedItem
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
