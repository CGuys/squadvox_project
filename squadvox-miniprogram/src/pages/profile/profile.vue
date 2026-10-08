<template>
  <view class="p-4 space-y-4 pb-20">
    
    <!-- User Wechat Auth Banner -->
    <view class="bg-vox-card/90 backdrop-blur-md rounded-2xl p-4 border border-vox-border flex items-center justify-between">
      <view class="flex items-center gap-3">
        <view class="relative">
          <image :src="form.avatar || '/static/default-avatar.png'" class="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md" />
          <view class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></view>
        </view>
        <view>
          <view class="flex items-center gap-2">
            <text class="font-bold text-white text-base">{{ form.nickname || '未登录' }}</text>
            <text class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">微信已授权</text>
          </view>
          <text class="text-xs text-slate-400 font-mono mt-0.5">UID: {{ form.uid || '88392102' }}</text>
        </view>
      </view>
    </view>

    <!-- Game Profile Edit Card -->
    <view class="bg-vox-card/90 backdrop-blur-md rounded-2xl p-4 space-y-3.5 border border-vox-border">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-2">
          <text class="font-bold text-white text-sm">🪪 王者专属开黑名片</text>
        </view>
        <text class="text-[10px] text-slate-400">车队成员可见</text>
      </view>

      <view class="space-y-3 text-xs">
        
        <!-- Game Region (微信/QQ区) -->
        <view>
          <text class="block text-slate-400 mb-1">游戏大区</text>
          <view class="grid grid-cols-2 gap-2">
            <view @click="form.game_area = '微信区'"
                  :class="['py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition', 
                  form.game_area === '微信区' ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-bold' : 'border-slate-700 bg-slate-900 text-slate-400']">
              <text class="text-emerald-400">💬</text> 微信区
            </view>
            <view @click="form.game_area = 'QQ区'"
                  :class="['py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition', 
                  form.game_area === 'QQ区' ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-bold' : 'border-slate-700 bg-slate-900 text-slate-400']">
              <text class="text-sky-400">🐧</text> QQ区
            </view>
          </view>
        </view>

        <!-- Server & In-Game ID -->
        <view class="grid grid-cols-2 gap-2">
          <view>
            <text class="block text-slate-400 mb-1">游戏服务器</text>
            <input type="text" v-model="form.game_server" placeholder="手Q12区"
                   class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </view>
          <view>
            <text class="block text-slate-400 mb-1">王者游戏ID</text>
            <input type="text" v-model="form.game_id" placeholder="策马踏长空"
                   class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </view>
        </view>

        <!-- Rank Selection (Using Picker for better mobile experience, styled to look like input) -->
        <view>
          <text class="block text-slate-400 mb-1">当前游戏段位</text>
          <picker @change="bindRankChange" :value="rankIndex" :range="rankArray">
            <view class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white flex justify-between items-center">
              <text>{{ rankArray[rankIndex] || '请选择段位' }}</text>
              <text class="text-slate-500">▼</text>
            </view>
          </picker>
        </view>

        <!-- Main Positions -->
        <view>
          <text class="block text-slate-400 mb-1.5">擅长分路</text>
          <view class="grid grid-cols-5 gap-1.5">
            <view v-for="pos in positionArray" :key="pos" @click="togglePosition(pos)"
                  :class="['py-1.5 rounded-lg border text-center transition', 
                  form.position === pos ? 'border-indigo-500 bg-indigo-600/30 text-indigo-300 font-bold' : 'border-slate-700 bg-slate-900 text-slate-300 font-medium']">
              {{ pos }}
            </view>
          </view>
        </view>

        <!-- Save Button -->
        <button @click="handleSubmit"
                class="m-0 w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 border-none">
          <text>💾 保存个人资料</text>
        </button>
      </view>
    </view>

    <!-- Compliance Card -->
    <view class="bg-vox-card/90 backdrop-blur-md rounded-2xl p-4 space-y-2 border border-vox-border text-xs">
      <view class="flex items-center justify-between text-slate-300">
        <text class="font-bold flex items-center gap-1.5">⚖️ 合规与隐私协议</text>
      </view>
      <text class="text-[11px] text-slate-400 leading-relaxed block">
        SquadVox 严格遵守微信小程序运营规范。用户资料均由自主登记，本应用不抓取、不爬取游戏数据，实时语音与文字消息均经过内容安全审查拦截。
      </text>
    </view>
    
    <view class="text-center text-[11px] text-slate-500 pt-2">
      SquadVox 开黑语聊房 v1.0.0
    </view>
    
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { saveInfo, getInfo } from '@/api/index';

const areaArray = ['微信区', 'QQ区'];
const rankArray = ['倔强青铜', '秩序白银', '荣耀黄金', '尊贵铂金', '永恒钻石', '至尊星耀', '最强王者', '无双王者', '荣耀王者', '传奇王者'];
const positionArray = ['对抗路', '打野', '中路', '发育路', '游走'];

const areaIndex = ref(-1);
const rankIndex = ref(-1);
const positionIndex = ref(-1);

const form = ref({
  avatar: '',
  nickname: '',
  uid: '',
  game_area: '微信区',
  game_server: '',
  game_id: '',
  rank: '',
  position: ''
});

onMounted(async () => {
  const userInfo = uni.getStorageSync('userInfo') || {};
  form.value.avatar = userInfo.avatar || '';
  form.value.nickname = userInfo.nickname || '';
  form.value.uid = userInfo.uid || '';

  try {
    const { data } = await getInfo();
    if (data) {
      form.value = { ...form.value, ...data };
      areaIndex.value = areaArray.indexOf(data.game_area);
      rankIndex.value = rankArray.indexOf(data.rank);
      positionIndex.value = positionArray.indexOf(data.position);
    }
  } catch (e) {
    console.error(e);
  }
});

const bindRankChange = (e) => {
  rankIndex.value = e.detail.value;
  form.value.rank = rankArray[rankIndex.value];
};

const togglePosition = (pos) => {
  form.value.position = pos;
  positionIndex.value = positionArray.indexOf(pos);
};

const handleSubmit = async () => {
  if (!form.value.game_area || !form.value.game_id || !form.value.rank || !form.value.position) {
    uni.showToast({ title: '请填写完整资料', icon: 'none' });
    return;
  }

  try {
    uni.showLoading({ title: '保存中' });
    await saveInfo({
      game_area: form.value.game_area,
      game_server: form.value.game_server,
      game_id: form.value.game_id,
      rank: form.value.rank,
      position: form.value.position
    });
    uni.hideLoading();
    uni.showToast({ title: '保存成功' });
    
    // update local storage
    const userInfo = uni.getStorageSync('userInfo') || {};
    uni.setStorageSync('userInfo', { ...userInfo, ...form.value });

    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' });
    }, 1000);
  } catch (e) {
    uni.hideLoading();
  }
};
</script>

<style scoped>
button::after {
  border: none;
}
</style>
