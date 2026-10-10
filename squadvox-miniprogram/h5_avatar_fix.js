const fs = require('fs');

const path = 'src/pages/index/index.vue';
let content = fs.readFileSync(path, 'utf8');

// 1. Add @click="onAvatarClick" to the button
const targetButton = `<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar"`;
const replacementButton = `<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar" @click="onAvatarClick"`;
content = content.replace(targetButton, replacementButton);

// 2. Refactor the JS methods
const targetMethods = `const onChooseAvatar = async (e) => {
  const filePath = e && e.detail && e.detail.avatarUrl;
  if (!filePath) return;

  uni.showLoading({ title: '上传头像中...', mask: true });
  try {
    const url = await uploadLocalAvatar(filePath);
    currentUser.value.avatar = url;
    await saveInfo({ avatar: url }); // 立即落库，避免用户忘了点保存
    saveCachedUser(currentUser.value);
    syncCurrentUserToRoom();
    uni.hideLoading();
    showToast('微信头像已更新', 'success');
  } catch (err) {
    uni.hideLoading();
    console.error('[SquadVox] 头像上传失败:', err);
    showToast('头像上传失败，请重试', 'error');
  }
};`;

const replacementMethods = `const handleAvatarUpload = async (filePath) => {
  if (!filePath) return;
  uni.showLoading({ title: '上传头像中...', mask: true });
  try {
    const url = await uploadLocalAvatar(filePath);
    currentUser.value.avatar = url;
    await saveInfo({ avatar: url }); // 立即落库
    saveCachedUser(currentUser.value);
    syncCurrentUserToRoom();
    uni.hideLoading();
    showToast('头像已更新', 'success');
  } catch (err) {
    uni.hideLoading();
    console.error('[SquadVox] 头像上传失败:', err);
    showToast('头像上传失败，请重试', 'error');
  }
};

const onAvatarClick = () => {
  // #ifdef H5
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    success: (res) => {
      const filePath = res.tempFilePaths[0];
      handleAvatarUpload(filePath);
    }
  });
  // #endif
};

const onChooseAvatar = (e) => {
  const filePath = e && e.detail && e.detail.avatarUrl;
  if (filePath) {
    handleAvatarUpload(filePath);
  }
};`;

content = content.replace(targetMethods, replacementMethods);

fs.writeFileSync(path, content, 'utf8');
console.log('H5 Avatar support added!');
