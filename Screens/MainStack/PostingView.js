import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TextInput, TouchableHighlight, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import { NumberGenerator, DEFAULT_POST_ID_LIMIT } from '../../Data/DataGenerator.js';

export default function PostingView({route, navigation}) {
  const CHAR_LIMIT = 200;
  
  const { postingUserId } = route.params;
  
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
            onPress={() => Promise.resolve(text).then(postBody => {
              const today = moment();
              navigation.navigate('HomeTabs', {
                screen: 'Feed',
                params: {newPost: JSON.stringify({
                  id: NumberGenerator.makeIntFromRange(DEFAULT_POST_ID_LIMIT+1, DEFAULT_POST_ID_LIMIT*2+1),
                  body: postBody,
                  dateCreated: today,
                  dateModified: moment(today),
                  userId: postingUserId
                })}
              });
            })}
            underlayColor='#65cad1'
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

export function PostingTextBox({submitCallback, buttonText = 'Post now'}) {
  const CHAR_LIMIT = 200;
  
  const [text, setText] = useState('');
  
  const charDiff = CHAR_LIMIT - text.length;
  const messageLengthValid = charDiff >= 0;
  const maySubmit = messageLengthValid && text.length > 0;
  return (
    <>
      <TextInput placeholder="What's on your mind?"
        onChangeText={input => setText(input.toString())}
        multiline={true}
        textAlignVertical='top'
        style={{paddingHorizontal: 0}}
      />
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 0,
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
            onPress={() => Promise.resolve(text).then(postBody => {
              if (maySubmit) submitCallback(postBody);
              else {
                const errorMsgs = [];
                if (!messageLengthValid)
                  errorMsgs.push('You exceeded the maximum number of characters in your post. Please consider reducing them.');
                if (text.length <= 0)
                  errorMsgs.push('You haven\'t entered a message to post.');
                  
                if (errorMsgs.length == 1)
                  alert(errorMsgs[0]);
                else if (errorMsgs.length > 1)
                  alert('You did not meet the following criteria for posting a message:\n'
                    + erroMsgs.reduce((acc, cur, index) => acc.concat('- ', cur, index != 0 ? '\n' : ''))
                  );
              }
            })}
            underlayColor='#65cad1'
            style={{
              backgroundColor: 'transparent',
              borderRadius: 100,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: 'darkgrey',
              padding: 20
            }}>
            <Text style={{
              fontSize: 16,
              color: maySubmit ? 'black' : 'lightgrey'
              }}>
              {buttonText}
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    </>
  );
}
