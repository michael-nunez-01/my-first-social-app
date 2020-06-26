import React, { useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {default as Fake} from '../../Data/DataGenerator.js';

export default function FeedScreen({navigation}) {
	const [posts, setPosts] = useState([]);
	if (posts.length <= 0)
		setPosts(Fake.posts(30));
	
	// TODO Objects must NOT be directly passed to navigation params, or it will interfere with state!
	return (
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
							navigation.navigate('PostingView');
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
	);
}

export function FeedItem({item, user, onPress }) {
	const [isFaved, setIsFaved] = useState(false);	// TODO Temporary value; data from posts to follow
	const navigation = useNavigation();
	if (onPress === undefined)
		onPress=()=>navigation.navigate('PostView', {post: item, postingUser: user});
	
	if (user == undefined)
		user = Fake.user();	// TODO Temporary; will use related data soon
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
						}}>{user.displayName}</Text>
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