import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableHighlight, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function PostingView({route, navigation}) {
	const CHAR_LIMIT = 200;
	
	const [text, setText] = useState('');
	
	const charDiff = CHAR_LIMIT - text.length;
	const messageLengthValid = charDiff >= 0;
	const maySubmit = messageLengthValid && text.length > 0;
	
	return (
		<View style={{flex: 1, justifyContent: 'space-between'}}>
			<ScrollView style={{flexGrow: 1, paddingTop: 10}}>
				<TextInput placeholder="What's on your mind?"
					onChangeText={input => setText(input.toString())}
					multiline={true}
					autoFocus={true}
					textAlignVertical='top'
					style={{paddingHorizontal: 20}}
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
							color: messageLengthValid ? 'grey' : '#ab2346'
						}}>
						{messageLengthValid
							? charDiff+' characters left'
							: (charDiff * -1)+' characters too many!'
						}
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
							Post now
						</Text>
					</TouchableHighlight>
				</View>
			</View>
		</View>
	);
}
