import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { /*TODO put needed components here!*/ } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DataGenerator as Fake from '../../Data/DataGenerator.js';
import moment from 'moment';

export default function FeedScreen({navigation}) {
	const [posts, setPosts] = useState([]);
	if (posts.length <= 0)
		setPosts(Fake.posts(30));
	
	return (
		<SafeAreaView>
			<ScrollView>
				<FlatList
					data={posts}
					renderItem={({item}) => <FeedItem item={item} navigation={navigation} />}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}

function feedItem({item, navigation}) {
	const user = Fake.user();
	const postDateMoment = moment(item.dateCreated.valueOf());
	const postEditedMoment = moment(item.dateModified.valueOf());
	return (
		<View key={item.id}>
			<View>
				<Text>{user.displayName}</Text>
				<Text>
					{ postDateMoment.isBefore(postEditedMoment);
						? postEditedMoment.fromNow().toString().concat(' - ','Edited')
						: postDateMoment.fromNow()
					}
				</Text>
			</View>
			<View>
				<Text>{item.body}</Text>
			</View>
			<View>
				{/*TODO Put buttons here*/}
			</View>
		</View>
	);
}
