import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableHighlight, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import SearchableDropdown from 'react-native-searchable-dropdown';
import storage from 'react-native-simple-store';
import moment from 'moment';
import {NumberGenerator, DEFAULT_MSG_ID_LIMIT} from '../../Data/DataGenerator.js';

export default function WritingView({route, navigation}) {
	const { viewingUser } = route.params;
	let sendingUser = null;
	try {sendingUser = JSON.parse(viewingUser);}
	catch (error) {
		console.error(error);
		return (<></>);
	}
	
	const [text, setText] = useState('');
	const [followingUsers, setFollowingUsers] = useState([]);
	const [receivingUser, setReceivingUser] = useState(route.params?.receivingUser
		? JSON.parse(route.params.receivingUser)
		: null
	);
	const maySubmit = receivingUser != null && receivingUser.id >= 0
		&& text.length > 0;
	
	useEffect(() => {
		const fetchPromise = (async () => {
			let followsUser = await storage.get('userFollowsUser');
			const userIds = [];
			followsUser.filter(followRecord => followRecord.userId == sendingUser.id)
				.forEach(filteredRecord => userIds.push(filteredRecord.targetId));
			
			let users = await storage.get('users');
			let selectedUsers = [];
			for (user of users) {
				if (userIds.includes(user.id)) {
					user.userName = user.name;
					user.name = user.displayName.concat(' (@',user.userName,')');
					selectedUsers.push(user);
				}
			}
			setFollowingUsers(selectedUsers);
		});
		fetchPromise().catch(error => console.error(error));
	}, []);
	
	return (
		<View style={{flex: 1, justifyContent: 'space-between'}}>
			<SearchableDropdown
				onTextChange={text => {
					if (receivingUser !== null)
						if (text != receivingUser.displayName)
							setReceivingUser(null);
				}}
				textInputProps={{
					editable: receivingUser != null
						? false
						: true,
					defaultValue: receivingUser != null
						? receivingUser.displayName.concat(' (@',receivingUser.name,')')
						: ''
				}}
				//On text change listner on the searchable input
				// TODO You could check if there is an ongoing conversation first,
				// and if so take the person to it.
				onItemSelect={user => setReceivingUser(user)}
				containerStyle={{
					borderBottomWidth: StyleSheet.hairlineWidth,
					borderColor: 'lightgrey'
				}}
				//onItemSelect called after the selection from the dropdown
				textInputStyle={{
					//inserted text style
					paddingHorizontal: 20,
					paddingVertical: 10
				}}
				itemStyle={{
					//single dropdown item style
					paddingHorizontal: 20,
					paddingVertical: 10,
					marginTop: 5,
					marginLeft: 20,
					borderLeftWidth: 2,
					borderColor: '#7b6d8d',
				}}
				itemTextStyle={{
					//single dropdown item's text style
					color: '#222',
				}}
				itemsContainerStyle={{
					//items container style you can pass maxHeight
					//to restrict the items dropdown hieght
					maxHeight: '60%',
				}}
				items={followingUsers}
				//mapping of item array
				defaultIndex={2}
				//default selected item index
				placeholder="Who will you message?"
				//place holder for the search input
				resetValue={false}
				//reset textInput Value with true and false state
				underlineColorAndroid="transparent"
				//To remove the underline from the android input
			/>
			<ScrollView style={{flexGrow: 1, paddingTop: 10}}>
				<TextInput placeholder="What is your message?"
					onChangeText={input => setText(input.toString())}
					multiline={true}
					textAlignVertical='top'
					style={{ paddingHorizontal: 20 }}
				/>
			</ScrollView>
			<View style={{
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				paddingHorizontal: 20,
				paddingVertical: 10
				}}>
				<View>
					<Text style={{
						fontStyle: 'italic',
						color: 'grey'
						}}>
						Write as much as you want!
					</Text>
				</View>
				<View>
					<TouchableHighlight
						disabled={!maySubmit}
						onPress={() => {
							// TODO Send the message!
							let momentModified = moment();
							let momentCreated = moment(momentModified);
							const newMessage = {
								id: NumberGenerator.makeIntFromRange(DEFAULT_MSG_ID_LIMIT+1, DEFAULT_MSG_ID_LIMIT*2),
							body: text,
			 dateCreated: momentCreated,
			dateModified: momentModified,
						userId: sendingUser.id,
				targetUser: receivingUser.id
							};
							storage.get('messages')
								.then(messages => {
									messages.push(newMessage);
									return storage.push('messages', newMessage);
								})
								.then(() => {
									navigation.navigate('ConverseView', {
										viewingUser: JSON.stringify(sendingUser),
										subjectUser: JSON.stringify(receivingUser),
										convo: JSON.stringify([newMessage])
									});
								})
								.catch(error => console.error(error));
						}}
						underlayColor='#7b6d8d'
						style={{
							backgroundColor: 'transparent',
							borderRadius: 10,
							borderWidth: StyleSheet.hairlineWidth,
							borderColor: 'darkgrey',
							padding: 10
						}}>
						<Text style={{
							fontSize: 16,
							color: maySubmit ? 'black' : 'lightgrey'
							}}>
							Send now
						</Text>
					</TouchableHighlight>
				</View>
			</View>
		</View>
	);
}
