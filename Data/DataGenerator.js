import moment from 'moment';
import Fakerator from 'fakerator';
const fake = new Fakerator();

class Singleton {
  constructor() {
    throw new Error('This class is static only, or a singleton.');
  }
}

export const DEFAULT_USER_ID_LIMIT = 100;
export const DEFAULT_POST_ID_LIMIT = 3000;
export const DEFAULT_MSG_ID_LIMIT = 5000;
export const DEFAULT_MSG_LIMIT = 30;
export const STRESSFUL_MSG_LIMIT = 100;
export const DEFAULT_PAST_DAYS_LIMIT = 7;

export default class DataGenerator extends Singleton {
  
  static user(userId = null) {
    let momentModified = moment(fake.date.recent(DEFAULT_PAST_DAYS_LIMIT));
    let momentCreated = moment(momentModified);
    if (NumberGenerator.coinFlip())
      momentCreated.subtract(NumberGenerator.makeIntFromRange(1, moment(Date.now()).diff(momentModified, 'days')),
                             'days');
    const newUser = {
          id: userId != null
              ? userId
              : NumberGenerator.makeIntFromRange(1, DEFAULT_USER_ID_LIMIT),
        name: fake.internet.userName(),
 displayName: fake.names.name(),
 dateCreated: momentCreated,
dateModified: momentModified,
    };
    return newUser;
  }
  
  static users(count) {
    if (count <= 0) throw new Error('There must be a whole, positive number of users!');
    let users = [];
    let usedIds = [];
    for (iterator = 0; iterator < count; iterator++) {
      let isUnique = true;
      const incomingUser = DataGenerator.user();
      for (usedId of usedIds)
        if (usedId == incomingUser.id) {
          isUnique = false;
          break;
        }
      if (isUnique) {
        users.push(incomingUser);
        usedIds.push(incomingUser.id);
      }
      else iterator--;
    }
    return users;
  }
  
  static post(reserveUserId = null) {
    let momentModified = moment(fake.date.recent(DEFAULT_PAST_DAYS_LIMIT));
    let momentCreated = moment(momentModified);
    if (NumberGenerator.coinFlip())
      momentCreated.subtract(NumberGenerator.makeIntFromRange(1, moment(Date.now()).diff(momentModified, 'days')),
                             'days');
    const newPost = {
           id: NumberGenerator.makeIntFromRange(0, DEFAULT_POST_ID_LIMIT),
        body: fake.lorem.paragraph(),
 dateCreated: momentCreated,
dateModified: momentModified,
      userId: reserveUserId != null
              ? reserveUserId
              : NumberGenerator.makeIntFromRange(0, DEFAULT_USER_ID_LIMIT),
//  parentPost: NumberGenerator.makeIntFromRange(0, DEFAULT_POST_ID_LIMIT).
    };
    return newPost;
  }
  
  static posts(count, reserveUserId = null) {
    if (count <= 0) throw new Error('There must be a whole, positive number of posts!');
    let posts = [];
    let usedIds = [];
    for (iterator = 0; iterator < count; iterator++) {
      let isUnique = true;
      const incomingPost = DataGenerator.post(reserveUserId);
      for (usedId of usedIds)
        if (usedId == incomingPost.id) {
          isUnique = false;
          break;
        }
      if (isUnique) {
        if (NumberGenerator.randomBooleanFromPercent(25)) {
          const selectedPostId = usedIds[NumberGenerator.makeIntFromRange(0, usedIds.length)];
          const selectedPost = posts.find(post => post.id == selectedPostId);
          if (selectedPost !== undefined) {
            if (moment(selectedPost.dateCreated).isBefore(moment(incomingPost.dateCreated)))
              incomingPost.parentPost = selectedPost.id;
          }
        }
        posts.push(incomingPost);
        usedIds.push(incomingPost.id);
      }
      else iterator--;
    }
    return posts;
  }
  
  static postsPerUser(countPerUser, userIdCount) {
    if (countPerUser <= 0) throw new Error('There must be a whole, positive number of posts!');
    if (userIdCount <= 0) throw new Error('There must be a whole, positive number of users!');
    if (countPerUser * userIdCount > DEFAULT_POST_ID_LIMIT)
      throw new Error('You exceeded the post ID limit of ' + DEFAULT_POST_ID_LIMIT);
    let posts = [];
    let usedPostIds = [];
    let usedUserIds = [];
    
    const reinitialize = () => NumberGenerator.makeIntFromRange(0, DEFAULT_USER_ID_LIMIT);
    let countedPosts = 0;
    let reserveUserId;
    let postPerUserCounter = 0;
    for (iterator = 0; iterator < countPerUser * userIdCount; iterator++) {
      if (postPerUserCounter == 0) {
        let newUserId = reinitialize();
        let reservable = false;
        while (reservable == false) {
          let mustReject = false;
          if (usedUserIds.length <= 0) {
            mustReject = false;
            reservable = true;
          }
          else usedUserIds.forEach((usedUserId, index) => {
            if (usedUserId == newUserId)
              mustReject = true;
            if (usedUserId != newUserId && index + 1 === usedUserIds.length)
              reservable = true;
          });
          if (mustReject == true || reservable == false) {
            newUserId = reinitialize();
            reservable = false;
          }
        }
        reserveUserId = newUserId;
      }
      
      let isUnique = true;
      const incomingPost = DataGenerator.post(reserveUserId);
      for (postId of usedPostIds)
        if (postId == incomingPost.id) {
          isUnique = false;
        }
      if (isUnique) {
        if (NumberGenerator.randomBooleanFromPercent(25)) {
          const selectedPostId = usedPostIds[NumberGenerator.makeIntFromRange(0, usedPostIds.length)];
          const selectedPost = posts.find(post => post.id == selectedPostId);
          if (selectedPost !== undefined) {
            if (moment(selectedPost.dateCreated).isBefore(moment(incomingPost.dateCreated)))
              incomingPost.parentPost = selectedPost.id;
          }
        }
        posts.push(incomingPost);
        postPerUserCounter++; countedPosts++;
        usedPostIds.push(incomingPost.id);
        
        if (postPerUserCounter == 1)
          usedUserIds.push(reserveUserId);
        
        if (postPerUserCounter >= countPerUser)
          postPerUserCounter = 0;
      }
      else iterator--;
    }
    //console.log(usedUserIds);
    
    if (countPerUser * userIdCount != countedPosts)
      throw new Error('You got the wrong amount of posts!\nInstead of '
        + (countPerUser * userIdCount) + ' posts, you got ' + countedPosts
      );
    else if (userIdCount != usedUserIds.length)
      throw new Error('You got the wrong amount of users!\nInstead of '
        + userIdCount + ' users, you got ' + usedUserIds.length
      );
    return posts;
  }
  
  static message(fromId, toId) {
    let momentModified = moment(fake.date.recent(DEFAULT_PAST_DAYS_LIMIT));
    let momentCreated = moment(momentModified);
    if (NumberGenerator.coinFlip())
      momentCreated.subtract(NumberGenerator.makeIntFromRange(1, moment(Date.now()).diff(momentModified, 'days')),
                             'days');
    const newMessage = {
          id: NumberGenerator.makeIntFromRange(1, DEFAULT_MSG_ID_LIMIT),
        body: fake.lorem.sentence(),
 dateCreated: momentCreated,
dateModified: momentModified,
      userId: fromId,
  targetUser: toId
    };
    return newMessage;
  }
  
  static conversation(count, fromId, toId) {
    if (count <= 0) throw new Error('There must be a whole, positive number of messages!');
    let messages = [];
    let usedIds = [];
    for (messageIterator = 0; messageIterator < count; messageIterator++) {
      let isUnique = true;
      const incomingMsg = NumberGenerator.coinFlip()
                          ? DataGenerator.message(fromId, toId)
                          : DataGenerator.message(toId, fromId);
      for (usedId of usedIds)
        if (usedId == incomingMsg.id) {
          isUnique = false;
          break;
        }
      if (isUnique) {
        messages.push(incomingMsg);
        usedIds.push(incomingMsg.id);
      }
      else messageIterator--;
      //console.log('convoIT '+iterator);
    }
    if (messages.length < count) throw new Error('Amount of data generated is insufficient!!!');
    return messages;
  }
  
  // TODO At this case, only this function requires targetUserIdChoices.
  static conversations(count, originatingUserId = null, targetUserIdChoices = []) {
    if (count <= 0) throw new Error('There must be a whole, positive number of conversations!');
    let convos = [];
    for (convoIterator = 0; convoIterator < count; convoIterator++) {
      if (originatingUserId == null)
        originatingUserId = NumberGenerator.makeIntFromRange(0, DEFAULT_USER_ID_LIMIT);
      let targetUserId;
      do {
        targetUserId = Array.isArray(targetUserIdChoices) && targetUserIdChoices.length > 0
          ? targetUserIdChoices[NumberGenerator.makeIntFromRange(0, targetUserIdChoices.length)]
          : NumberGenerator.makeIntFromRange(0, DEFAULT_USER_ID_LIMIT)
      } while (targetUserId === undefined || targetUserId == originatingUserId);
      const incomingConvo = DataGenerator.conversation(
        NumberGenerator.makeIntFromRange(10, STRESSFUL_MSG_LIMIT + 1),
        originatingUserId,
        targetUserId
      );
      incomingConvo.forEach(convo => convos.push(convo));
      //console.log(Object.keys(incomingConvo));
      iteratorCatcher = convoIterator;
      //console.log('fullIT '+convoIterator);
    }
    //console.log(convos.length);
    if (convos.length < count)
      console.warn('Amount of data generated is unusually insufficient!');
    return convos;
  }
}

export class NumberGenerator extends Singleton {
  static makeIntFromRange(lowerLimit, higherLimit) {
    return (Math.floor(Math.random() * (higherLimit - lowerLimit)) + lowerLimit);
  }
  static randomBooleanFromPercent(percent) {
    return percent >= Math.round(Math.random() * 100);
  }
  static coinFlip() {return NumberGenerator.randomBooleanFromPercent(50);}
}
