import moment from 'moment';
import Fakerator from 'fakerator';
const fake = new Fakerator();

class Singleton {
	constructor() {
		throw new Error('This class is static only, or a singleton.');
	}
}

const DEFAULT_USER_ID_LIMIT = 47;
const DEFAULT_POST_ID_LIMIT = 300;
const DEFAULT_MSG_ID_LIMIT = 200; // Not a good name since conversations don't rely on this.
const DEFAULT_CONVO_ID_LIMIT = 100;
const DEFAULT_PAST_DAYS_LIMIT = 7;

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
	
	static post() {
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
			userId: NumberGenerator.makeIntFromRange(0, DEFAULT_USER_ID_LIMIT),
//	parentPost: NumberGenerator.makeIntFromRange(0, DEFAULT_POST_ID_LIMIT).
		};
		return newPost;
	}
	
	static posts(count) {
		if (count <= 0) throw new Error('There must be a whole, positive number of posts!');
		let posts = [];
		let usedIds = [];
		for (iterator = 0; iterator < count; iterator++) {
			let isUnique = true;
			const incomingPost = DataGenerator.post();
			for (usedId of usedIds)
				if (usedId == incomingPost.id) {
					isUnique = false;
					break;
				}
			if (isUnique) {
				posts.push(incomingPost);
				usedIds.push(incomingPost.id);
			}
			else iterator--;
		}
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
	
	static conversations(count) {
		if (count <= 0) throw new Error('There must be a whole, positive number of conversations!');
		let convos = [];
		for (convoIterator = 0; convoIterator < count; convoIterator++) {
			let originatingUserId = NumberGenerator.makeIntFromRange(0, DEFAULT_USER_ID_LIMIT);
			let targetUserId;
			do targetUserId = NumberGenerator.makeIntFromRange(0, DEFAULT_USER_ID_LIMIT)
			while (targetUserId === undefined || targetUserId == originatingUserId);
			const incomingConvo = DataGenerator.conversation(
				NumberGenerator.makeIntFromRange(10, DEFAULT_CONVO_ID_LIMIT),
				originatingUserId,
				targetUserId
			);
			convos.push(incomingConvo);
			//console.log(Object.keys(incomingConvo));
			iteratorCatcher = convoIterator;
			//console.log('fullIT '+convoIterator);
		}
		//console.log(convos.length);
		if (convos.length < count) throw new Error('Amount of data generated is insufficient!!!');
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
