import React, { useState } from 'react';
import { StyleSheet, ScrollView, FlatList, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {default as Fake, FakeView} from '../../Data/DataGenerator.js';
import { FeedItem } from './FeedScreen.js';

export default function ProfileScreen({route, navigation}) {
	//console.log('viewing profile');
	// const { user } = route.params;
	const user = Fake.user();	// Temporary; will use related data soon
	
	const [posts, setPosts] = useState([]);
	if (posts.length <= 0)
		setPosts(Fake.posts(30));
	
	return (
		<FlatList
			data={posts}
			renderItem={({item}) => <FeedItem item={item} navigation={navigation} user={user} />}
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
								color: 'grey'
							}}>@{user.name}</Text>
						</View>
					</View>
					<View>
						{/*TODO Put buttons here*/}
					</View>
				</View>
			}
		/>
	);
}

const styles = StyleSheet.create({
	
});
