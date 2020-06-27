import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableHighlight, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {default as Fake} from '../../Data/DataGenerator.js';

export default function WritingView({route, navigation}) {
	// TODO Get a receiving user if defined!
	const { sendingUser } = route.params;
	let thatUser = sendingUser;
	if (sendingUser == null) {
		// TODO sendingUser must NOT be null; replace thatUser with such
		thatUser = Fake.user();
	}
	
	// TODO Test for a receivingUser
	const hasPrefilledRecipient = route.params?.receivingUser == true;
	
	const [text, setText] = useState('');
	const [receivingUserId, setReceivingUserId] = useState(hasPrefilledRecipient
		? route.params.receivingUser.id
		: -1
	);
	
	const expectedUser = receivingUserId != -1
		? route.params.receivingUser
		: {id: receivingUserId, name: ''};
	const maySubmit = receivingUserId >= 0 && text.length > 0;
	
	return (
		<View style={{flex: 1, justifyContent: 'space-between'}}>
			<ScrollView style={{flexGrow: 1, paddingTop: 10}}>
				<TextInput placeholder="Who will receive this message?"
					onChangeText={input => {
						// TODO Search for followed users?
					}}
					multiline={false}
					autoFocus={true}
					textAlignVertical='top'
					defaultValue={expectedUser.name == '' ? '' : '@'+expectedUser.name}
					style={{
						paddingHorizontal: 20,
						borderBottomWidth: StyleSheet.hairlineWidth,
						borderColor: 'lightgrey'
					}}
				/>
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
						onPress={() => {}}
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
