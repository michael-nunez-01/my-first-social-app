import React, { useState } from 'react';
import { StyleSheet, ScrollView, FlatList, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {default as Fake, FakeView} from '../../Data/DataGenerator.js';

export default function MessagesScreen({navigation}) {
	//console.log('viewing messages');
	const [convos, setConvos] = useState([]);
	if (convos.length <= 0)
		setConvos(Fake.conversations(30));
	//console.log(Object.keys(convos[0]));
	
	return (
		<FlatList
			data={convos}
			renderItem={({item}) => (<ConvoItem item={item} navigation={navigation} />)}
			keyExtractor={(item, index) => item.length.toString().concat('_', index)}
			ItemSeparatorComponent={ () =>
				<View style={{
					height: 1,
					width: 'auto',
					borderBottomColor: 'lightgrey',
					borderBottomWidth: 1
				}}></View>
			}
		/>
	);
}

function ConvoItem({item, navigation}) {
	const user = Fake.user(); // Temporary; will use related data soon
	let latestMessage;
	for (message of item)
		if (latestMessage === undefined)
			latestMessage = message;
		else if ( moment(message.dateCreated)
							.isAfter(moment(latestMessage.dateCreated)) )
			latestMessage = message;
	if (latestMessage === undefined) throw new Error('This conversation has no messages!!!');
	return (
		<TouchableOpacity style={{
				paddingHorizontal: 20,
				paddingVertical: 10,
				flex: 1,
				flexDirection: 'row',
				alignItems: 'center'
			}}
			onPress={()=>alert(user.displayName.concat(':\n\n', latestMessage.body))}>
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
					<Text>{user.displayName}</Text>
					<Text style={{
						color: 'grey',
						fontSize: 12
					}}>
						{' • '+moment(latestMessage.dateCreated.valueOf()).fromNow()}
					</Text>
				</View>
				<View>
					<Text>
						{cutArticle(latestMessage.body, 40)}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}

function cutArticle(body, targetLength, ending = '...') {
	const simplifiedBody = body.replace('\n', ' ');
	if (targetLength > simplifiedBody.length) return simplifiedBody;
	return simplifiedBody.substring(0, targetLength - ending.length).concat(ending);
}

const styles = StyleSheet.create({
	
});
