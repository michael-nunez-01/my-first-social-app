# Michael's first social app

Hello everyone, I was given a React Native Android project to do in 1 week. I had to create a social app the following functions, with no limit to creativity.

- Posting
- Comment on post
- Like post/comment
- Profile
- Follow/unfollow
- Message

## The experience

Somehow I was able to accomplish the whole thing, but not without bugs. As you can see in the commit history, there have been some sleepless nights; as in, commits past 12 AM. I made it a point to get the needed functionality and their interactions with the UI done. But it did end up making the app look really plain. Despite that, I think my most of my hard work had paid off!

## The finished features

- Make posts and replies to them
- View post and all replies to it
- See people's profiles to follow and message them directly
- 'Favorite' posts; the equivalent of 'liking' them

## What needs improvement

If I were to still work on this, I had made a list of things to improve on:

- [ ] Use an actual *online database*, and not local storage
- [ ] Have a design in mind
- [ ] Control the dates generated so they correctly appear in chronological order
- [ ] Speed up fetching for conversations; allow control of view while updating
- [ ] Add some indication of who you are on app open
- [ ] Add profile pictures
- [ ] Fix button-pressing bug in reply forms
- [ ] Check for any needed state-refreshes not occurring
- [ ] Decide on keeping or remove the floating search buttons
- [ ] Allow viewing of followers and favorited posts in order

## Third-party libraries used

...And lastly, I have to thank these libraries for making this work a little (or a lot!) easier:

- [React Navigation](https://reactnavigation.org)
- [React Native vector icons](https://github.com/oblador/react-native-vector-icons) ([Feather](https://feathericons.com))
- [React Native simple storage](https://github.com/jasonmerino/react-native-simple-store)
- [GiftedChat](https://github.com/FaridSafi/react-native-gifted-chat)
- [React Native searchable dropdown](https://github.com/zubairpaizer/react-native-searchable-dropdown)
- [Coolors.co](https://coolors.co), but really just for color ideas
