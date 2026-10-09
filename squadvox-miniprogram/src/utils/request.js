import { getApiBaseUrl } from '@/config';

export const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    const baseUrl = getApiBaseUrl();
    const fullUrl = baseUrl + options.url;

    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data);
        } else if (res.data.code === 401) {
          uni.showToast({ title: '请先登录', icon: 'none' });
          uni.navigateTo({ url: '/pages/login/login' });
          reject(res.data);
        } else {
          uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail: (err) => {
        // 真机调试时这里最常见的原因：
        // 1) 地址还是 127.0.0.1（应改为电脑局域网 IP）
        // 2) 手机和电脑不在同一个 WiFi
        // 3) 微信开发者工具未勾选「不校验合法域名」，或未使用「真机调试」模式
        console.error('[SquadVox] 请求失败:', fullUrl, err);
        uni.showToast({
          title: `网络异常，当前接口: ${baseUrl}`,
          icon: 'none',
          duration: 4000
        });
        reject(err);
      }
    });
  });
};
