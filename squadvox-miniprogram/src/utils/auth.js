import { login, uploadAvatar } from '@/api/index';

// ------------------------------------------------------------
// 会话管理：token / userInfo 的读写与清理
// ------------------------------------------------------------
export const getToken = () => {
  try { return uni.getStorageSync('token') || ''; } catch (e) { return ''; }
};

export const getCachedUser = () => {
  try { return uni.getStorageSync('userInfo') || null; } catch (e) { return null; }
};

export const saveSession = (token, user) => {
  try {
    if (token) uni.setStorageSync('token', token);
    if (user) uni.setStorageSync('userInfo', user);
  } catch (e) {
    // ignore
  }
};

export const saveCachedUser = (user) => {
  try { uni.setStorageSync('userInfo', user); } catch (e) {}
};

// 清空登录态（切换微信账号 / 退出登录时用）
export const clearSession = () => {
  try {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
  } catch (e) {
    // ignore
  }
};

// ------------------------------------------------------------
// 微信一键登录：uni.login 拿 code -> 后端换 token -> 落库
// 注意：拿到的 code 只能用于换 openid，拿不到头像昵称，
//       头像昵称必须由用户通过 chooseAvatar / nickname 输入显式提供。
// ------------------------------------------------------------
export const wechatLogin = () => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: 'weixin',
      success: async (res) => {
        if (!res || !res.code) {
          reject(new Error('微信未返回 code'));
          return;
        }
        try {
          // 不传昵称/头像：交由服务端为新用户随机生成一套主题名片
          const { data } = await login({ code: res.code });
          saveSession(data.token, data.user);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      fail: (err) => reject(err)
    });
    // #endif

    // #ifndef MP-WEIXIN
    (async () => {
      try {
        const { data } = await login({ code: 'mock-h5-code' });
        saveSession(data.token, data.user);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    })();
    // #endif
  });
};

// ------------------------------------------------------------
// 抓取本地临时头像并上传到自己的服务器
// chooseAvatar / chooseImage 给出的是 wxfile:// 临时路径，
// 重启即失效，必须把文件内容取出来回传持久化。
// ------------------------------------------------------------
export const OSS_BASE_URL = 'https://squadvox-project.oss-cn-beijing.aliyuncs.com/';

export const formatAvatar = (url) => {
  if (!url) return '/static/default-avatar.png';
  if (url.startsWith('http') || url.startsWith('/static')) return url;
  if (url.startsWith('avatars/') || url.startsWith('uploads/')) return OSS_BASE_URL + url;
  return OSS_BASE_URL + url;
};

export const uploadLocalAvatar = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('缺少文件路径'));
      return;
    }

    // #ifdef MP-WEIXIN
    uni.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: async (r) => {
        try {
          if (!r || !r.data) throw new Error('读取文件内容失败');
          const ext = String(filePath).split('.').pop().toLowerCase();
          const mime = (ext === 'jpg' || ext === 'jpeg') ? 'jpeg' : (ext === 'webp' ? 'webp' : 'png');
          const { data } = await uploadAvatar({ dataUrl: `data:image/${mime};base64,${r.data}` });
          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      },
      fail: (err) => reject(err)
    });
    // #endif

    // #ifndef MP-WEIXIN
    // H5 端拿到的就是可用的 blob/本地地址，直接用
    resolve(filePath);
    // #endif
  });
};
