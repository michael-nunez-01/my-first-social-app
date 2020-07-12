import moment from 'moment';
import {default as Fake} from './DataGenerator.js';
import storage from 'react-native-simple-store';

export default async function DataInit() {
  let posts = await storage.get('feed');
  if (posts != null)
    return Promise.resolve({sysMsg: 'A feed exists; will not fetch any more data'});
  
  const NUM_USERS = 90;
  await storage.save('feed', Fake.postsPerUser(5, NUM_USERS));
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
  // TODO Remove if you are comfortable testing with different quantities of data.
  if (arrayOfUserIds.length != NUM_USERS) {
    return Promise.reject(
      storage.keys()
        .then(keys => Promise.all(keys.map(key => storage.delete(key))))
        .then(values => {
          values.forEach(() => {}); // Nothing really; to confirm all keys were removed.
        })
        .finally(() => {
          console.error(new Error('Not enough users! There are '
              +arrayOfUserIds.length
              +' users instead of '+NUM_USERS))
        })
    );
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
    storage.save('messages', Fake.conversations(60, currentUserId, arrayOfUserIds)),
    storage.save('userFavesPost', []),
    storage.save('userFollowsUser', [])
  );
  return Promise.all(dataBuildingPromises);
}

export class DataPaginator {
  constructor(dataArray, itemsPerPage) {
    this._data = Array.from(dataArray);
    this._itemCount = parseInt(itemsPerPage);
    if (isNaN(this._itemCount)) throw new Error('Item count is not an integer.');
    this._numPages = this._itemCount > 0
      ? Math.ceil(this._data.length / this._itemCount)
      : 0;
    
    this._getPageData = (pageNumber) => {
      if (pageNumber > this._numPages || pageNumber < 0)
        throw new Error('Page index out of bounds');
      else if (this._itemCount <= 0) return [];
      const upperIndex = pageNumber * this._itemCount + this._itemCount;
      //console.log(pageNumber + 1, 'of', this._numPages);
      return this._data.slice(
        pageNumber * this._itemCount,
        upperIndex > this._data.length - 1
          ? this._data.length
          : upperIndex
      );
    }
    
    this._setupIterator();
  }
  _setupIterator() {
    this[Symbol.iterator] = function() {
      let currentPage = 0;
      const { _numPages: numPages, _getPageData: pageData } = this;
      return {
        current: () => pageData(currentPage),
        last: () => currentPage == 0 ? [] : pageData(currentPage - 1),
        next() {
          return {
            done: currentPage >= numPages,
            value: currentPage >= numPages ? undefined : pageData(currentPage++)
          };
        }
      }
    }
  }
  get numPages() { return this._numPages; }
  get paginator() { return this[Symbol.iterator]; }
}

/* Testing paginator
const loo = new DataPaginator([1,2,3,4,5,6,7,8,9,10,11], 3);
let you = 0;
for (looer of loo) {
  console.log(looer);
  you++;
}
console.log('you made', you);
*/

export function sortDataDescending(onePost, twoPost) {
  return moment(twoPost.dateCreated).diff(moment(onePost.dateCreated));
}

export function sortDataAscending(onePost, twoPost) {
  return moment(onePost.dateCreated).diff(moment(twoPost.dateCreated));
}
