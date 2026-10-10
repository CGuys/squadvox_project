const fs = require('fs');

const path = 'src/pages/index/index.vue';
let content = fs.readFileSync(path, 'utf8');

// Add syncCurrentUserToRoom function
const syncHelper = `
const syncCurrentUserToRoom = () => {
  if (activeRoom.value && activeRoom.value.members) {
    const mySeat = activeRoom.value.members.find(m => m.id === currentUser.value.id);
    if (mySeat) {
      mySeat.name = currentUser.value.nickname;
      mySeat.avatar = currentUser.value.avatar;
      mySeat.rank = currentUser.value.rank;
      mySeat.position = currentUser.value.positions[0] || '发育路';
    }
  }
};
`;

// Insert it right before onChooseAvatar
content = content.replace(`const onChooseAvatar = async (e) => {`, syncHelper + '\nconst onChooseAvatar = async (e) => {');

// Add calls to syncCurrentUserToRoom() in the update functions
content = content.replace(
  `saveCachedUser(currentUser.value);`,
  `saveCachedUser(currentUser.value);\n    syncCurrentUserToRoom();`
);
// Above replace uses regex or exact string, wait, replace only does the FIRST occurrence!
// Let's use global replacement:
content = content.replace(/saveCachedUser\(currentUser\.value\);/g, `saveCachedUser(currentUser.value);\n    syncCurrentUserToRoom();`);

fs.writeFileSync(path, content, 'utf8');
console.log('Sync room member info added!');
