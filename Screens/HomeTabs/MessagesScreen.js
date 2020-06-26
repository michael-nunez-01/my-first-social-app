import React, { useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableHighlight } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {default as Fake} from '../../Data/DataGenerator.js';

export default function MessagesScreen({navigation}) {
	//console.log('viewing messages');
	const [convos, setConvos] = useState([]);
	if (convos.length <= 0)
		setConvos(Fake.conversations(30));
	//console.log(Object.keys(convos[0]));
	
	// TODO viewingUser, also known as sendingUser, must be the current user!
	return (
		<>
			<FlatList style={{alignSelf: 'stretch'}}
				data={convos}
				renderItem={({item}) => (<ConvoItem item={item} viewingUser={null} />)}
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
						onPress={() => navigation.navigate('WriteView', {sendingUser: null})}
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
	);
}

function ConvoItem({item, viewingUser}) {
	const navigation = useNavigation();
	let latestMessage;
	for (message of item)
		if (latestMessage === undefined)
			latestMessage = message;
		else if ( moment(message.dateCreated)
							.isAfter(moment(latestMessage.dateCreated)) )
			latestMessage = message;
	if (latestMessage === undefined) throw new Error('This conversation has no messages!!!');
	const user = Fake.user(latestMessage.targetUser); // TODO Temporary; will use related data soon
	// TODO Do not pass in any object to a navigation function! Not even the conversation!
	return (
		<TouchableHighlight underlayColor='#A68BBB'
			onPress={()=>{
				//alert(user.displayName.concat(':\n\n', latestMessage.body));
				navigation.navigate('ConverseView', {
					viewingUser: viewingUser, subjectUser: user,
					convo: item
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
