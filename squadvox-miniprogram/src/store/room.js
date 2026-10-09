import { ref, computed } from 'vue';

// ============================================================
// 跨页面共享的房间状态
// 「开黑大厅」(pages/index) 与「语聊房」(pages/room/detail) 读写同一份数据。
// 小程序所有页面跑在同一个 JS 上下文里，模块级单例即可共享。
// ============================================================

// 当前登录用户（登录 / 拉取资料后由服务端数据填充）
export const currentUser = ref({
  id: 0,
  openid: '',
  nickname: '',
  avatar: '',
  region: '微信区',
  server: '',
  gameId: '',
  rank: '',
  positions: [],
  isMicOn: true,
  isSpeakerOn: true
});

// 当前所在房间（null = 不在任何房间）
export const activeRoom = ref(null);

// 房主是否开启「全员静音」
export const isAllMutedByHost = ref(false);

// 房间文字弹幕
export const chatMessages = ref([
  { isSystem: true, sender: '系统', content: '欢迎进入 SquadVox，开麦畅爽沟通！' }
]);

// 指定麦位是否正在说话（驱动头像外圈的涟漪）
export const isSeatSpeaking = (index) => {
  const room = activeRoom.value;
  const m = room && room.members[index];
  return !!(m && m.isSpeaking && m.micOpen && !isAllMutedByHost.value);
};

// 当前正在说话的成员
export const currentSpeaker = computed(() => {
  if (!activeRoom.value) return null;
  return activeRoom.value.members.find(m => m.isSpeaking && m.micOpen && !isAllMutedByHost.value);
});

// 房主（用于顶部大位展示）
export const hostMember = computed(() => {
  const room = activeRoom.value;
  if (!room || !room.members || !room.members.length) return null;
  return room.members.find(m => m.isHost) || room.members[0];
});

// 麦位网格：参考主流语聊房，固定 4 列
export const voiceSlotsGridClass = computed(() => {
  const total = activeRoom.value ? activeRoom.value.maxNum : 8;
  if (total <= 2) return 'grid grid-cols-2 gap-4';
  return 'grid grid-cols-4 gap-x-2 gap-y-4';
});

// 当前用户是否是房主
export const isHost = computed(() => {
  const room = activeRoom.value;
  return !!(room && room.ownerId === currentUser.value.id);
});

// 退出房间：清理共享状态（页面跳转由调用方决定）
export const clearActiveRoom = () => {
  const room = activeRoom.value;
  if (room && room.members) {
    room.members = room.members.filter(m => m.id !== currentUser.value.id);
  }
  activeRoom.value = null;
  isAllMutedByHost.value = false;
};
