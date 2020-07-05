import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, FlatList, View, Text, TextInput, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import storage from 'react-native-simple-store';
import moment from 'moment';
import {default as Fake} from '../../Data/DataGenerator.js';
import {sortDataDescending} from '../../Data/DataInit.js';

export default function ConverseView({route, navigation}) {
  const { viewingUser, subjectUser, convo } = route.params;
  const [text, setText] = useState('');
  navigation.setOptions({title: subjectUser.displayName});
  const messageList = useRef(null);
  
  const maySubmit = text.length > 0;
  const convoCopy = (convo.map(a => a)).reverse();
  return (
    <View style={{flex: 1, justifyContent: 'space-between'}}>
      <FlatList
        ref={messageList}
        onContentSizeChange={() => {
          messageList.current.scrollToEnd({animated: false});
        }}
        data={convoCopy}
        renderItem={({item}) => {
          const isOwnedByRecipient = item.userId == subjectUser.id;
          const dateCreatedMoment = moment(item.dateCreated);
          const dateModifiedMoment = moment(item.dateModified);
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
                  {dateCreatedMoment.isBefore(dateModifiedMoment)
                  ? dateCreatedMoment.fromNow(true).toString().concat(' • ','Edited')
                  : dateCreatedMoment.fromNow(true)}
                </Text>
              </View>
              <View style={{height: 'auto', width: '20%'}}>
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => {
          return item.id.toString().concat(index, '_', item.userId, item.targetUser);
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
          onPress={() => {
            // TODO Add to the conversation! And return what happened here
            // back to the parent screen.
            const today = moment();
            const newMessage = {
//          id: text,
        body: text,
 dateCreated: today,
dateModified: moment(today),
      userId: viewingUser.id,
  targetUser: subjectUser.id
            };
            /*
            storage.get('messages')
              .then(conversations => Promise.resolve(
                conversations.sort((oneConvo, twoConvo) => sortDataDescending(oneConvo[0], twoConvo[0]))
                  .filter((messages, index) => {
                    const isBetweenThesePersons = (messages[0].userId == viewingUser.id
                            && messages[0].targetUser == subjectUser.id)
                            || (messages[0].userId == subjectUser.id
                            && messages[0].targetUser == viewingUser.id);
                    if (isBetweenThesePersons) console.log('Persons Match! @ '+index);
                    const isConvoMatching = convo[0].body === messages[0].body;
                    if (isBetweenThesePersons)
                    console.log(convo[0].body.substr(0, 15) + ' | '+messages[0].body.substr(0, 15));
                    if (isConvoMatching) console.log('^ Matches!');
                    return isBetweenThesePersons && isConvoMatching;
                  })
              ))
              .then(filteredConvos => {
                console.log(Object.keys(filteredConvos));
                if (filteredConvos.length > 1)
                  return Promise.reject(new Error('There seems to be a problem finding the original conversation here.'));
              });
            */
          }}
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
