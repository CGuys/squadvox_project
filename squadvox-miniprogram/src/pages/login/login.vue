<template>
  <view class="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
    <!-- Background Decorators -->
    <view class="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></view>
    <view class="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></view>

    <!-- Main Card -->
    <view class="w-full max-w-sm glass-card rounded-3xl p-8 border border-indigo-500/20 shadow-2xl relative z-10 flex flex-col items-center">
      <!-- Logo Area -->
      <view class="mb-8 flex flex-col items-center">
        <view class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center font-black tracking-widest text-slate-950 text-3xl shadow-lg shadow-indigo-500/40 mb-4">
          SV
        </view>
        <text class="text-2xl font-black text-white tracking-wide">SquadVox</text>
        <text class="text-xs text-slate-400 mt-2 font-medium">极速开黑语音，随时随地集结车队</text>
      </view>
      
      <!-- Actions Area -->
      <view class="w-full space-y-4">
        <button @click="handleWechatLogin" :loading="logging" :disabled="logging"
                class="w-full h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-indigo-500/30 active:scale-95 transition m-0 border-none">
          <i class="fa-brands fa-weixin text-lg mr-2"></i> 微信一键授权登录
        </button>

        <!-- 说明：微信现行规范下，头像/昵称无法由登录接口直接取得 -->
        <view class="mt-3 px-1 text-[11px] text-slate-500 leading-relaxed">
          <text class="block">· 登录仅用于获取你的微信唯一标识（openid）</text>
          <text class="block">· 头像与昵称需你本人确认授权，登录后可在「游戏资料」一键获取或随时修改</text>
        </view>

        <view class="flex items-center justify-center mt-4 text-xs text-slate-400 gap-2">
          <view @click="agreed = !agreed" 
                class="w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer"
                :class="agreed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-slate-900'">
            <i v-if="agreed" class="fa-solid fa-check text-white text-[10px]"></i>
          </view>
          <text @click="agreed = !agreed" class="cursor-pointer select-none">我已阅读并同意</text>
          <text class="text-indigo-400 hover:text-indigo-300 cursor-pointer">《用户隐私协议》</text>
        </view>
      </view>
    </view>
    
    <view class="absolute bottom-10 text-[10px] text-slate-600 font-mono text-center">
      <text>SquadVox v1.0.0 (Build 20261009)</text><br/>
      <text>Powered by UniApp & TailwindCSS</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { wechatLogin } from '@/utils/auth';

const agreed = ref(false);
const logging = ref(false);

const handleWechatLogin = async () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先勾选同意隐私协议', icon: 'none' });
    return;
  }
  if (logging.value) return;
  logging.value = true;

  uni.showLoading({ title: '微信安全登录中...', mask: true });
  try {
    // 只做「拿 openid 换 token」这一步。
    // 微信的头像/昵称必须由用户主动提供（chooseAvatar + nickname 输入），
    // 所以这里不再硬编码「微信用户」这种占位昵称。
    const data = await wechatLogin();
    uni.hideLoading();

    const user = (data && data.user) || {};
    // 资料不完整（没填过游戏ID）就直接落到「游戏资料」页去完成授权与填写
    if (!user.game_id) {
      uni.reLaunch({ url: '/pages/index/index?tab=profile' });
    } else {
      uni.reLaunch({ url: '/pages/index/index' });
    }
  } catch (err) {
    uni.hideLoading();
    console.error('[SquadVox] 登录失败:', err);
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
  } finally {
    logging.value = false;
  }
};
</script>
