import React, { useState, useEffect, useCallback } from 'react';
// import { StyleSheet, ScrollView, FlatList, View, Text, TextInput, TouchableHighlight } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Feather';
import storage from 'react-native-simple-store';
import moment from 'moment';
import {NumberGenerator, DEFAULT_MSG_ID_LIMIT} from '../../Data/DataGenerator.js';
import {sortDataDescending} from '../../Data/DataInit.js';

export default function ConverseView({route, navigation}) {
  const viewingUser = JSON.parse(route.params.viewingUser);
  const subjectUser = JSON.parse(route.params.subjectUser);
  const convo = JSON.parse(route.params.convo);
  const [text, setText] = useState('');
  navigation.setOptions({title: subjectUser.displayName});
  
  const displayViewingUser = {...viewingUser};
  const displaySubjectUser = {...subjectUser};
  displayViewingUser._id = 1;
  displaySubjectUser._id = 2;
  displayViewingUser.name = displayViewingUser.displayName;
  displaySubjectUser.name = displaySubjectUser.displayName;
  displayViewingUser.avatar = null;
  displaySubjectUser.avatar = null;
  
  const maySubmit = text.length > 0;
  const convoCopy = (convo.map((message, index) => {
    message._id = index;
    message.text = message.body;
    message.createdAt = message.dateCreated;
    message.modifiedAt = message.dateModified;
    message.user = message.userId == displayViewingUser.id
      ? displayViewingUser
      : displaySubjectUser;
    return message;
  }));
  
  const [messages, setMessages] = useState(convoCopy);

  const onSend = useCallback((messages = []) => {
    if (messages.length == 1) {
      const recentlySentMessage = messages[0].text;
      storage.get('messages')
        .then(messages => {
          let momentModified = moment();
          let momentCreated = moment(momentModified);
          const newMessage = {
            id: NumberGenerator.makeIntFromRange(DEFAULT_MSG_ID_LIMIT+1, DEFAULT_MSG_ID_LIMIT*2),
          body: recentlySentMessage,
   dateCreated: momentCreated,
  dateModified: momentModified,
        userId: viewingUser.id,
    targetUser: subjectUser.id
          };
          messages.push(newMessage);
          return storage.push('messages', newMessage);
        })
        .then(() => setMessages(previousMessages => GiftedChat.append(previousMessages, messages)))
        .catch(error => console.error(error));
    }
  }, [])

  // TODO Personalize the chat towards your app theme
  return (
    <GiftedChat
      renderAvatar={null}
      alwaysShowSend={true}
      placeholder='Write a message?'
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: 1,
      }}
    />
  )
}
