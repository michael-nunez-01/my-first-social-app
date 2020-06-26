import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, FlatList, SectionList, View, Text, TouchableHighlight, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {default as Fake, NumberGenerator} from '../../Data/DataGenerator.js';
import { FeedItem } from '../HomeTabs/FeedScreen.js';

export default function PostView({route, navigation}) {
	const {post, postingUser} = route.params;
	
	const [pastPosts, setPastPosts] = useState([]);
	const [futurePosts, setFuturePosts] = useState([]);
	const allData = [
		{
			title: 'Start of thread',
			data: pastPosts
		},
		{
			title: 'Viewing post',
			data: [post]
		},
		{
			title: 'Replies',
			data: futurePosts
		}
	];
	
	useEffect(() => {
		// TODO Use real data!
		Promise.resolve(Fake.posts(7))
			.then(posts=>setFuturePosts(posts));
		if (NumberGenerator.randomBooleanFromPercent(20))
			Promise.resolve(Fake.posts(NumberGenerator.makeIntFromRange(1,4)))
				.then(posts=>setPastPosts(posts));
	}, [post]);
	
	return (
		<SectionList
			sections={allData}
			renderItem={({item, section}) => {
				switch (section.title) {
					case 'Viewing post': {
						return (
							<View style={{
									borderWidth: 1,
									borderColor: 'lightgrey',
									borderRadius: 10,
									backgroundColor: 'white',
									margin: 10
								}}>
								<FeedItem item={item} user={postingUser} onPress={null} />
							</View>
						);
					}
					case 'Replies': {
						return (<FeedItem item={item} onPress={null} />);
					}
					case 'Start of thread': {
						return (
							<View style={{
									backgroundColor: '#00000022',
								}}>
								<FeedItem item={item} onPress={null} />
							</View>
						);
					}
				}
			}}
		/>
	);
}
