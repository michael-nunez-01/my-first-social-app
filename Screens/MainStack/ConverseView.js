import React, { useState } from 'react';
import { StyleSheet, ScrollView, FlatList, View, Text, TextInput, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {default as Fake} from '../../Data/DataGenerator.js';

export default function ConverseView({route, navigation}) {
	const { viewingUser, subjectUser, convo } = route.params;
	const [text, setText] = useState('');
	navigation.setOptions({title: subjectUser.displayName});
	const maySubmit = text.length > 0;
	// TODO Sort the conversation data beforehand!
	return (
		<View style={{flex: 1, justifyContent: 'space-between'}}>
			<FlatList
				data={convo}
				renderItem={({item}) => {
					// TODO Pass in a real viewingUser, to add more conditional checks.
					const isOwnedByRecipient = item.targetUser == subjectUser.id;
					return (
						<View style={{
							display: 'flex',
							flexDirection: isOwnedByRecipient ? 'row' : 'row-reverse',
							flexWrap: 'nowrap',
							justifyContent: 'space-between'
							}}>
							<View style={{
								backgroundColor: isOwnedByRecipient ? '#7b6d8d' : 'lightgrey',
								borderTopLeftRadius: isOwnedByRecipient ? 5 : 20,
								borderTopRightRadius: 20,
								borderBottomLeftRadius: 20,
								borderBottomRightRadius: isOwnedByRecipient ? 20 : 5,
								maxWidth: '80%',
								paddingHorizontal: 20,
								paddingVertical: 10,
								marginHorizontal: 10,
								marginVertical: 5
								}}>
								<Text style={{color: isOwnedByRecipient ? 'white' : 'black'}}>{item.body}</Text>
								<Text style={{
									fontSize: 12,
									color: isOwnedByRecipient ? 'lightgrey' : 'grey',
									marginTop: 5
									}}>
									{item.dateCreated.isBefore(item.dateModified)
									? item.dateModified.fromNow(true).toString().concat(' • ','Edited')
									: item.dateCreated.fromNow(true)}
								</Text>
							</View>
							<View style={{height: 'auto', width: '20%'}}>
							</View>
						</View>
					);
				}}
				keyExtractor={(item, index) => {
					return item.id.toString().concat('_',item.userId, item.targetUser);
				}}
			/>
			<View style={{display: 'flex', flexDirection: 'row', alignItems: 'center',
				paddingHorizontal: 20,
				paddingVertical: 10
				}}>
				<ScrollView>
					<TextInput placeholder="Write a message?"
						onChangeText={input => setText(input.toString())}
						multiline={true}
						autoFocus={true}
						textAlignVertical='top'
					/>
				</ScrollView>
				<TouchableHighlight underlayColor='#A68BBB'
					disabled={!maySubmit}
					onPress={() => {}}
					style={{
						padding: 15,
						borderRadius: 100,
						borderWidth: StyleSheet.hairlineWidth,
						borderColor: 'lightgrey'
					}}>
					<Icon name='send' size={20} color={maySubmit ? 'black' : 'lightgrey'} />
				</TouchableHighlight>
			</View>
		</View>
	);
}
