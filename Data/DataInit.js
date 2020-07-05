import moment from 'moment';
import {default as Fake} from './DataGenerator.js';
import storage from 'react-native-simple-store';

export default async function DataInit() {
  let posts = await storage.get('feed');
  if (posts != null)
    return Promise.resolve({sysMsg: 'A feed exists; will not fetch any more data'});
  
  await storage.save('feed', Fake.posts(30));
  posts = await storage.get('feed');
  let arrayOfUserIds = [];
  for (aPost of posts) {
    if (arrayOfUserIds.length <= 0)
      arrayOfUserIds.push(aPost.userId);
    else {
      let isAllowed = true;
      for (usedId of arrayOfUserIds)
        if (usedId == aPost.userId) {
          isAllowed = false;
          break;
        }
      if (isAllowed) arrayOfUserIds.push(aPost.userId);
    }
  }
  await storage.save('users', arrayOfUserIds.map(userId => Fake.user(userId)));
  
  let users = await storage.get('users');
  let currentUserId = arrayOfUserIds.pop();
  let dataBuildingPromises = [];
  for (user of users) if (user.id == currentUserId) {
    dataBuildingPromises.push(storage.save('currentUser', user));
    break;
  }
  dataBuildingPromises.push(
    storage.save('messages', Fake.conversations(30, currentUserId, arrayOfUserIds)),
    storage.save('userFavesPost', []),
    storage.save('userFollowsUser', [])
  );
  return Promise.all(dataBuildingPromises);
}

export function sortDataDescending(onePost, twoPost) {
  return moment(twoPost.dateCreated).diff(moment(onePost.dateCreated));
}

export function sortDataAscending(onePost, twoPost) {
  return moment(onePost.dateCreated).diff(moment(twoPost.dateCreated));
}
