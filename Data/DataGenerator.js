import Fakerator from 'fakerator';
const fake = new Fakerator();

class Singleton {
	constructor() {
		throw new Error('This class is static only, or a singleton.');
	}
}

const DEFAULT_USER_ID_LIMIT = 47;
const DEFAULT_POST_ID_LIMIT = 300;
const DEFAULT_PAST_DAYS_LIMIT = 7;

export default class DataGenerator extends Singleton {
	static user() {
		const dateModified = fake.date.recent(DEFAULT_PAST_DAYS_LIMIT);
		const dateCreated = fake.date.between(Date.now().setDate(Date.now().getDate() - DEFAULT_PAST_DAYS_LIMIT), dateModified);
		const newFullName = fake.names.name();
		const newUserName = newFullName.replace('.','')
												.replace('-','')
												.replace(' ','')
												.toLowerCase();
		const newUser = {
					id: NumberGenerator.makeIntFromRange(0, DEFAULT_USER_ID_LIMIT),
				name: newUserName,
 displayName: newFullName,
 dateCreated: dateCreated,
dateModified: dateModified,
		};
		return newUser;
	}
	
	static users(count) {
		if (count < 0) throw new Error('There must be a whole, positive number of users!');
		let users = [];
		let usedIds = [];
		for (iterator = 0; iterator < count; iterator++;) {
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
		}
		return users;
	}
	
	static post() {
		const dateModified = fake.date.recent(DEFAULT_PAST_DAYS_LIMIT);
		const dateCreated = fake.date.between(Date.now().setDate(Date.now().getDate() - DEFAULT_PAST_DAYS_LIMIT), dateModified);
		const newPost = {
			 		id: NumberGenerator.makeIntFromRange(0, DEFAULT_POST_ID_LIMIT),
				body: fake.lorem.paragraph(),
 dateCreated: dateCreated,
dateModified: dateModified,
			userId: NumberGenerator.makeIntFromRange(0, DEFAULT_USER_ID_LIMIT),
//	parentPost: NumberGenerator.makeIntFromRange(0, DEFAULT_POST_ID_LIMIT).
		};
		return newPost;
	}
	
	static posts(count) {
		if (count < 0) throw new Error('There must be a whole, positive number of posts!');
		let posts = [];
		let usedIds = [];
		for (iterator = 0; iterator < count; iterator++;) {
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
		}
		return posts;
	}
}

export class NumberGenerator extends Singleton {
	static makeIntFromRange(lowerLimit, higherLimit) {
		return (Math.floor(Math.random() * (higherLimit - lowerLimit)) + lowerLimit);
	}
	static randomBooleanFromPercent(percent = 50) {
		return percent >= Math.round(Math.random() * 100);
	}
}
