<template>
  <view class="container room-detail flex flex-col h-screen p-4 bg-vox-dark space-y-3">
    
    <!-- Room Header Card -->
    <view class="bg-vox-card/90 backdrop-blur-md rounded-2xl p-3.5 space-y-2 border border-vox-border">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <view class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></view>
          <text class="text-base font-black text-white truncate max-w-[200px]">当前房间: {{ roomNo }}</text>
          <text class="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold shrink-0">实时连麦</text>
        </view>
        <view class="flex items-center gap-1.5 text-xs">
          <text class="text-emerald-400 font-mono text-[11px]">📶 18ms</text>
        </view>
      </view>

      <!-- Room Meta / Fast Share Row -->
      <view class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
        <view class="flex items-center gap-2">
          <text>房间号: <text class="text-slate-200 font-mono">{{ roomNo }}</text></text>
          <text class="text-slate-600">|</text>
          <text>安全保障中</text>
        </view>

        <view @click="copyLink" class="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-medium bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/50 transition">
          <text>📋 复制组队文案</text>
        </view>
      </view>
    </view>

    <!-- OS Background Voice Notice Banner -->
    <view class="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2.5 text-[11px] text-indigo-200 flex items-start gap-2">
      <text class="text-cyan-400 mt-0.5 shrink-0">🛡️</text>
      <view>
        <text class="font-bold text-white">后台语聊保活指南：</text>
        <text>切至游戏时iOS麦克风仅可收听；安卓建议在手机后台锁定本小程序并关闭省电策略。</text>
      </view>
    </view>

    <!-- TRTC Voice Stage (车队麦位区) -->
    <view class="bg-vox-card/90 backdrop-blur-md rounded-2xl p-4 border border-vox-border">
      <view class="flex items-center justify-between mb-3 text-xs">
        <text class="font-bold text-slate-300 flex items-center gap-1.5">🎙️ 小队麦位席 (TRTC实时声讯)</text>
        <text class="text-[11px] text-slate-400">点击头像可查看资料</text>
      </view>

      <!-- Slots Layout Grid -->
      <view class="grid grid-cols-5 gap-2">
        <!-- Self Member -->
        <view class="flex flex-col items-center gap-1">
          <view :class="['relative w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all', isSpeaking ? 'voice-active' : 'border-slate-700 bg-slate-800']">
            <image :src="userInfo.avatar || '/static/default-avatar.png'" class="w-full h-full rounded-xl object-cover" />
            <view v-if="!isMicOn" class="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px]">🔇</view>
          </view>
          <text class="text-[10px] text-slate-300 truncate w-12 text-center">{{ userInfo.nickname || '我' }}</text>
          <text class="text-[8px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">房主</text>
        </view>

        <!-- Empty Seats Mock -->
        <view v-for="i in 4" :key="i" class="flex flex-col items-center gap-1">
          <view class="w-12 h-12 rounded-xl border border-dashed border-slate-700 flex items-center justify-center bg-slate-900/50">
            <text class="text-slate-600 text-lg">+</text>
          </view>
          <text class="text-[10px] text-slate-500">虚位以待</text>
        </view>
      </view>

      <!-- Sound Wave Activity Bar Indicator -->
      <view class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <view class="flex items-center gap-2">
          <text class="text-[11px] text-slate-400">当前发言:</text>
          <text class="text-xs font-bold text-emerald-400">{{ isSpeaking ? (userInfo.nickname || '我') : '暂无' }}</text>
        </view>
        <!-- Equalizer Sound Wave Mock -->
        <view class="flex items-end gap-1 h-5 px-2" v-if="isSpeaking">
          <view class="w-1 bg-emerald-400 rounded-full bar-1"></view>
          <view class="w-1 bg-emerald-400 rounded-full bar-2"></view>
          <view class="w-1 bg-emerald-400 rounded-full bar-3"></view>
          <view class="w-1 bg-emerald-400 rounded-full bar-4"></view>
        </view>
      </view>
    </view>

    <!-- Room Barrage / Chat Area -->
    <view class="bg-vox-card/90 backdrop-blur-md rounded-2xl p-3 flex-1 flex flex-col justify-between border border-vox-border overflow-hidden min-h-[160px]">
      <scroll-view scroll-y class="overflow-y-auto space-y-2 pr-1 text-xs h-32" :scroll-top="scrollTop">
        <view class="text-[11px] text-slate-500 text-center py-1">
          - 房间已开启微信内容安全审核，严禁广告、代练与侮辱言论 -
        </view>
        <view v-for="(msg, idx) in messages" :key="idx" class="flex items-start gap-1.5 text-slate-300">
          <text class="px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 text-[10px]">{{ msg.nickname }}</text>
          <text class="text-slate-400">{{ msg.content }}</text>
        </view>
      </scroll-view>

      <view class="pt-2 border-t border-white/5 space-y-2">
        <scroll-view scroll-x class="flex whitespace-nowrap gap-1.5 text-[11px] pb-1">
          <view class="inline-flex gap-1.5">
            <view @click="sendQuickChat('我打野带飞，你们稳住！')" class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 transition">我打野带飞</view>
            <view @click="sendQuickChat('缺个硬辅开团，直接上车！')" class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 transition">缺个硬辅开团</view>
            <view @click="sendQuickChat('大家能听到我说话吗？')" class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 transition">测试麦克风</view>
          </view>
        </scroll-view>

        <view class="flex items-center gap-2">
          <input type="text" v-model="chatInput" placeholder="发弹幕交流..." @confirm="sendChat" confirm-type="send"
                 class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
          <button @click="sendChat"
                  class="m-0 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition border-none leading-normal">
            发送
          </button>
        </view>
      </view>
    </view>

    <!-- In-Room Voice Control Bar -->
    <view class="bg-vox-card/90 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between border border-vox-border mt-auto">
      <view class="flex items-center gap-3">
        <view @click="toggleMic" :class="['flex items-center gap-2 px-3 py-2 rounded-xl border transition', isMicOn ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/30']">
          <text class="text-sm">{{ isMicOn ? '🎤' : '🔇' }}</text>
          <text class="text-xs font-bold">{{ isMicOn ? '已开麦' : '已闭麦' }}</text>
        </view>

        <view @click="toggleAudio" :class="['flex items-center gap-1.5 px-3 py-2 rounded-xl border transition', isAudioOn ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-700 text-white border-slate-600']">
          <text class="text-xs">{{ isAudioOn ? '🔊' : '🔈' }}</text>
          <text class="text-xs font-medium">{{ isAudioOn ? '扬声器' : '已静音' }}</text>
        </view>
      </view>

      <view @click="quitRoom" class="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition text-xs font-bold">
        <text>退出</text>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getSig, sendMessage } from '@/api/index';

const roomNo = ref('');
const userInfo = ref({});
const isMicOn = ref(true);
const isAudioOn = ref(true);
const isSpeaking = ref(false); 

const chatInput = ref('');
const messages = ref([
  { nickname: '系统', content: '欢迎来到开黑语聊房！请文明发言。' }
]);
const scrollTop = ref(0);
let speakTimer = null;

onLoad((options) => {
  if (options.roomNo) {
    roomNo.value = options.roomNo;
  }
});

onMounted(async () => {
  userInfo.value = uni.getStorageSync('userInfo') || {};
  
  // mock speaking animation
  speakTimer = setInterval(() => {
    if (isMicOn.value) {
      isSpeaking.value = Math.random() > 0.5;
    } else {
      isSpeaking.value = false;
    }
  }, 1000);

  try {
    const { data } = await getSig();
    console.log('获取到TRTC鉴权信息：', data);
  } catch (e) {
    console.error('获取Sig失败', e);
  }
});

onUnmounted(() => {
  if (speakTimer) clearInterval(speakTimer);
});

const toggleMic = () => {
  isMicOn.value = !isMicOn.value;
};

const toggleAudio = () => {
  isAudioOn.value = !isAudioOn.value;
};

const quitRoom = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出房间吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack();
      }
    }
  });
};

const sendChat = async () => {
  if (!chatInput.value.trim()) return;
  
  try {
    const text = chatInput.value;
    chatInput.value = '';
    
    await sendMessage({ room_no: roomNo.value, content: text });
    
    messages.value.push({
      nickname: userInfo.value.nickname || '我',
      content: text
    });
    
    setTimeout(() => {
      scrollTop.value += 1000;
    }, 100);
  } catch (e) {
  }
};

const sendQuickChat = (text) => {
  chatInput.value = text;
  sendChat();
};

const copyLink = () => {
  uni.setClipboardData({
    data: `来SquadVox极速上星啦！免加好友秒连麦，房间号：${roomNo.value}，速来！`,
    success: () => {
      uni.showToast({ title: '文案复制成功，快去分享吧', icon: 'none' });
    }
  });
};
</script>

<style scoped>
button::after {
  border: none;
}
</style>
