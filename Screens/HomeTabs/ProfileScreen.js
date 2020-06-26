import React, { useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {default as Fake} from '../../Data/DataGenerator.js';
import { FeedItem } from './FeedScreen.js';

export default function ProfileScreen({route, navigation}) {
	const [isFollowed, setIsFollowed] = useState(false);	// TODO Temporary value; data from posts to follow
	
	//console.log('viewing profile');
	// const { user } = route.params;
	const user = Fake.user();	// TODO Temporary; will use related data soon
	
	const [posts, setPosts] = useState([]);
	if (posts.length <= 0)
		setPosts(Fake.posts(30));
	
	// TODO Objects must NOT be directly passed to navigation params, or it will interfere with state!
	return (
		<FlatList
			data={posts}
			renderItem={({item}) => <FeedItem item={item} user={user} />}
			keyExtractor={(item) => item.id.toString()}
			ListHeaderComponent={
				<View style={{
						paddingHorizontal: 20,
						paddingVertical: 10,
					}}>
					<View style={{
						fles: 1,
						flexDirection: 'column',
						alignItems: 'center'
					}}>
						<View style={{
							backgroundColor: 'lightgrey',
							width: 135,
							length: 135,
							borderRadius: 75
							}}
							>
							<Text style={{width: 135, height: 135}}></Text>
						</View>
						<View style={{flex: 1, alignItems: 'center'}}>
							<Text style={{
								fontSize: 24
							}}>{user.displayName}</Text>
							<Text style={{
								fontSize: 16,
								color: '#2A878D'
							}}>@{user.name}</Text>
						</View>
					</View>
					<View style={{
						flex: 1,
						flexDirection: 'row',
						flexWrap: 'nowrap',
						justifyContent: 'space-evenly',
						marginTop: 10
						}}>
						<ProfileButtonWithText
							text='Message'
							iconName='message-square'
							textColor='black'
							underlayColor='#A68BBB'
							onPress={() => alert('Message pressed!')}
						/>
						<ProfileButtonWithText
							backgroundColor={isFollowed ? '#90DADF' : 'transparent'}
							text={isFollowed ? 'Following' : 'Follow'}
							iconName='plus-circle'
							textColor={isFollowed ? '#1C5A5E' : 'black'}
							underlayColor='#65cad1'
							onPress={() => {
								setIsFollowed(!isFollowed);
							}}
						/>
					</View>
				</View>
			}
			ListFooterComponent={ () =>
				<View style={{minHeight: 80, flex: 1, justifyContent: 'center', paddingHorizontal: 20}}>
					<Text style={{color: 'grey', fontStyle: 'italic'}}>End of profile reached</Text>
				</View>
			}
		/>
	);
}

export function ProfileButtonWithText({ backgroundColor='transparent', underlayColor, onPress, iconName, textColor, text }) {
	return (
		<TouchableHighlight
			underlayColor={underlayColor}
			onPress={onPress}
			style={{
				backgroundColor: backgroundColor,
				borderRadius: 10,
				borderWidth: StyleSheet.hairlineWidth,
				borderColor: 'lightgrey'
			}}
			>
			<View style={{
				flex: 1,
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				paddingHorizontal: 20,
				paddingVertical: 10
				}}>
				<Icon name={iconName} size={32} color={textColor} />
				<Text style={{color: textColor}}>{text}</Text>
			</View>
		</TouchableHighlight>
	);
}


const styles = StyleSheet.create({
	
});
