const fs = require('fs');
const filePath = 'src/pages/index/index.vue';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '<!-- VIEW 2: VOICE ROOM PAGE (核心语音房)          -->\n        <!-- ============================================== -->';
const endMarker = '<!-- ============================================== -->\n        <!-- VIEW 3: PROFILE PAGE (个人游戏资料)           -->';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Markers not found");
  process.exit(1);
}

const newView2 = `${startMarker}
        <section v-if="currentTab === 'room' && activeRoom" class="fixed inset-0 z-[100] bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex flex-col overflow-hidden">
          
          <!-- Decorative Background Blurs -->
          <view class="absolute top-[10%] left-[-20%] w-64 h-64 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none"></view>
          <view class="absolute bottom-[20%] right-[-20%] w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></view>

          <!-- Custom Room AppBar -->
          <view class="shrink-0 relative z-10" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="h-11 flex items-center justify-between px-4">
              <view class="flex items-center gap-2 cursor-pointer active:opacity-70 transition" @click="currentTab = 'lobby'">
                <i class="fa-solid fa-chevron-left text-lg text-white"></i>
                <text class="text-base font-bold text-white">{{ activeRoom.name }}</text>
              </view>
              <button @click="leaveRoomConfirm" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/90 active:bg-rose-500/50 active:text-white transition m-0 p-0 border-none">
                <i class="fa-solid fa-power-off text-sm"></i>
              </button>
            </view>
          </view>

          <!-- Room Meta / Fast Share Row -->
          <view class="flex justify-center mt-1 relative z-10">
            <view class="bg-black/30 rounded-full px-4 py-1 flex items-center gap-3 text-[10px] text-white/70 border border-white/5">
              <text>ID: {{ activeRoom.roomNo }}</text>
              <text class="w-[1px] h-2 bg-white/20"></text>
              <text>在线: {{ activeRoom.members.length }}</text>
              <text class="w-[1px] h-2 bg-white/20"></text>
              <text class="text-emerald-400 flex items-center gap-1"><i class="fa-solid fa-wifi text-[8px]"></i> 18ms</text>
            </view>
          </view>

          <view class="flex justify-center mt-3 relative z-10">
            <view class="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
              <text class="text-[10px] text-indigo-300 font-bold bg-indigo-500/20 px-2 py-0.5 rounded-full">{{ activeRoom.type }}</text>
              <text class="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">{{ activeRoom.tag }}</text>
              <button @click="copyTeamShareText" class="text-[10px] text-white/80 ml-1 flex items-center gap-1 p-0 m-0 bg-transparent border-none">
                <i class="fa-regular fa-copy"></i>
              </button>
            </view>
          </view>

          <!-- Main Scrollable Area -->
          <view class="flex-1 overflow-y-auto relative z-10 pb-[100px] no-scrollbar">
            
            <!-- Seats Area -->
            <view class="mt-6 px-4">
              <!-- Host Seat (Top Center) -->
              <view class="flex justify-center mb-8" v-if="activeRoom.members[0]">
                <view class="relative flex flex-col items-center group" @click="openMemberDetailModal(activeRoom.members[0])">
                  <template v-if="isSeatSpeaking(0)">
                    <view class="voice-ripple w-20 h-20 rounded-full"></view>
                    <view class="voice-ripple voice-ripple--delay w-20 h-20 rounded-full"></view>
                  </template>
                  <view :class="['relative w-20 h-20 rounded-full border-2 overflow-hidden transition shadow-lg', 
                                isSeatSpeaking(0) ? 'voice-glow border-emerald-400' : 'border-amber-400 shadow-amber-500/30']">
                    <image :src="activeRoom.members[0].avatar" class="w-full h-full object-cover" />
                  </view>
                  <view :class="['absolute bottom-9 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md border-2 border-slate-900', 
                                (activeRoom.members[0].micOpen && !isAllMutedByHost) ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-rose-400']">
                    <i :class="(activeRoom.members[0].micOpen && !isAllMutedByHost) ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'"></i>
                  </view>
                  <text class="text-sm font-bold mt-2 text-white drop-shadow-md">{{ activeRoom.members[0].name }}</text>
                  <text class="text-[10px] bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-300 px-2 py-0.5 rounded-full mt-1 border border-amber-500/20 shadow-sm flex items-center gap-1">
                    <i class="fa-solid fa-crown text-[8px]"></i> 房主
                  </text>
                </view>
              </view>

              <!-- Guest Seats Grid (Below Host) -->
              <view class="grid grid-cols-4 gap-y-6 gap-x-2">
                <view v-for="i in (activeRoom.maxNum - 1)" :key="i" class="flex flex-col items-center">
                  <!-- Occupied Guest Seat -->
                  <template v-if="activeRoom.members[i]">
                    <view class="relative flex flex-col items-center group cursor-pointer" @click="openMemberDetailModal(activeRoom.members[i])">
                      <template v-if="isSeatSpeaking(i)">
                        <view class="voice-ripple w-14 h-14 rounded-full"></view>
                        <view class="voice-ripple voice-ripple--delay w-14 h-14 rounded-full"></view>
                      </template>
                      <view :class="['relative w-14 h-14 rounded-full border-2 overflow-hidden transition shadow-md', 
                                    isSeatSpeaking(i) ? 'voice-glow border-emerald-400' : 'border-indigo-400/80 shadow-indigo-500/20']">
                        <image :src="activeRoom.members[i].avatar" class="w-full h-full object-cover" />
                      </view>
                      <view :class="['absolute bottom-7 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] shadow-sm border-2 border-slate-900', 
                                    (activeRoom.members[i].micOpen && !isAllMutedByHost) ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-rose-400']">
                        <i :class="(activeRoom.members[i].micOpen && !isAllMutedByHost) ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'"></i>
                      </view>
                      <text class="text-xs font-medium mt-1.5 text-white truncate max-w-[60px] text-center drop-shadow">{{ activeRoom.members[i].name }}</text>
                      <text class="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full mt-0.5 border border-indigo-500/10 truncate max-w-[60px] text-center block">
                        {{ activeRoom.members[i].position || '队员' }}
                      </text>
                    </view>
                  </template>
                  <!-- Empty Guest Seat -->
                  <template v-else>
                    <view class="flex flex-col items-center">
                      <button @click="copyTeamShareText" class="w-14 h-14 rounded-full border border-dashed border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition m-0 p-0">
                        <i class="fa-solid fa-plus text-sm"></i>
                      </button>
                      <text class="text-[10px] text-white/40 mt-1.5">{{ i }}号麦</text>
                    </view>
                  </template>
                </view>
              </view>
            </view>

            <!-- Chat Area List -->
            <view class="mt-8 px-4 space-y-3 pb-8">
              <view class="bg-black/20 rounded-xl p-2.5 border border-white/5 text-[10px] text-white/60 leading-relaxed">
                平台严打诈骗行为，请广大用户警惕“代打”、“代练”、“收徒”等名义诱骗玩家财产，避免损失！同时欢迎大家积极举报。
              </view>
              <view v-for="(chat, idx) in chatMessages" :key="idx" class="flex flex-col gap-0.5">
                <!-- Chat Bubble -->
                <view class="flex items-start gap-2">
                  <view v-if="!chat.isSystem" class="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-white/10">
                    <!-- Assuming sender matches a member, else placeholder -->
                    <image :src="activeRoom.members.find(m => m && m.name === chat.sender)?.avatar || '/static/default-avatar.png'" class="w-full h-full object-cover" />
                  </view>
                  <view class="bg-white/10 rounded-2xl rounded-tl-sm px-3 py-2 border border-white/5 max-w-[85%] backdrop-blur-md">
                    <view class="flex items-center gap-1.5 mb-0.5">
                      <text class="text-[11px] font-bold text-white/80" :class="chat.isSystem ? 'text-indigo-300' : ''">{{ chat.sender }}</text>
                    </view>
                    <text class="text-xs text-white/90 leading-relaxed">{{ chat.content }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- Bottom Fixed Input Bar -->
          <view class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center gap-3 z-20" :style="{ paddingBottom: `calc(12px + ${safeAreaBottom}px)` }">
            <!-- Big Mic Toggle -->
            <button @click="toggleMyMic" :class="['w-11 h-11 rounded-full flex items-center justify-center text-white m-0 p-0 border-2 shadow-lg transition active:scale-95', currentUser.isMicOn ? 'bg-fuchsia-600 border-fuchsia-400 shadow-fuchsia-500/50' : 'bg-slate-800 border-slate-600 shadow-slate-900/50']">
              <i :class="['text-lg', currentUser.isMicOn ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash']"></i>
            </button>
            
            <!-- Input Box trigger (To show input overlay) -->
            <view class="flex-1 h-10 rounded-full bg-black/40 border border-white/10 px-4 flex items-center gap-2" @click="chatInputFocused = true">
              <i class="fa-solid fa-pen text-[10px] text-white/40"></i>
              <text class="text-xs text-white/50">聊聊吧...</text>
            </view>
            
            <!-- Tools -->
            <button @click="openRoomSettingsModal" class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 active:bg-white/20 transition m-0 p-0 border-none">
              <i class="fa-solid fa-gear text-sm"></i>
            </button>
          </view>
          
          <!-- Input Overlay (When typing) -->
          <view v-if="chatInputFocused" class="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end" @click="chatInputFocused = false">
             <view class="bg-slate-900 w-full p-3 rounded-t-2xl flex items-center gap-2 border-t border-white/10" @click.stop :style="{ paddingBottom: `calc(12px + ${safeAreaBottom}px)` }">
                <input type="text" v-model="chatInputText" @confirm="handleSendChat" confirm-type="send"
                       placeholder="说点什么…" maxlength="60" focus
                       placeholder-class="input-placeholder"
                       class="flex-1 min-w-0 bg-black/30 border border-white/10 rounded-xl px-3 h-10 text-xs text-white transition" />
                <button @click="handleSendChat"
                        class="px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold shrink-0 transition m-0 border-none leading-normal h-10 flex items-center justify-center">
                  <i class="fa-solid fa-paper-plane mr-1.5"></i> 发送
                </button>
             </view>
          </view>
          
        </section>
`;

let result = content.substring(0, startIndex) + newView2 + '\n        ' + content.substring(endIndex);

// Also need to hide the main app navigation bar if currentTab is 'room'
// Find the nav element: <nav class="glass-nav fixed bottom-0 left-0 right-0 z-30 select-none">
result = result.replace(
  '<nav class="glass-nav fixed bottom-0 left-0 right-0 z-30 select-none">',
  '<nav v-show="currentTab !== \'room\'" class="glass-nav fixed bottom-0 left-0 right-0 z-30 select-none">'
);

// And hide the Custom AppBar for the overall page if currentTab is 'room'
result = result.replace(
  '<view class="app-navbar shrink-0 relative z-50" :style="{ paddingTop: statusBarHeight + \'px\' }">',
  '<view v-show="currentTab !== \'room\'" class="app-navbar shrink-0 relative z-50" :style="{ paddingTop: statusBarHeight + \'px\' }">'
);

// Add chatInputFocused ref in script
result = result.replace(
  'const chatInputText = ref(\'\');',
  'const chatInputText = ref(\'\');\nconst chatInputFocused = ref(false);'
);

// Hide the floating "语聊房" entrance when currentTab === 'room'
result = result.replace(
  '<view v-if="activeRoom"',
  '<view v-if="activeRoom && currentTab !== \'room\'"'
);

fs.writeFileSync(filePath, result);
