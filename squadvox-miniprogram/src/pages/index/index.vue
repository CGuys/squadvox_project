<template>
  <view class="p-4 space-y-4 pb-20">
    <!-- Banner Hero: 极速发车 -->
    <view class="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl">
      <view class="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></view>
      <view class="flex items-start justify-between">
        <view>
          <text class="text-[10px] uppercase font-black tracking-widest text-cyan-400 flex items-center gap-1">⚡ Low Latency TRTC</text>
          <view class="text-lg font-black text-white mt-1">SquadVox 极速开黑</view>
          <text class="text-xs text-slate-300 mt-0.5">免加好友 • 低延迟连麦 • 闪电发车</text>
        </view>
        <button @click="goToCreateRoom" class="m-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 active:scale-95 transition">
          <text>+ 创建车队</text>
        </button>
      </view>

      <!-- Quick Game Stats Bar -->
      <view class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
        <view class="flex items-center gap-2">
          <text class="text-slate-400">我的名片:</text>
          <text class="font-semibold text-cyan-300">{{ userInfo.rank || '未设置' }}</text>
          <text class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]" v-if="userInfo.position">{{ userInfo.position }}</text>
        </view>
        <view @click="goToProfile" class="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1">
          <text>资料设置 ＞</text>
        </view>
      </view>
    </view>

    <!-- Compliance Mini Alert -->
    <view class="bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2 text-[11px] text-amber-300 flex items-start gap-2">
      <text class="mt-0.5 text-xs text-amber-400 shrink-0">⚠️</text>
      <text>合规提示：所有段位数据由玩家自主手动录入，本工具与腾讯官方及《王者荣耀》无关联。</text>
    </view>

    <!-- Filter Controls -->
    <view class="space-y-2">
      <!-- Room Type Filter -->
      <view class="flex items-center justify-between">
        <text class="text-xs font-bold text-slate-300 flex items-center gap-1.5">🎮 车队模式</text>
        <view class="flex gap-1.5 text-xs">
          <view v-for="type in typeArray" :key="type" 
                @click="onTypeChange(type)"
                :class="currentType === type ? 'px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium' : 'px-2.5 py-1 rounded-lg bg-vox-card text-slate-400 border border-vox-border'">
            {{ type === '' ? '全部' : type }}
          </view>
        </view>
      </view>

      <!-- Room Tag Filter -->
      <scroll-view scroll-x class="flex whitespace-nowrap gap-2 pb-1 text-xs">
        <view class="inline-flex gap-2">
          <view v-for="tag in tagArray" :key="tag.value"
                @click="onTagChange(tag.value)"
                :class="currentTag === tag.value ? 'px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0 font-medium' : 'px-3 py-1 rounded-full bg-vox-card text-slate-400 border border-vox-border shrink-0'">
            {{ tag.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Room Cards List -->
    <view class="space-y-3">
      <view v-for="room in roomList" :key="room.room_no" 
            class="bg-vox-card/90 backdrop-blur-md rounded-2xl p-3.5 border border-vox-border space-y-2.5">
        
        <view class="flex items-start justify-between">
          <view class="flex items-center gap-2.5">
            <view class="relative">
              <image :src="room.owner_avatar || '/static/default-avatar.png'" class="w-10 h-10 rounded-xl object-cover border border-white/10" />
            </view>
            <view>
              <view class="flex items-center gap-1.5">
                <text class="font-bold text-white text-xs tracking-wide">{{ room.room_name }}</text>
                <text v-if="room.is_encrypted" class="text-[10px] text-amber-400">🔒</text>
              </view>
              <view class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <text>房主: <text class="text-slate-300 font-bold">{{ room.owner_nickname }}</text></text>
                <text class="text-slate-600">•</text>
                <text class="text-indigo-300 font-semibold">{{ room.owner_rank }}</text>
              </view>
            </view>
          </view>
          <text :class="['text-[10px] px-2 py-0.5 rounded-md font-semibold', getTagClass(room.tag)]">
            {{ room.tag || '无标签' }}
          </text>
        </view>

        <!-- Bottom bar of Card -->
        <view class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <view class="flex items-center gap-2 text-slate-400">
            <text class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">{{ room.room_type }}</text>
            <text class="text-[11px] flex items-center gap-1">
              <text :class="isRoomFull(room) ? 'text-rose-400' : 'text-emerald-400 font-bold'">{{ room.current_num || '-' }}</text> / {{ room.max_num }} 人
            </text>
          </view>

          <view>
            <button @click="joinRoom(room)" :disabled="isRoomFull(room)"
                    :class="[
                      'm-0 px-3.5 py-1 rounded-xl text-xs transition border-none', 
                      isRoomFull(room) ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold active:scale-95 shadow-md shadow-indigo-500/20'
                    ]">
              {{ isRoomFull(room) ? '车队已满' : '上车入麦' }}
            </button>
          </view>
        </view>
      </view>

      <view v-if="roomList.length === 0" class="text-center py-10 text-slate-500 text-xs">
        <text class="text-2xl mb-2 text-slate-600">🎮</text>
        <view>暂无符合筛选条件的开黑房间</view>
        <button @click="goToCreateRoom" class="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium inline-block m-0">创建第一个车队</button>
      </view>
    </view>

    <!-- Password Dialog -->
    <view v-if="showPwdDialog" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <view class="w-full max-w-xs bg-vox-card rounded-2xl border border-vox-border p-5 space-y-4">
        <view class="flex items-center justify-between">
          <text class="font-bold text-white text-sm">请输入房间密码</text>
          <view @click="showPwdDialog = false" class="text-slate-400 hover:text-white text-lg">×</view>
        </view>
        <input v-model="pwdInput" password maxlength="6" placeholder="输入密码"
               class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-sm" />
        <view class="flex gap-2">
          <button @click="showPwdDialog = false" class="m-0 flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs">取消</button>
          <button @click="confirmJoinEncrypted" class="m-0 flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs">验证进入</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { listRooms, enterRoom } from '@/api/index';

const userInfo = ref({});
const roomList = ref([]);
const isRefreshing = ref(false);

const typeArray = ['', '5排', '3排', '2排'];
const tagArray = [
  { label: '全部标签', value: '' },
  { label: '🔥 冲分上星', value: '冲分上星' },
  { label: '✨ 欢乐娱乐', value: '欢乐娱乐' },
  { label: '🎯 练新英雄', value: '练新英雄' }
];

const currentType = ref('');
const currentTag = ref('');

const showPwdDialog = ref(false);
const pwdInput = ref('');
const selectedRoom = ref(null);

onShow(() => {
  userInfo.value = uni.getStorageSync('userInfo') || {};
  fetchRooms();
});

const fetchRooms = async () => {
  try {
    isRefreshing.value = true;
    const params = {};
    if (currentType.value) params.room_type = currentType.value;
    if (currentTag.value) params.tag = currentTag.value;
    
    const { data } = await listRooms(params);
    roomList.value = data || [];
  } catch (e) {
    console.error(e);
  } finally {
    isRefreshing.value = false;
  }
};

const onTypeChange = (type) => {
  currentType.value = type;
  fetchRooms();
};

const onTagChange = (val) => {
  currentTag.value = val;
  fetchRooms();
};

const goToProfile = () => {
  uni.navigateTo({ url: '/pages/profile/profile' });
};

const goToCreateRoom = () => {
  uni.navigateTo({ url: '/pages/room/create' });
};

const isRoomFull = (room) => {
  return room.current_num >= room.max_num;
};

const joinRoom = async (room) => {
  if (isRoomFull(room)) return;
  if (room.is_encrypted) {
    selectedRoom.value = room;
    pwdInput.value = '';
    showPwdDialog.value = true;
  } else {
    executeJoin(room.room_no, '');
  }
};

const confirmJoinEncrypted = () => {
  if (!pwdInput.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' });
    return;
  }
  executeJoin(selectedRoom.value.room_no, pwdInput.value);
  showPwdDialog.value = false;
};

const executeJoin = async (room_no, room_pwd) => {
  try {
    uni.showLoading({ title: '加入中...' });
    const { data } = await enterRoom({ room_no, room_pwd });
    uni.hideLoading();
    uni.showToast({ title: '加入成功' });
    uni.navigateTo({ url: `/pages/room/detail?roomNo=${room_no}` });
  } catch (e) {
    uni.hideLoading();
  }
};

const getTagClass = (tag) => {
  if (tag === '冲分上星') return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
  if (tag === '欢乐娱乐') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
  return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
};
</script>

<style scoped>
button::after {
  border: none;
}
</style>
