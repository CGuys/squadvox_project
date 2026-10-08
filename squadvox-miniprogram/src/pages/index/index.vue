<template>
  <view class="app-wrapper bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-0 md:p-6 overflow-x-hidden selection:bg-indigo-500 selection:text-white">

    <!-- Desktop Top Control Bar (适配 PC 浏览器浏览) -->
    <header class="w-full max-w-4xl hidden md:flex items-center justify-between mb-4 px-4 py-2.5 bg-vox-card rounded-2xl border border-vox-border shadow-xl">
      <view class="flex items-center gap-3">
        <view class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center font-black tracking-wider text-slate-950 text-base shadow-md">
          SV
        </view>
        <view>
          <view class="flex items-center gap-2">
            <text class="font-bold text-white text-base tracking-wide">SquadVox 开黑语聊房</text>
            <text class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
              <text class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></text>
              TRTC 引擎已就绪
            </text>
          </view>
          <text class="text-xs text-slate-400">微信小程序 V1.0 正式版 • 完整闭环交互原型</text>
        </view>
      </view>

      <!-- Quick Actions -->
      <view class="flex items-center gap-3">
        <button @click="toggleSoundFx" 
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition m-0 border-none">
          <i class="fa-solid fa-volume-high text-indigo-400"></i>
          <text>交互音效: {{ soundEnabled ? '开' : '关' }}</text>
        </button>

        <button @click="toggleDeviceView" 
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md transition m-0 border-none">
          <i class="fa-solid fa-mobile-screen"></i>
          <text>{{ isFullscreen ? '恢复手机外壳' : '切换全屏模式' }}</text>
        </button>
      </view>
    </header>

    <!-- Mobile Simulator Frame (手机模型框架) -->
    <main :class="['mobile-frame-wrap bg-vox-dark relative flex flex-col overflow-hidden', 
                  isFullscreen ? 'w-full h-screen rounded-none border-0' : 'w-full md:w-[414px] h-[100vh] md:h-[844px] md:rounded-[42px] md:border-[10px] md:border-slate-800 shadow-2xl']">

      <!-- WeChat Capsule & Status Bar Simulation (微信小程序状态栏与胶囊仿真) -->
      <view class="w-full pt-3 pb-2 px-4 flex items-center justify-between z-30 select-none bg-vox-dark/95 border-b border-white/[0.04]">
        <!-- Time & System Icons -->
        <view class="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-300">
          <text>{{ mockTime }}</text>
          <i class="fa-solid fa-signal text-[10px] opacity-80"></i>
          <i class="fa-solid fa-wifi text-[10px] opacity-80"></i>
        </view>

        <!-- Center Title with pulsing dot -->
        <view class="text-xs font-bold tracking-wide text-slate-200 flex items-center gap-1.5">
          <text class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></text>
          <text>{{ currentNavTitle }}</text>
        </view>

        <!-- WeChat Capsule (胶囊按钮) -->
        <view class="flex items-center gap-2.5 bg-black/40 border border-white/10 px-3 py-1 rounded-full text-slate-300 text-xs">
          <view @click="showToast('已唤起小程序原生菜单', 'info')" class="hover:text-white transition cursor-pointer">
            <i class="fa-solid fa-ellipsis"></i>
          </view>
          <text class="w-[1px] h-3 bg-white/20"></text>
          <view @click="showToast('模拟小程序最小化', 'info')" class="hover:text-white transition cursor-pointer">
            <i class="fa-regular fa-circle-dot"></i>
          </view>
        </view>
      </view>

      <!-- Active Floating Audio Bar (切出房间在大厅/资料页常驻的悬浮条) -->
      <view v-if="activeRoom && currentTab !== 'room'"
            class="absolute top-12 left-3 right-3 z-40 bg-gradient-to-r from-indigo-950/95 via-slate-900/95 to-slate-900/95 border border-indigo-500/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between transition-all">
        <view class="flex items-center gap-2.5 cursor-pointer flex-1" @click="switchTab('room')">
          <view class="relative">
            <view class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              <i class="fa-solid fa-headset text-sm"></i>
            </view>
            <text class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping"></text>
          </view>
          <view class="overflow-hidden">
            <view class="flex items-center gap-1.5">
              <text class="text-xs font-bold text-white truncate max-w-[130px]">{{ activeRoom.name }}</text>
              <text class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 shrink-0 font-medium">TRTC 在线</text>
            </view>
            <view class="text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <text class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></text>
              <text>{{ activeRoom.members.length }}人 • 点击返回语音房</text>
            </view>
          </view>
        </view>

        <view class="flex items-center gap-2 shrink-0">
          <button @click.stop="toggleMyMic" title="切换麦克风"
                  :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs transition m-0 border-none', 
                          currentUser.isMicOn ? 'bg-slate-800 text-emerald-400' : 'bg-slate-800 text-rose-400']">
            <i :class="currentUser.isMicOn ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'"></i>
          </button>
          <button @click.stop="leaveRoomConfirm" title="退出房间"
                  class="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 flex items-center justify-center text-xs transition m-0 border-none">
            <i class="fa-solid fa-phone-slash"></i>
          </button>
        </view>
      </view>

      <!-- Viewport Container for Pages (页面视口滚动区域) -->
      <view class="flex-1 overflow-y-auto relative pb-20 no-scrollbar">

        <!-- ============================================== -->
        <!-- VIEW 1: LOBBY PAGE (开黑大厅)                  -->
        <!-- ============================================== -->
        <section v-show="currentTab === 'lobby'" class="p-4 space-y-4">
          <!-- Banner Hero: 极速发车 -->
          <view class="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl">
            <view class="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></view>
            <view class="flex items-start justify-between">
              <view>
                <text class="text-[10px] uppercase font-black tracking-widest text-cyan-400 flex items-center gap-1">
                  <i class="fa-solid fa-bolt"></i> Low Latency TRTC
                </text>
                <view class="text-lg font-black text-white mt-1">SquadVox 极速开黑</view>
                <text class="text-xs text-slate-300 mt-0.5">免加好友 • 低延迟连麦 • 闪电发车</text>
              </view>
              <button @click="openCreateRoomModal"
                      class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 active:scale-95 transition m-0 border-none">
                <i class="fa-solid fa-plus-circle text-sm"></i>
                <text>创建车队</text>
              </button>
            </view>

            <!-- Quick Game Stats Bar -->
            <view class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <view class="flex items-center gap-2">
                <text class="text-slate-400">我的名片:</text>
                <text class="font-semibold text-cyan-300">{{ currentUser.rank || '无双王者 28星' }}</text>
                <text class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{{ currentUser.positions.join(' / ') || '发育路 / 游走' }}</text>
              </view>
              <view @click="switchTab('profile')" class="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 cursor-pointer">
                <text>资料设置</text>
                <i class="fa-solid fa-angle-right text-[10px]"></i>
              </view>
            </view>
          </view>

          <!-- Compliance Mini Alert -->
          <view class="bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2 text-[11px] text-amber-300 flex items-start gap-2">
            <i class="fa-solid fa-circle-exclamation mt-0.5 text-xs text-amber-400 shrink-0"></i>
            <text>合规提示：所有段位数据由玩家自主手动录入，本工具与腾讯官方及《王者荣耀》无关联。</text>
          </view>

          <!-- Filter Controls -->
          <view class="space-y-2">
            <!-- Room Type Filter (2排/3排/5排) -->
            <view class="flex items-center justify-between">
              <view class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <i class="fa-solid fa-gamepad text-indigo-400"></i> 车队模式
              </view>
              <view class="flex gap-1.5 text-xs">
                <view v-for="t in typeOptions" :key="t"
                      @click="setFilter('type', t)"
                      :class="['filter-type-btn px-2.5 py-1 rounded-lg text-xs transition cursor-pointer whitespace-nowrap select-none', 
                              currentFilters.type === t ? 'bg-indigo-600 text-white font-medium' : 'bg-vox-card text-slate-400 border border-vox-border']">
                  {{ t === 'all' ? '全部' : t }}
                </view>
              </view>
            </view>

            <!-- Room Tag Filter (上分/娱乐/练英雄) -->
            <view class="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <view v-for="tg in tagOptions" :key="tg.value"
                    @click="setFilter('tag', tg.value)"
                    :class="['filter-tag-btn px-3 py-1 rounded-full shrink-0 transition cursor-pointer whitespace-nowrap select-none', 
                            currentFilters.tag === tg.value ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium' : 'bg-vox-card text-slate-400 border border-vox-border']">
                {{ tg.label }}
              </view>
            </view>
          </view>

          <!-- Room Cards List -->
          <view class="space-y-3">
            <view v-for="room in filteredRooms" :key="room.id"
                  :class="['glass-card rounded-2xl p-3.5 border transition space-y-2.5', 
                          activeRoom && activeRoom.id === room.id ? 'border-indigo-500 glow-accent' : 'border-vox-border hover:border-slate-600']">
              
              <view class="flex items-start justify-between">
                <view class="flex items-center gap-2.5">
                  <view class="relative">
                    <image :src="room.ownerAvatar" class="w-10 h-10 rounded-xl object-cover border border-white/10" />
                    <text v-if="room.members.some(m => m.isSpeaking)"
                          class="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping"></text>
                  </view>
                  <view>
                    <view class="flex items-center gap-1.5">
                      <text class="font-bold text-white text-xs tracking-wide">{{ room.name }}</text>
                      <i v-if="room.hasPassword" class="fa-solid fa-lock text-[10px] text-amber-400"></i>
                    </view>
                    <view class="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <text>房主: <text class="text-slate-300 font-bold">{{ room.ownerName }}</text></text>
                      <text class="text-slate-600">•</text>
                      <text class="text-indigo-300 font-semibold">{{ room.ownerRank }}</text>
                    </view>
                  </view>
                </view>

                <text :class="['text-[10px] px-2 py-0.5 rounded-md font-semibold', getTagBadgeClass(room.tag)]">
                  {{ room.tag }}
                </text>
              </view>

              <!-- Bottom bar of Card -->
              <view class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <view class="flex items-center gap-2 text-slate-400">
                  <text class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">{{ room.type }}</text>
                  <view class="text-[11px] flex items-center gap-1">
                    <i class="fa-solid fa-users text-[10px]"></i>
                    <text :class="room.members.length >= room.maxNum ? 'text-rose-400' : 'text-emerald-400 font-bold'">{{ room.members.length }}</text> / {{ room.maxNum }} 人
                  </view>
                  <text class="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                    <i class="fa-solid fa-bolt text-[9px]"></i> 19ms
                  </text>
                </view>

                <view>
                  <button v-if="activeRoom && activeRoom.id === room.id"
                          @click="switchTab('room')"
                          class="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition m-0 border-none">
                    当前房间
                  </button>
                  <button v-else
                          @click="requestEnterRoom(room)"
                          :disabled="room.members.length >= room.maxNum"
                          :class="['px-3.5 py-1 rounded-xl text-xs transition m-0 border-none', 
                                  room.members.length >= room.maxNum ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold active:scale-95 shadow-md shadow-indigo-500/20']">
                    {{ room.members.length >= room.maxNum ? '车队已满' : '上车入麦' }}
                  </button>
                </view>
              </view>
            </view>

            <!-- Empty List State -->
            <view v-if="filteredRooms.length === 0" class="text-center py-10 text-slate-500 text-xs">
              <i class="fa-solid fa-gamepad text-2xl mb-2 text-slate-600 block"></i>
              <text>暂无符合筛选条件的开黑房间</text>
              <button @click="openCreateRoomModal" class="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium inline-block m-0 border-none">
                创建第一个车队
              </button>
            </view>
          </view>
        </section>

        <!-- ============================================== -->
        <!-- VIEW 2: VOICE ROOM PAGE (核心语音房)          -->
        <!-- ============================================== -->
        <section v-show="currentTab === 'room'" class="p-4 flex flex-col h-full space-y-3">
          <!-- Room Header Card -->
          <view class="glass-card rounded-2xl p-3.5 space-y-2 border border-vox-border" v-if="activeRoom">
            <view class="flex items-center justify-between">
              <view class="flex items-center gap-2">
                <text class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></text>
                <text class="text-base font-black text-white truncate max-w-[200px]">{{ activeRoom.name }}</text>
                <text class="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold shrink-0">
                  {{ activeRoom.type }} • {{ activeRoom.tag }}
                </text>
              </view>
              <view class="flex items-center gap-1.5 text-xs">
                <text class="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                  <i class="fa-solid fa-wifi text-[10px]"></i> 18ms
                </text>
                <button @click="openRoomSettingsModal" title="房间设置"
                        class="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition m-0 border-none">
                  <i class="fa-solid fa-sliders"></i>
                </button>
              </view>
            </view>

            <!-- Room Meta / Fast Share Row -->
            <view class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
              <view class="flex items-center gap-2">
                <text>房间号: <text class="text-slate-200 font-mono">{{ activeRoom.roomNo }}</text></text>
                <text class="text-slate-600">|</text>
                <text>{{ activeRoom.members.length }} / {{ activeRoom.maxNum }} 人在线</text>
              </view>

              <button @click="copyTeamShareText"
                      class="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-medium bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/50 transition m-0">
                <i class="fa-regular fa-copy"></i>
                <text>复制组队文案</text>
              </button>
            </view>
          </view>

          <!-- OS Background Voice Notice Banner -->
          <view class="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2.5 text-[11px] text-indigo-200 flex items-start gap-2">
            <i class="fa-solid fa-shield-halved text-cyan-400 mt-0.5 shrink-0"></i>
            <view>
              <text class="font-bold text-white">后台语聊保活指南：</text>
              <text>切至游戏时iOS麦克风仅可收听；安卓建议在手机后台锁定本小程序并关闭省电策略。</text>
            </view>
          </view>

          <!-- TRTC Voice Stage (车队麦位区) -->
          <view class="glass-card rounded-2xl p-4 border border-vox-border" v-if="activeRoom">
            <view class="flex items-center justify-between mb-3 text-xs">
              <view class="font-bold text-slate-300 flex items-center gap-1.5">
                <i class="fa-solid fa-users-rays text-indigo-400"></i>
                <text>小队麦位席 (TRTC实时声讯)</text>
              </view>
              <text class="text-[11px] text-slate-400">点击头像可查看资料或管控</text>
            </view>

            <!-- Slots Layout Grid (根据模式动态栅格) -->
            <view :class="getVoiceSlotsGridClass">
              <view v-for="i in activeRoom.maxNum" :key="i" class="flex flex-col items-center justify-center space-y-1.5">
                <!-- Occupied Seat -->
                <template v-if="activeRoom.members[i - 1]">
                  <view class="relative cursor-pointer group" @click="openMemberDetailModal(activeRoom.members[i - 1])">
                    <view :class="['w-12 h-12 rounded-2xl overflow-hidden border-2 transition', 
                                  (activeRoom.members[i - 1].isSpeaking && activeRoom.members[i - 1].micOpen && !isAllMutedByHost) ? 'voice-active border-emerald-400' : (activeRoom.members[i - 1].isHost ? 'border-amber-400/80' : 'border-slate-700')]">
                      <image :src="activeRoom.members[i - 1].avatar" class="w-full h-full object-cover group-hover:scale-105 transition" />
                    </view>

                    <!-- Host Crown or Position Badge -->
                    <text v-if="activeRoom.members[i - 1].isHost"
                          class="absolute -top-2 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-full shadow">房主</text>
                    <text v-else
                          class="absolute -bottom-1 -left-1 bg-indigo-600 text-white text-[9px] font-bold px-1 rounded shadow">
                      {{ (activeRoom.members[i - 1].position || '队员').slice(0, 2) }}
                    </text>

                    <!-- Mic Status -->
                    <view :class="['absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px]', 
                                  (activeRoom.members[i - 1].micOpen && !isAllMutedByHost) ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-rose-400 border border-rose-500/40']">
                      <i :class="(activeRoom.members[i - 1].micOpen && !isAllMutedByHost) ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'"></i>
                    </view>
                  </view>

                  <view class="text-center w-full px-0.5">
                    <text class="text-[11px] font-semibold text-white truncate max-w-[60px] block">
                      {{ activeRoom.members[i - 1].id === currentUser.id ? '我' : activeRoom.members[i - 1].name }}
                    </text>
                    <text class="text-[9px] text-slate-400 truncate block">
                      {{ (activeRoom.members[i - 1].rank || '').split(' ')[0] }}
                    </text>
                  </view>
                </template>

                <!-- Empty Seat -->
                <template v-else>
                  <button @click="copyTeamShareText"
                          class="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 hover:border-indigo-500/80 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-400 transition group m-0">
                    <i class="fa-solid fa-plus text-xs group-hover:scale-110 transition"></i>
                  </button>
                  <view class="text-center">
                    <text class="text-[10px] text-slate-500 font-medium block">空位</text>
                    <text class="text-[9px] text-slate-600 block">邀请</text>
                  </view>
                </template>
              </view>
            </view>

            <!-- Sound Wave Activity Bar Indicator -->
            <view class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <view class="flex items-center gap-2">
                <text class="text-[11px] text-slate-400">当前发言:</text>
                <text class="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  {{ currentSpeaker ? `${currentSpeaker.name} (${currentSpeaker.isHost ? '房主' : currentSpeaker.position})` : '等待队友开麦...' }}
                </text>
              </view>
              <!-- Equalizer Sound Wave -->
              <view class="flex items-end gap-1 h-5 px-2">
                <text class="w-1 bg-emerald-400 rounded-full bar-1"></text>
                <text class="w-1 bg-emerald-400 rounded-full bar-2"></text>
                <text class="w-1 bg-emerald-400 rounded-full bar-3"></text>
                <text class="w-1 bg-emerald-400 rounded-full bar-4"></text>
              </view>
            </view>
          </view>

          <!-- Room Barrage / Chat Area -->
          <view class="glass-card rounded-2xl p-3 flex-1 flex flex-col justify-between border border-vox-border overflow-hidden min-h-[160px]">
            <!-- Chat list -->
            <scroll-view scroll-y class="overflow-y-auto space-y-2 pr-1 text-xs" style="max-height: 140px;">
              <view class="text-[11px] text-slate-500 text-center py-1">
                - 房间已开启微信内容安全审核，严禁广告、代练与侮辱言论 -
              </view>
              <view v-for="(chat, idx) in chatMessages" :key="idx" class="flex items-start gap-1.5 text-slate-300">
                <text v-if="chat.isSystem" class="px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 text-[10px]">系统</text>
                <text v-else class="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[10px]">{{ chat.sender }}</text>
                <text class="text-slate-300">{{ chat.content }}</text>
              </view>
            </scroll-view>

            <!-- Chat Input & Quick Tactical Phrases -->
            <view class="pt-2 border-t border-white/5 space-y-2">
              <!-- Quick Chips -->
              <view class="flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar py-0.5">
                <view v-for="phrase in quickPhrases" :key="phrase"
                      @click="sendQuickChat(phrase)"
                      class="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white shrink-0 transition cursor-pointer active:scale-95 text-xs whitespace-nowrap">
                  {{ phrase }}
                </view>
              </view>

              <!-- Input Bar -->
              <view class="flex items-center gap-2">
                <input type="text" v-model="chatInputText" @confirm="handleSendChat" confirm-type="send"
                       placeholder="发弹幕交流 (前置内容安全拦截)..." maxlength="60"
                       class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
                <button @click="handleSendChat"
                        class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition m-0 border-none leading-normal">
                  发送
                </button>
              </view>
            </view>
          </view>

          <!-- In-Room Voice Control Bar -->
          <view class="glass-card rounded-2xl p-2.5 flex items-center justify-between border border-vox-border mt-auto">
            <view class="flex items-center gap-3">
              <!-- Mic Button -->
              <button @click="toggleMyMic"
                      :class="['flex items-center gap-2 px-3 py-2 rounded-xl border transition m-0 border-none', 
                              currentUser.isMicOn ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30' : 'bg-rose-600/20 text-rose-400 border border-rose-500/40 hover:bg-rose-600/30']">
                <i :class="['text-sm', currentUser.isMicOn ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash']"></i>
                <text class="text-xs font-bold">{{ currentUser.isMicOn ? '已开麦' : '已静音' }}</text>
              </button>

              <!-- Deafen / Speaker Button -->
              <button @click="toggleMySpeaker"
                      class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition m-0 border-none">
                <i :class="['text-xs', currentUser.isSpeakerOn ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark text-rose-400']"></i>
                <text class="text-xs font-medium">{{ currentUser.isSpeakerOn ? '扬声器' : '已静音' }}</text>
              </button>
            </view>

            <!-- Leave Room Button -->
            <button @click="leaveRoomConfirm"
                    class="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition text-xs font-bold m-0 border-none">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              <text>退出</text>
            </button>
          </view>
        </section>

        <!-- ============================================== -->
        <!-- VIEW 3: PROFILE PAGE (个人游戏资料)           -->
        <!-- ============================================== -->
        <section v-show="currentTab === 'profile'" class="p-4 space-y-4">
          <!-- User Wechat Auth Banner -->
          <view class="glass-card rounded-2xl p-4 border border-vox-border flex items-center justify-between">
            <view class="flex items-center gap-3">
              <view class="relative cursor-pointer group" @click="openAvatarModal" title="更换微信头像">
                <image :src="currentUser.avatar" class="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md group-hover:opacity-80 transition" />
                <text class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></text>
                <view class="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white">
                  换头像
                </view>
              </view>
              <view>
                <view class="flex items-center gap-2">
                  <text class="font-bold text-white text-base">{{ currentUser.nickname }}</text>
                  <text class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">微信已授权</text>
                </view>
                <text class="text-xs text-slate-400 font-mono mt-0.5 block">UID: {{ currentUser.id }}</text>
              </view>
            </view>

            <button @click="triggerWechatAuthSwitch"
                    class="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2.5 py-1 rounded bg-slate-800/80 transition m-0 border-none">
              切换微信
            </button>
          </view>

          <!-- Game Profile Edit Card -->
          <view class="glass-card rounded-2xl p-4 space-y-3.5 border border-vox-border">
            <view class="flex items-center justify-between">
              <view class="flex items-center gap-2">
                <i class="fa-solid fa-id-card text-indigo-400"></i>
                <text class="font-bold text-white text-sm">王者专属开黑名片</text>
              </view>
              <text class="text-[10px] text-slate-400">车队成员可见</text>
            </view>

            <!-- Form inputs -->
            <view class="space-y-3 text-xs">
              <!-- Game Region -->
              <view>
                <text class="block text-slate-400 mb-1">游戏大区</text>
                <view class="grid grid-cols-2 gap-2">
                  <button type="button" @click="currentUser.region = '微信区'"
                          :class="['py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition m-0', 
                                  currentUser.region === '微信区' ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300' : 'border-slate-700 bg-slate-900 text-slate-400']">
                    <i class="fa-brands fa-weixin text-emerald-400"></i> 微信区
                  </button>
                  <button type="button" @click="currentUser.region = 'QQ区'"
                          :class="['py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition m-0', 
                                  currentUser.region === 'QQ区' ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-bold' : 'border-slate-700 bg-slate-900 text-slate-400']">
                    <i class="fa-brands fa-qq text-sky-400"></i> QQ区
                  </button>
                </view>
              </view>

              <!-- Server & In-Game ID -->
              <view class="grid grid-cols-2 gap-2">
                <view>
                  <text class="block text-slate-400 mb-1">游戏服务器</text>
                  <input type="text" v-model="currentUser.server"
                         class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                </view>
                <view>
                  <text class="block text-slate-400 mb-1">王者游戏ID</text>
                  <input type="text" v-model="currentUser.gameId"
                         class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                </view>
              </view>

              <!-- Rank Selection -->
              <view>
                <text class="block text-slate-400 mb-1">当前游戏段位</text>
                <picker @change="onRankSelectChange" :value="currentRankIndex" :range="rankList">
                  <view class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white flex justify-between items-center">
                    <text>{{ currentUser.rank }}</text>
                    <i class="fa-solid fa-chevron-down text-slate-500 text-[10px]"></i>
                  </view>
                </picker>
              </view>

              <!-- Main Positions -->
              <view>
                <text class="block text-slate-400 mb-1.5">擅长分路 (至多选两项)</text>
                <view class="grid grid-cols-5 gap-1.5">
                  <button v-for="pos in positionOptions" :key="pos" type="button"
                          @click="togglePosition(pos)"
                          :class="['pos-tag py-1.5 rounded-lg border text-center transition m-0 text-xs', 
                                  currentUser.positions.includes(pos) ? 'border-indigo-500 bg-indigo-600/30 text-indigo-300 font-bold' : 'border-slate-700 bg-slate-900 text-slate-300 font-medium']">
                    {{ pos }}
                  </button>
                </view>
              </view>

              <!-- Save Info Action Button -->
              <button @click="saveUserProfile"
                      class="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 m-0 border-none leading-normal">
                <i class="fa-solid fa-floppy-disk"></i>
                <text>保存个人资料 (/squadvox/api/user/saveInfo)</text>
              </button>
            </view>
          </view>

          <!-- Compliance & Legal Terms Card -->
          <view class="glass-card rounded-2xl p-4 space-y-2 border border-vox-border text-xs">
            <view class="flex items-center justify-between text-slate-300">
              <view class="font-bold flex items-center gap-1.5">
                <i class="fa-solid fa-scale-balanced text-indigo-400"></i> 合规与隐私协议
              </view>
              <text @click="openPrivacyModal" class="text-indigo-400 hover:text-indigo-300 transition cursor-pointer">查看全文</text>
            </view>
            <text class="text-[11px] text-slate-400 leading-relaxed block">
              SquadVox 严格遵守微信小程序运营规范。用户资料均由自主登记，本应用不抓取、不爬取游戏数据，实时语音与文字消息均经过内容安全审查拦截。
            </text>
          </view>

          <!-- Version Meta -->
          <view class="text-center text-[11px] text-slate-500 pt-2">
            SquadVox 开黑语聊房 v1.0.0 (Build 20261008)
          </view>
        </section>

      </view>

      <!-- Bottom Navigation Bar (TabBar) -->
      <nav class="glass-nav absolute bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 z-30 select-none">
        <!-- Tab 1: Lobby -->
        <view @click="switchTab('lobby')"
              :class="['flex flex-col items-center justify-center gap-0.5 px-3 py-1 cursor-pointer transition select-none', 
                      currentTab === 'lobby' ? 'text-indigo-400' : 'text-slate-400']">
          <i class="fa-solid fa-compass text-lg"></i>
          <text :class="['text-[11px] whitespace-nowrap', currentTab === 'lobby' ? 'font-bold' : '']">开黑大厅</text>
        </view>

        <!-- Center Plus Button for Create Room -->
        <view @click="openCreateRoomModal"
              class="-mt-4 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-indigo-500/40 hover:scale-105 active:scale-95 transition cursor-pointer"
              title="创建车队">
          <i class="fa-solid fa-plus text-base font-black"></i>
        </view>

        <!-- Tab 2: Current Room -->
        <view @click="switchTab('room')"
              :class="['flex flex-col items-center justify-center gap-0.5 px-3 py-1 cursor-pointer transition relative select-none', 
                      currentTab === 'room' ? 'text-indigo-400' : 'text-slate-400']">
          <text v-if="activeRoom" class="absolute top-0 right-3 w-2 h-2 rounded-full bg-emerald-400"></text>
          <i class="fa-solid fa-headset text-lg"></i>
          <text :class="['text-[11px] whitespace-nowrap', currentTab === 'room' ? 'font-bold' : '']">语聊房间</text>
        </view>

        <!-- Tab 3: Profile -->
        <view @click="switchTab('profile')"
              :class="['flex flex-col items-center justify-center gap-0.5 px-3 py-1 cursor-pointer transition select-none', 
                      currentTab === 'profile' ? 'text-indigo-400' : 'text-slate-400']">
          <i class="fa-solid fa-user-ninja text-lg"></i>
          <text :class="['text-[11px] whitespace-nowrap', currentTab === 'profile' ? 'font-bold' : '']">游戏资料</text>
        </view>
      </nav>

      <!-- ============================================== -->
      <!-- MODAL SYSTEM (7 大高保真弹窗全集)               -->
      <!-- ============================================== -->

      <!-- MODAL 0: Avatar Selector Dialog -->
      <view v-if="modalVisible.avatarSelect"
            class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <view class="w-full max-w-xs bg-vox-card rounded-2xl border border-vox-border p-5 space-y-4">
          <view class="flex items-center justify-between">
            <text class="font-bold text-white text-sm">选择游戏头像</text>
            <view @click="closeModal('avatarSelect')" class="text-slate-400 hover:text-white cursor-pointer">
              <i class="fa-solid fa-xmark"></i>
            </view>
          </view>
          <text class="text-xs text-slate-400 block">选择您在开黑房间内展示的头像：</text>
          <view class="grid grid-cols-4 gap-2.5">
            <image v-for="(av, idx) in avatarList" :key="idx" :src="av"
                   @click="selectAvatar(av)"
                   class="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 hover:border-indigo-400 cursor-pointer transition active:scale-95" />
          </view>
        </view>
      </view>

      <!-- MODAL 1: Create Room Dialog -->
      <view v-if="modalVisible.createRoom"
            class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
        <view class="w-full max-w-sm bg-vox-card rounded-t-3xl md:rounded-3xl border border-vox-border p-5 space-y-4 shadow-2xl">
          <view class="flex items-center justify-between">
            <view class="flex items-center gap-2">
              <text class="w-2.5 h-2.5 rounded-full bg-cyan-400"></text>
              <text class="font-bold text-white text-base">创建开黑语聊房</text>
            </view>
            <view @click="closeModal('createRoom')" class="text-slate-400 hover:text-white cursor-pointer">
              <i class="fa-solid fa-xmark text-base"></i>
            </view>
          </view>

          <view class="space-y-3 text-xs">
            <view>
              <text class="block text-slate-400 mb-1">车队名称</text>
              <input type="text" v-model="createForm.name" maxlength="20" placeholder="例如: 连胜冲星5排缺打野"
                     class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
            </view>

            <view>
              <text class="block text-slate-400 mb-1">车队类型</text>
              <view class="grid grid-cols-3 gap-2">
                <button v-for="ct in [{t:'5排',n:5},{t:'3排',n:3},{t:'2排',n:2}]" :key="ct.t"
                        type="button" @click="createForm.type = ct.t; createForm.maxNum = ct.n"
                        :class="['create-type-btn py-2 rounded-xl text-center font-bold transition m-0 border-none', 
                                createForm.type === ct.t ? 'bg-indigo-600 text-white border border-indigo-400' : 'bg-slate-900 text-slate-400 border border-slate-700']">
                  {{ ct.t }} ({{ ct.n }}人)
                </button>
              </view>
            </view>

            <view>
              <text class="block text-slate-400 mb-1">房间标签</text>
              <picker @change="onCreateTagChange" :value="createTagIndex" :range="tagOptions" range-key="label">
                <view class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white flex justify-between items-center">
                  <text>{{ createForm.tag }}</text>
                  <i class="fa-solid fa-chevron-down text-slate-500 text-[10px]"></i>
                </view>
              </picker>
            </view>

            <view>
              <view class="flex items-center justify-between mb-1">
                <text class="text-slate-400">房间密码 (选填)</text>
                <text class="text-[10px] text-slate-500">留空则为公开房间</text>
              </view>
              <input type="password" v-model="createForm.password" maxlength="6" placeholder="4-6位数字密码"
                     class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono" />
            </view>

            <button @click="handleCreateRoomSubmit"
                    class="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/30 active:scale-98 transition flex items-center justify-center gap-1.5 m-0 border-none leading-normal">
              <i class="fa-solid fa-microphone-lines"></i>
              <text>即刻开启语音房 (自动就座房主席)</text>
            </button>
          </view>
        </view>
      </view>

      <!-- MODAL 2: Enter Password Prompt -->
      <view v-if="modalVisible.enterPwd"
            class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <view class="w-full max-w-xs bg-vox-card rounded-2xl border border-vox-border p-5 space-y-4 text-center">
          <view class="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl border border-amber-500/30">
            <i class="fa-solid fa-lock"></i>
          </view>
          <view>
            <text class="font-bold text-white text-base block">此车队已加密</text>
            <text class="text-xs text-slate-400 mt-1 block">请输入房主设置的进入密码 (演示默认: 666)</text>
          </view>
          <input type="password" v-model="inputPassword" maxlength="6" placeholder="输入密码"
                 class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-sm" />
          <view class="flex gap-2">
            <button @click="closeModal('enterPwd')" class="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs m-0 border-none">
              取消
            </button>
            <button @click="submitVerifyPassword" class="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs m-0 border-none">
              验证进入
            </button>
          </view>
        </view>
      </view>

      <!-- MODAL 3: Member Detail & Host Actions Modal -->
      <view v-if="modalVisible.memberDetail && selectedMember"
            class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
        <view class="w-full max-w-xs bg-vox-card rounded-t-3xl md:rounded-3xl border border-vox-border p-5 space-y-3">
          <view class="flex items-center justify-between">
            <text class="text-xs text-slate-400">队员详细信息</text>
            <view @click="closeModal('memberDetail')" class="text-slate-400 hover:text-white cursor-pointer">
              <i class="fa-solid fa-xmark"></i>
            </view>
          </view>

          <!-- Member Profile Preview -->
          <view class="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-white/5">
            <image :src="selectedMember.avatar" class="w-12 h-12 rounded-xl object-cover border border-indigo-500/50" />
            <view>
              <view class="flex items-center gap-1.5">
                <text class="font-bold text-white text-sm">{{ selectedMember.name }}</text>
                <text class="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                  {{ selectedMember.isHost ? '房主' : '队员' }}
                </text>
              </view>
              <text class="text-xs text-slate-400 mt-0.5 block">{{ selectedMember.rank }}</text>
            </view>
          </view>

          <view class="text-xs space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-white/5 text-slate-300">
            <view>擅长位置: <text class="text-cyan-300 font-semibold">{{ selectedMember.position || '对抗路 / 打野' }}</text></view>
            <view>游戏大区: <text class="text-slate-200">{{ currentUser.region }}</text></view>
            <view>麦克风状态: <text class="text-emerald-400">{{ selectedMember.micOpen ? '正常讲话中' : '已闭麦' }}</text></view>
          </view>

          <!-- Action Buttons -->
          <view class="pt-2 space-y-2">
            <!-- Host Kick Option -->
            <button v-if="activeRoom && activeRoom.ownerId === currentUser.id && selectedMember.id !== currentUser.id"
                    @click="handleKickMember"
                    class="w-full py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-bold transition m-0">
              <i class="fa-solid fa-user-xmark mr-1"></i> 踢出车队 (房主权限)
            </button>

            <!-- Report Button -->
            <button @click="openReportModal"
                    class="w-full py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 text-xs transition flex items-center justify-center gap-1 m-0 border-none">
              <i class="fa-solid fa-flag"></i> 举报该玩家违规
            </button>
          </view>
        </view>
      </view>

      <!-- MODAL 4: User Report Submission Dialog -->
      <view v-if="modalVisible.report"
            class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <view class="w-full max-w-xs bg-vox-card rounded-2xl border border-vox-border p-5 space-y-3.5 text-xs">
          <view class="flex items-center justify-between">
            <view class="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <text>违规举报提交</text>
            </view>
            <view @click="closeModal('report')" class="text-slate-400 hover:text-white cursor-pointer">
              <i class="fa-solid fa-xmark"></i>
            </view>
          </view>

          <text class="text-slate-400 text-[11px] block">SquadVox 坚决抵制任何侮辱谩骂、低俗违规及代练广告宣传。</text>

          <view>
            <text class="block text-slate-300 mb-1">举报类型</text>
            <picker @change="onReportTypeChange" :value="reportTypeIndex" :range="reportTypes">
              <view class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white flex justify-between items-center">
                <text>{{ reportTypes[reportTypeIndex] }}</text>
                <i class="fa-solid fa-chevron-down text-slate-500 text-[10px]"></i>
              </view>
            </picker>
          </view>

          <view>
            <text class="block text-slate-300 mb-1">详情描述 (选填)</text>
            <textarea v-model="reportDesc" placeholder="补充具体违规发生的时间或言论细节..."
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white placeholder-slate-500 h-16 text-xs"></textarea>
          </view>

          <button @click="submitUserReport"
                  class="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-md m-0 border-none leading-normal">
            提交违规审核存档 (/squadvox/api/report/submit)
          </button>
        </view>
      </view>

      <!-- MODAL 5: Room Settings / Host Controls -->
      <view v-if="modalVisible.roomSettings"
            class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
        <view class="w-full max-w-xs bg-vox-card rounded-t-3xl md:rounded-3xl border border-vox-border p-5 space-y-3.5 text-xs">
          <view class="flex items-center justify-between">
            <text class="font-bold text-white text-sm">房间管控面板</text>
            <view @click="closeModal('roomSettings')" class="text-slate-400 hover:text-white cursor-pointer">
              <i class="fa-solid fa-xmark"></i>
            </view>
          </view>

          <view class="space-y-2">
            <!-- Mute all option -->
            <button @click="toggleMuteAllMembers"
                    class="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-between transition m-0">
              <view class="flex items-center gap-2">
                <i class="fa-solid fa-microphone-slash text-amber-400"></i>
                <text>房主全员静音</text>
              </view>
              <text :class="['text-[10px]', isAllMutedByHost ? 'text-amber-400 font-bold' : 'text-slate-400']">
                {{ isAllMutedByHost ? '开启中 (全员禁麦)' : '关' }}
              </text>
            </button>

            <!-- Audio engine mode info -->
            <view class="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 text-[11px] text-slate-400">
              <view class="flex justify-between">
                <text>TRTC 编码模式:</text>
                <text class="text-cyan-400 font-mono">GameAudio_HighRate</text>
              </view>
              <view class="flex justify-between">
                <text>端到端延时:</text>
                <text class="text-emerald-400 font-mono">18ms ~ 24ms</text>
              </view>
              <view class="flex justify-between">
                <text>回声消除 (AEC):</text>
                <text class="text-emerald-400">已开启</text>
              </view>
            </view>

            <!-- Close room option -->
            <button @click="closeRoomAsHost"
                    class="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 font-bold flex items-center justify-center gap-1.5 transition m-0">
              <i class="fa-solid fa-trash-can"></i>
              <text>解散并关闭房间 (/squadvox/api/room/close)</text>
            </button>
          </view>
        </view>
      </view>

      <!-- MODAL 6: Privacy Terms Compliance Modal -->
      <view v-if="modalVisible.privacy"
            class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <view class="w-full max-w-sm bg-vox-card rounded-2xl border border-vox-border p-5 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
          <text class="font-bold text-white text-base block">SquadVox 用户协议与隐私保护</text>
          <view class="text-slate-300 space-y-2 text-[11px] leading-relaxed">
            <view><text class="font-bold">1. 数据合规承诺：</text>SquadVox 严格作为第三方游戏组队开黑辅助语音工具，不抓取、不逆向、不篡改《王者荣耀》官方任何底层数据。所有用户段位、分路均由用户自主填报。</view>
            <view><text class="font-bold">2. 内容安全审核：</text>平台全量接入微信小程序文本内容安全识别接口及腾讯云 TRTC 语音实时监测。对涉及低俗辱骂、广告营销、违规代练账号予以封禁处置。</view>
            <view><text class="font-bold">3. 实时语音与系统后台：</text>语音功能基于腾讯云实时音视频 TRTC 提供。由于移动端操作系统（如 iOS）后台权限机制，切换到游戏后台时麦克风可能无法持续上行传输，建议使用单向监听或耳机硬件设备。</view>
          </view>
          <button @click="closeModal('privacy')"
                  class="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs mt-2 transition hover:bg-indigo-500 m-0 border-none leading-normal">
            我已知晓并同意
          </button>
        </view>
      </view>

      <!-- TOAST MESSAGE NOTIFICATION -->
      <view v-if="toast.show"
            class="pointer-events-none fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 text-white border border-indigo-500/40 text-xs shadow-2xl flex items-center gap-2 transition-opacity duration-300">
        <i :class="['fa-solid', toast.type === 'error' ? 'fa-circle-xmark text-rose-400' : (toast.type === 'warn' ? 'fa-triangle-exclamation text-amber-400' : 'fa-circle-check text-emerald-400')]"></i>
        <text>{{ toast.message }}</text>
      </view>

    </main>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { listRooms, createRoom, enterRoom, closeRoom, kickMember, sendMessage, saveInfo, submitReport, getSig } from '@/api/index';

// ----------------------------------------------------
// Web Audio API 交互音效发生器 (原型原版移植)
// ----------------------------------------------------
let audioCtx = null;
const soundEnabled = ref(true);

const initAudio = () => {
  if (typeof window !== 'undefined' && !audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
};

const playBeep = (freq = 440, type = 'sine', duration = 0.1) => {
  if (!soundEnabled.value || typeof window === 'undefined') return;
  try {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
};

const soundMicToggle = (open) => {
  if (open) {
    playBeep(587.33, 'triangle', 0.08);
    setTimeout(() => playBeep(880, 'triangle', 0.12), 80);
  } else {
    playBeep(440, 'sine', 0.1);
  }
};

const soundJoinRoom = () => {
  playBeep(523.25, 'sine', 0.08);
  setTimeout(() => playBeep(659.25, 'sine', 0.08), 90);
  setTimeout(() => playBeep(783.99, 'sine', 0.15), 180);
};

const toggleSoundFx = () => {
  soundEnabled.value = !soundEnabled.value;
  showToast(soundEnabled.value ? '已开启交互音效' : '已关闭交互音效', 'info');
};

// ----------------------------------------------------
// 界面显示与时钟仿真
// ----------------------------------------------------
const isFullscreen = ref(false);
const mockTime = ref('20:15');
let clockTimer = null;

const updateMockTime = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  mockTime.value = `${h}:${m}`;
};

const toggleDeviceView = () => {
  isFullscreen.value = !isFullscreen.value;
};

// ----------------------------------------------------
// 精美王者游戏头像列表
// ----------------------------------------------------
const avatarList = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
];

// ----------------------------------------------------
// 当前用户状态 (支持缓存与本地后端联动)
// ----------------------------------------------------
const currentUser = ref({
  id: 88392102,
  nickname: "电竞少年阿策",
  avatar: avatarList[0],
  region: "微信区",
  server: "手Q12区-王者峡谷",
  gameId: "策马踏长空",
  rank: "无双王者 25-49星",
  positions: ["发育路", "游走"],
  isMicOn: true,
  isSpeakerOn: true
});

const positionOptions = ['对抗路', '打野', '中路', '发育路', '游走'];
const rankList = [
  '永恒钻石',
  '至尊星耀',
  '最强王者 1-24星',
  '无双王者 25-49星',
  '荣耀王者 50-99星',
  '传奇王者 100星+'
];
const currentRankIndex = computed(() => {
  const idx = rankList.indexOf(currentUser.value.rank);
  return idx >= 0 ? idx : 3;
});

// ----------------------------------------------------
// Tab 切换状态
// ----------------------------------------------------
const currentTab = ref('lobby'); // 'lobby' | 'room' | 'profile'

const currentNavTitle = computed(() => {
  if (currentTab.value === 'lobby') return 'SquadVox 开黑大厅';
  if (currentTab.value === 'room') return activeRoom.value ? activeRoom.value.name : '语聊房间';
  return '个人游戏名片';
});

const switchTab = (tab) => {
  if (tab === 'room' && !activeRoom.value) {
    showToast('您当前尚未加入车队房间，请先选择车队', 'warn');
    return;
  }
  currentTab.value = tab;
};

// ----------------------------------------------------
// 大厅筛选与数据
// ----------------------------------------------------
const typeOptions = ['all', '5排', '3排', '2排'];
const tagOptions = [
  { label: '全部标签', value: 'all' },
  { label: '🔥 冲分上星', value: '冲分上星' },
  { label: '✨ 欢乐娱乐', value: '欢乐娱乐' },
  { label: '🎯 练新英雄', value: '练新英雄' }
];

const currentFilters = ref({
  type: 'all',
  tag: 'all'
});

const setFilter = (type, val) => {
  currentFilters.value[type] = val;
};

// 模拟完整王者荣耀车队房间数据 (同高保真原型)
const mockRooms = ref([
  {
    id: 1,
    roomNo: 'SV-9921',
    ownerId: 101,
    ownerName: '野区霸王',
    ownerRank: '荣耀王者 68星',
    ownerAvatar: avatarList[1],
    name: '冲星王者5排速推房',
    type: '5排',
    maxNum: 5,
    tag: '冲分上星',
    hasPassword: false,
    password: '',
    members: [
      { id: 101, name: '野区霸王', isHost: true, avatar: avatarList[1], rank: '荣耀王者 68星', position: '打野', isSpeaking: true, micOpen: true },
      { id: 102, name: '瑶妹想混分', isHost: false, avatar: avatarList[2], rank: '至尊星耀 I', position: '游走', isSpeaking: false, micOpen: true },
      { id: 103, name: '通天边路斩', isHost: false, avatar: avatarList[3], rank: '无双王者 32星', position: '对抗路', isSpeaking: false, micOpen: true },
      { id: 104, name: '中路绝不亏兵', isHost: false, avatar: avatarList[4], rank: '最强王者 18星', position: '中路', isSpeaking: false, micOpen: false }
    ]
  },
  {
    id: 2,
    roomNo: 'SV-8832',
    ownerId: 201,
    ownerName: '下饭老黄瓜',
    ownerRank: '至尊星耀 III',
    ownerAvatar: avatarList[5],
    name: '3排娱乐欢乐局，麦克风开聊',
    type: '3排',
    maxNum: 3,
    tag: '欢乐娱乐',
    hasPassword: false,
    password: '',
    members: [
      { id: 201, name: '下饭老黄瓜', isHost: true, avatar: avatarList[5], rank: '至尊星耀 III', position: '中路', isSpeaking: true, micOpen: true },
      { id: 202, name: '草丛三剑客', isHost: false, avatar: avatarList[6], rank: '至尊星耀 IV', position: '游走', isSpeaking: false, micOpen: true }
    ]
  },
  {
    id: 3,
    roomNo: 'SV-7719',
    ownerId: 301,
    ownerName: '国服露娜教学',
    ownerRank: '传奇王者 102星',
    ownerAvatar: avatarList[7],
    name: '高端车队密码房 (私信进)',
    type: '5排',
    maxNum: 5,
    tag: '冲分上星',
    hasPassword: true,
    password: '666',
    members: [
      { id: 301, name: '国服露娜教学', isHost: true, avatar: avatarList[7], rank: '传奇王者 102星', position: '打野', isSpeaking: false, micOpen: true },
      { id: 302, name: '大射手后羿', isHost: false, avatar: avatarList[2], rank: '荣耀王者 70星', position: '发育路', isSpeaking: false, micOpen: true }
    ]
  },
  {
    id: 4,
    roomNo: 'SV-6601',
    ownerId: 401,
    ownerName: '练习生小阿朵',
    ownerRank: '永恒钻石 I',
    ownerAvatar: avatarList[2],
    name: '情侣2排/新英雄熟练度练习',
    type: '2排',
    maxNum: 2,
    tag: '练新英雄',
    hasPassword: false,
    password: '',
    members: [
      { id: 401, name: '练习生小阿朵', isHost: true, avatar: avatarList[2], rank: '永恒钻石 I', position: '对抗路', isSpeaking: true, micOpen: true }
    ]
  },
  {
    id: 5,
    roomNo: 'SV-5520',
    ownerId: 501,
    ownerName: '巅峰赛狙击手',
    ownerRank: '荣耀王者 55星',
    ownerAvatar: avatarList[3],
    name: '微信区5排来个抗压肉边',
    type: '5排',
    maxNum: 5,
    tag: '冲分上星',
    hasPassword: false,
    password: '',
    members: [
      { id: 501, name: '巅峰赛狙击手', isHost: true, avatar: avatarList[3], rank: '荣耀王者 55星', position: '打野', isSpeaking: false, micOpen: true },
      { id: 502, name: '不知火舞本火', isHost: false, avatar: avatarList[4], rank: '无双王者 39星', position: '中路', isSpeaking: false, micOpen: true },
      { id: 503, name: '孙尚香暴击流', isHost: false, avatar: avatarList[0], rank: '荣耀王者 61星', position: '发育路', isSpeaking: true, micOpen: true }
    ]
  }
]);

const filteredRooms = computed(() => {
  return mockRooms.value.filter(room => {
    const matchType = currentFilters.value.type === 'all' || room.type === currentFilters.value.type;
    const matchTag = currentFilters.value.tag === 'all' || room.tag === currentFilters.value.tag;
    return matchType && matchTag;
  });
});

const getTagBadgeClass = (tag) => {
  if (tag === '冲分上星') return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
  if (tag === '欢乐娱乐') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
  return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
};

// ----------------------------------------------------
// 核心语聊房间状态
// ----------------------------------------------------
const activeRoom = ref(null);
const pendingPasswordRoom = ref(null);
const inputPassword = ref('');
const isAllMutedByHost = ref(false);

const getVoiceSlotsGridClass = computed(() => {
  if (!activeRoom.value) return 'grid grid-cols-5 gap-2';
  const total = activeRoom.value.maxNum;
  if (total === 2) return 'grid grid-cols-2 gap-4 max-w-[200px] mx-auto';
  if (total === 3) return 'grid grid-cols-3 gap-3 max-w-[260px] mx-auto';
  return 'grid grid-cols-5 gap-2';
});

const currentSpeaker = computed(() => {
  if (!activeRoom.value) return null;
  return activeRoom.value.members.find(m => m.isSpeaking && m.micOpen && !isAllMutedByHost.value);
});

// 房间弹幕聊天
const chatMessages = ref([
  { isSystem: true, sender: '系统', content: '欢迎进入 SquadVox，开麦畅爽沟通！' }
]);
const chatInputText = ref('');
const quickPhrases = ['我打野带飞', '缺个硬辅开团', '稳住后期接团', '测试麦克风'];

const sendQuickChat = (phrase) => {
  chatInputText.value = phrase;
  handleSendChat();
};

const handleSendChat = async () => {
  if (!chatInputText.value.trim() || !activeRoom.value) return;
  const content = chatInputText.value.trim();
  chatInputText.value = '';

  chatMessages.value.push({
    isSystem: false,
    sender: currentUser.value.nickname,
    content: content
  });
  playBeep(600, 'sine', 0.05);

  // 同步通知后端 API (若服务在线)
  try {
    await sendMessage({ room_no: activeRoom.value.roomNo, content });
  } catch (e) {
    // 忽略异常，保持本地流畅体验
  }
};

// 进入房间
const requestEnterRoom = (room) => {
  if (room.members.length >= room.maxNum) {
    showToast('车队人员已满，无法加入', 'warn');
    return;
  }
  if (room.hasPassword) {
    pendingPasswordRoom.value = room;
    inputPassword.value = '';
    openModal('enterPwd');
    return;
  }
  executeJoinRoom(room);
};

const submitVerifyPassword = () => {
  if (!pendingPasswordRoom.value) return;
  if (inputPassword.value === pendingPasswordRoom.value.password || inputPassword.value === '666') {
    closeModal('enterPwd');
    executeJoinRoom(pendingPasswordRoom.value);
    pendingPasswordRoom.value = null;
  } else {
    showToast('密码校验失败，请重新输入', 'error');
  }
};

const executeJoinRoom = (room) => {
  if (activeRoom.value && activeRoom.value.id !== room.id) {
    activeRoom.value.members = activeRoom.value.members.filter(m => m.id !== currentUser.value.id);
  }

  activeRoom.value = room;

  const alreadyIn = room.members.some(m => m.id === currentUser.value.id);
  if (!alreadyIn) {
    room.members.push({
      id: currentUser.value.id,
      name: currentUser.value.nickname,
      isHost: false,
      avatar: currentUser.value.avatar,
      rank: currentUser.value.rank,
      position: currentUser.value.positions[0] || '发育路',
      isSpeaking: false,
      micOpen: currentUser.value.isMicOn
    });
  }

  soundJoinRoom();
  showToast(`已连入语音房: ${room.name}`, 'success');

  chatMessages.value.push({
    isSystem: true,
    sender: '系统',
    content: `你已加入房间，TRTC实时语音通道建立成功 (延时: 18ms)`
  });

  switchTab('room');
};

const leaveRoomConfirm = () => {
  if (!activeRoom.value) return;
  const roomTitle = activeRoom.value.name;
  activeRoom.value.members = activeRoom.value.members.filter(m => m.id !== currentUser.value.id);
  activeRoom.value = null;
  showToast(`已退出房间: ${roomTitle}`, 'info');
  switchTab('lobby');
};

// 麦克风与扬声器切换
const toggleMyMic = () => {
  currentUser.value.isMicOn = !currentUser.value.isMicOn;
  soundMicToggle(currentUser.value.isMicOn);

  if (activeRoom.value) {
    const mySlot = activeRoom.value.members.find(m => m.id === currentUser.value.id);
    if (mySlot) mySlot.micOpen = currentUser.value.isMicOn;
  }

  if (currentUser.value.isMicOn) {
    showToast('麦克风已开启 (TRTC语音上行中)', 'success');
  } else {
    showToast('麦克风已闭麦', 'info');
  }
};

const toggleMySpeaker = () => {
  currentUser.value.isSpeakerOn = !currentUser.value.isSpeakerOn;
  playBeep(400, 'sine', 0.08);
  if (currentUser.value.isSpeakerOn) {
    showToast('已开启队友语音收听', 'info');
  } else {
    showToast('已关闭全员语音接收', 'warn');
  }
};

// 复制组队文案
const copyTeamShareText = () => {
  if (!activeRoom.value) return;
  const pwdInfo = activeRoom.value.hasPassword ? `（房间密码：${activeRoom.value.password}）` : '（公开直连）';
  const shareStr = `【SquadVox 车队邀约】\n房间名：${activeRoom.value.name}\n房间号：${activeRoom.value.roomNo} ${pwdInfo}\n模式：王者荣耀 ${activeRoom.value.type}（${activeRoom.value.tag}）\n已有 ${activeRoom.value.members.length}/${activeRoom.value.maxNum} 人，速来开黑连麦！\n微信小程序搜索 "SquadVox" 输入房间号即刻进房！`;

  uni.setClipboardData({
    data: shareStr,
    showToast: false,
    success: () => {
      showToast('组队文案已复制，可直接发微信群邀请好友！', 'success');
    },
    fail: () => {
      showToast('复制失败，请手动重试', 'warn');
    }
  });
};

// ----------------------------------------------------
// 弹窗状态管理
// ----------------------------------------------------
const modalVisible = ref({
  avatarSelect: false,
  createRoom: false,
  enterPwd: false,
  memberDetail: false,
  report: false,
  roomSettings: false,
  privacy: false
});

const openModal = (name) => {
  modalVisible.value[name] = true;
};

const closeModal = (name) => {
  modalVisible.value[name] = false;
};

// 创建房间表单
const createForm = ref({
  name: '来个硬辅直接发车',
  type: '5排',
  maxNum: 5,
  tag: '冲分上星',
  password: ''
});

const createTagIndex = computed(() => {
  const idx = tagOptions.findIndex(t => t.value === createForm.value.tag);
  return idx >= 0 ? idx : 1;
});

const onCreateTagChange = (e) => {
  createForm.value.tag = tagOptions[e.detail.value].value;
};

const openCreateRoomModal = () => {
  openModal('createRoom');
};

const handleCreateRoomSubmit = async () => {
  const newRoom = {
    id: Date.now(),
    roomNo: 'SV-' + Math.floor(1000 + Math.random() * 9000),
    ownerId: currentUser.value.id,
    ownerName: currentUser.value.nickname,
    ownerRank: currentUser.value.rank,
    ownerAvatar: currentUser.value.avatar,
    name: createForm.value.name.trim() || '我的王者开黑车队',
    type: createForm.value.type,
    maxNum: createForm.value.maxNum,
    tag: createForm.value.tag,
    hasPassword: !!createForm.value.password.trim(),
    password: createForm.value.password.trim(),
    members: [
      {
        id: currentUser.value.id,
        name: currentUser.value.nickname,
        isHost: true,
        avatar: currentUser.value.avatar,
        rank: currentUser.value.rank,
        position: currentUser.value.positions[0] || '打野',
        isSpeaking: true,
        micOpen: currentUser.value.isMicOn
      }
    ]
  };

  mockRooms.value.unshift(newRoom);
  closeModal('createRoom');

  // 同步请求本地 API (若服务在线)
  try {
    await createRoom({
      room_name: newRoom.name,
      room_type: newRoom.type,
      tag: newRoom.tag,
      max_num: newRoom.maxNum,
      room_pwd: newRoom.password
    });
  } catch (e) {
    // 忽略异常
  }

  executeJoinRoom(newRoom);
};

// 头像选择
const openAvatarModal = () => {
  openModal('avatarSelect');
};

const selectAvatar = (av) => {
  currentUser.value.avatar = av;
  closeModal('avatarSelect');
  showToast('已更新游戏展示头像', 'success');
};

// 成员详情与管控
const selectedMember = ref(null);

const openMemberDetailModal = (member) => {
  selectedMember.value = member;
  openModal('memberDetail');
};

const handleKickMember = () => {
  if (!activeRoom.value || !selectedMember.value) return;
  const target = selectedMember.value;
  activeRoom.value.members = activeRoom.value.members.filter(m => m.id !== target.id);
  closeModal('memberDetail');
  chatMessages.value.push({
    isSystem: true,
    sender: '系统',
    content: `房主已将 [${target.name}] 移出房间`
  });
  showToast(`已踢出队员: ${target.name}`, 'info');
};

// 举报弹窗
const reportTypes = ['语音辱骂 / 恶意人身攻击', '代练广告 / 违规引流', '消极挂机 / 破坏游戏体验', '涉黄低俗 / 不良言论'];
const reportTypeIndex = ref(0);
const reportDesc = ref('');

const onReportTypeChange = (e) => {
  reportTypeIndex.value = e.detail.value;
};

const openReportModal = () => {
  closeModal('memberDetail');
  openModal('report');
};

const submitUserReport = async () => {
  const type = reportTypes[reportTypeIndex.value];
  closeModal('report');
  showToast('举报已提交至腾讯云安全与平台客服审核备案', 'success');
  chatMessages.value.push({
    isSystem: true,
    sender: '系统',
    content: `已成功对违规行为发起举报 (${type})`
  });

  try {
    await submitReport({
      room_no: activeRoom.value ? activeRoom.value.roomNo : '',
      target_user_id: selectedMember.value ? selectedMember.value.id : 0,
      report_type: type,
      desc: reportDesc.value
    });
  } catch (e) {}
};

// 房间设置管控
const openRoomSettingsModal = () => {
  openModal('roomSettings');
};

const toggleMuteAllMembers = () => {
  isAllMutedByHost.value = !isAllMutedByHost.value;
  if (isAllMutedByHost.value) {
    chatMessages.value.push({ isSystem: true, sender: '系统', content: '房主开启了全员静音模式' });
    showToast('已设置全员禁麦', 'warn');
  } else {
    chatMessages.value.push({ isSystem: true, sender: '系统', content: '房主解除了全员静音' });
    showToast('已恢复自由麦克风', 'success');
  }
};

const closeRoomAsHost = async () => {
  if (!activeRoom.value) return;
  const rId = activeRoom.value.id;
  closeModal('roomSettings');
  mockRooms.value = mockRooms.value.filter(r => r.id !== rId);
  activeRoom.value = null;
  showToast('房间已解散，释放 TRTC 资源与服务器缓存', 'info');
  switchTab('lobby');
};

// 隐私合规协议
const openPrivacyModal = () => {
  openModal('privacy');
};

// 个人资料修改与保存
const onRankSelectChange = (e) => {
  currentUser.value.rank = rankList[e.detail.value];
};

const togglePosition = (pos) => {
  const current = currentUser.value.positions;
  if (current.includes(pos)) {
    currentUser.value.positions = current.filter(p => p !== pos);
  } else {
    if (current.length >= 2) {
      showToast('擅长分路最多可勾选两项', 'warn');
      return;
    }
    currentUser.value.positions.push(pos);
  }
};

const saveUserProfile = async () => {
  uni.setStorageSync('userInfo', currentUser.value);
  showToast('个人开黑名片已保存成功！', 'success');

  try {
    await saveInfo({
      game_area: currentUser.value.region,
      game_server: currentUser.value.server,
      game_id: currentUser.value.gameId,
      rank: currentUser.value.rank,
      position: currentUser.value.positions.join('/')
    });
  } catch (e) {}
};

const triggerWechatAuthSwitch = () => {
  showToast('已切换至当前微信授权身份', 'info');
};

// ----------------------------------------------------
// Toast 提示框
// ----------------------------------------------------
const toast = ref({
  show: false,
  message: '',
  type: 'success'
});
let toastTimer = null;

const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { show: true, message, type };
  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 2200);
};

// ----------------------------------------------------
// 麦位发言模拟动效定时器
// ----------------------------------------------------
let simulateSpeakingTimer = null;

onMounted(() => {
  updateMockTime();
  clockTimer = setInterval(updateMockTime, 30000);

  // 加载缓存
  const cachedUser = uni.getStorageSync('userInfo');
  if (cachedUser && cachedUser.nickname) {
    currentUser.value = { ...currentUser.value, ...cachedUser };
  }

  // 模拟麦位活跃声浪
  simulateSpeakingTimer = setInterval(() => {
    if (activeRoom.value && !isAllMutedByHost.value) {
      const candidates = activeRoom.value.members.filter(m => m.micOpen);
      if (candidates.length > 0) {
        activeRoom.value.members.forEach(m => m.isSpeaking = false);
        const lucky = candidates[Math.floor(Math.random() * candidates.length)];
        lucky.isSpeaking = true;
      }
    }
  }, 3000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (simulateSpeakingTimer) clearInterval(simulateSpeakingTimer);
});
</script>

<style scoped>
button::after {
  border: none;
}
</style>
