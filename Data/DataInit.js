import moment from 'moment';
import {default as Fake} from './DataGenerator.js';
import storage from 'react-native-simple-store';

export default async function DataInit() {
	let posts = await storage.get('feed');
	if (posts != null)
		return Promise.resolve({sysMsg: 'A feed exists; will not fetch any more data'});
	
	await storage.save('feed', Fake.posts(30));
	posts = await storage.get('feed');
	let userIds = posts.map(post => post.userId);
	let currentUserId = userIds.pop();
	await storage.save('users', posts.map(post => Fake.user(post.userId)));
	let users = await storage.get('users');
	
	let dataBuildingPromises = [];
	for (user of users) if (user.id == currentUserId) {
		dataBuildingPromises.push(storage.save('currentUser', user));
		break;
	}
	dataBuildingPromises.push(
		storage.save('messages', Fake.conversations(30, currentUserId, userIds)),
		storage.save('userFavesPost', []),
		storage.save('userFollowsUser', [])
	);
	return Promise.all(dataBuildingPromises);
}

export function sortDataDescending(onePost, twoPost) {
	return moment(twoPost.dateCreated).diff(moment(onePost.dateCreated));
}
