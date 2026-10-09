// ============================================================
// SquadVox 后端接口地址配置（全项目唯一配置点）
// ============================================================
// ⚠️ 真机调试须知：
//   手机上的 127.0.0.1 / localhost 指的是「手机自己」，无法访问你电脑上的服务。
//   必须填写「电脑的局域网 IP」，并且手机与电脑连在同一个 WiFi 下。
//
// 查看电脑局域网 IP：
//   macOS  : ifconfig | grep "inet " | grep -v 127.0.0.1
//   Windows: ipconfig
//
// 端口要与服务端 .env 里的 PORT 一致（当前为 3000）。
// 路径前缀为 /squadvox/api（见服务端 app.js 的 app.use('/squadvox/api', routes)）。
//
// 换 WiFi 后 IP 通常会变，有两种改法：
//   1) 改下面的 DEFAULT_API_BASE_URL，重新编译；
//   2) 不用重新编译 —— 在小程序「游戏资料」页底部的
//      「后端服务器地址」里直接填写并保存，会写入本地缓存立即生效。
// ============================================================

// 电脑局域网 IP + 端口 + 路径前缀
export const DEFAULT_API_BASE_URL = 'http://192.168.110.41:3000/squadvox/api';

// 运行期覆盖值在本地缓存中的 key
export const API_BASE_URL_KEY = 'apiBaseUrl';

// 读取当前生效的接口地址（优先取运行期覆盖值）
export const getApiBaseUrl = () => {
  let override = '';
  try {
    override = uni.getStorageSync(API_BASE_URL_KEY) || '';
  } catch (e) {
    override = '';
  }
  const url = String(override).trim();
  return url || DEFAULT_API_BASE_URL;
};

// 写入运行期覆盖值（传空串 = 恢复默认），返回最终生效的地址
export const setApiBaseUrl = (url) => {
  const v = String(url || '').trim().replace(/\/+$/, '');
  try {
    if (v) {
      uni.setStorageSync(API_BASE_URL_KEY, v);
    } else {
      uni.removeStorageSync(API_BASE_URL_KEY);
    }
  } catch (e) {
    // ignore
  }
  return getApiBaseUrl();
};

// 判断是否使用了运行期覆盖值
export const isApiBaseUrlOverridden = () => {
  try {
    return !!String(uni.getStorageSync(API_BASE_URL_KEY) || '').trim();
  } catch (e) {
    return false;
  }
};
