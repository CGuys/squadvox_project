const fs = require('fs');

const vueFile = '/Users/clao/StudioProjects/SquadVox/squadvox-miniprogram/src/pages/index/index.vue';
let code = fs.readFileSync(vueFile, 'utf-8');

// 1. Import getSig
code = code.replace(
  `import { listRooms, createRoom, enterRoom, closeRoom, kickMember, sendMessage, saveInfo, submitReport, randomProfile } from '@/api/index';`,
  `import { listRooms, createRoom, enterRoom, closeRoom, kickMember, sendMessage, saveInfo, submitReport, randomProfile, getSig } from '@/api/index';`
);

// 2. Add TRTC State variables
const stateVars = `
// ----------------------------------------------------
// TRTC 实时语音核心逻辑
// ----------------------------------------------------
const trtcConfig = ref(null);
const trtcPushUrl = ref('');
const trtcPlayerList = ref([]);

const setupTrtcVoice = async (room) => {
  try {
    const { data } = await getSig();
    trtcConfig.value = data;
    // 构建微信 TRTC 的专用 room:// 协议推流地址
    const pushUrl = \`room://cloud.tencent.com/rtc?sdkappid=\${data.sdkAppId}&roomid=\${room.roomNo}&userid=\${data.userId}&usersig=\${data.userSig}&appscene=audiocall&cloudenv=PRO\`;
    trtcPushUrl.value = pushUrl;
  } catch (err) {
    showToast('TRTC 通道建立失败', 'error');
  }
};

const clearTrtcVoice = () => {
  trtcPushUrl.value = '';
  trtcPlayerList.value = [];
};

const onTrtcStateChange = (e) => {
  console.log('TRTC Pusher State:', e.detail.code, e.detail.message);
  // 当房间有人进出时，1020 是系统通知的特定 code，或者是 pusher 返回的 remote stream 变更
  if (e.detail.code === 1020) {
    // 解析下发的内容来动态更新 playerList 
    //（因涉及到复杂解析，通常用 trtc-wx-sdk 处理，这里放一个钩子证明打通）
  }
};
`;

code = code.replace(`const fetchRooms = async () => {`, stateVars + '\nconst fetchRooms = async () => {');

// 3. Call setupTrtcVoice in executeJoinRoom
code = code.replace(
  `  soundJoinRoom();
  showToast(\`已连入语音房: \${room.name}\`, 'success');`,
  `  soundJoinRoom();
  showToast(\`已连入语音房: \${room.name}\`, 'success');
  setupTrtcVoice(room);`
);

// 4. Call clearTrtcVoice in leaveRoomConfirm
code = code.replace(
  `      activeRoom.value = null;`,
  `      activeRoom.value = null;
      clearTrtcVoice();`
);
code = code.replace(
  `    activeRoom.value = null;
    showToast('房间已解散', 'info');`,
  `    activeRoom.value = null;
    clearTrtcVoice();
    showToast('房间已解散', 'info');`
);

// 5. Add TRTC tags to template
const trtcTags = `
      <!-- TRTC 实时语音原生组件 (仅支持真机) -->
      <view class="fixed -left-[999px] -top-[999px] w-1 h-1 overflow-hidden" v-if="trtcPushUrl">
        <live-pusher
          id="trtc-pusher"
          mode="RTC"
          :url="trtcPushUrl"
          :autopush="true"
          :enable-camera="false"
          :enable-mic="currentUser.isMicOn"
          @statechange="onTrtcStateChange"
        ></live-pusher>
        <live-player
          v-for="p in trtcPlayerList"
          :key="p.id"
          :id="p.id"
          mode="RTC"
          :src="p.url"
          :autoplay="true"
        ></live-player>
      </view>

      <!-- ============================================== -->
      <!-- MODAL SYSTEM (7 大高保真弹窗全集)               -->`;

code = code.replace(
  `      <!-- ============================================== -->
      <!-- MODAL SYSTEM (7 大高保真弹窗全集)               -->`,
  trtcTags
);

fs.writeFileSync(vueFile, code);
console.log('TRTC functionality injected successfully.');
