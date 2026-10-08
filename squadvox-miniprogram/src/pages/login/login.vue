<template>
  <view class="container login-container">
    <view class="logo-area">
      <image src="/static/logo.png" class="logo" mode="aspectFit"></image>
      <text class="title">SquadVox 开黑语聊</text>
      <text class="slogan">极速开黑语音，随时随地集结车队</text>
    </view>
    
    <view class="btn-area">
      <button class="btn-primary" @click="handleWechatLogin">微信一键授权登录</button>
      <view class="agreement">
        <checkbox :checked="agreed" @click="agreed = !agreed" class="checkbox" color="#3b82f6" style="transform:scale(0.7)"/>
        <text>我已阅读并同意《用户隐私协议》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { login } from '@/api/index';

const agreed = ref(false);

const handleWechatLogin = () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意隐私协议', icon: 'none' });
    return;
  }
  
  // #ifndef H5
  uni.login({
    provider: 'weixin',
    success: async (res) => {
      if (res.code) {
        try {
          uni.showLoading({ title: '登录中...' });
          // In a real mini-program, you'd also get user profile here using uni.getUserProfile if needed.
          // For V1.0, we just login with code.
          const { data } = await login({ code: res.code, nickname: '微信用户', avatar: '' });
          uni.setStorageSync('token', data.token);
          uni.setStorageSync('userInfo', data.user);
          uni.hideLoading();
          uni.showToast({ title: '登录成功' });
          
          setTimeout(() => {
            // Check if game info is complete, else go to profile
            if (!data.user.game_id) {
              uni.navigateTo({ url: '/pages/profile/profile' });
            } else {
              uni.reLaunch({ url: '/pages/index/index' });
            }
          }, 1000);
        } catch (e) {
          uni.hideLoading();
        }
      } else {
        uni.showToast({ title: '微信登录失败', icon: 'none' });
      }
    }
  });
  // #endif

  // #ifdef H5
  const mockH5Login = async () => {
    try {
      uni.showLoading({ title: 'H5模拟登录...' });
      const { data } = await login({ code: 'mock-h5-code', nickname: 'H5用户', avatar: '' });
      uni.setStorageSync('token', data.token);
      uni.setStorageSync('userInfo', data.user);
      uni.hideLoading();
      uni.showToast({ title: '登录成功' });
      
      setTimeout(() => {
        if (!data.user.game_id) {
          uni.navigateTo({ url: '/pages/profile/profile' });
        } else {
          uni.reLaunch({ url: '/pages/index/index' });
        }
      }, 1000);
    } catch (e) {
      uni.hideLoading();
    }
  };
  mockH5Login();
  // #endif
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80px;
}
.logo {
  width: 100px;
  height: 100px;
  background-color: #27272a; /* Placeholder for actual logo */
  border-radius: 20px;
  margin-bottom: 20px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
.slogan {
  font-size: 14px;
  color: #a1a1aa;
}
.btn-area {
  width: 100%;
}
.agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  font-size: 12px;
  color: #a1a1aa;
}
</style>
