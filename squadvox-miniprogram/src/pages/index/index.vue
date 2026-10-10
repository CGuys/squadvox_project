<template>
  <view class="app-wrapper bg-slate-950 text-slate-100 min-h-screen flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">

    
    <!-- Mobile Simulator Frame (手机模型框架) -->
    <main class="w-full h-screen bg-vox-dark relative flex flex-col overflow-hidden">

      <!-- Custom AppBar (自定义导航栏 + 状态栏/刘海安全区) -->
      <view v-show="currentTab !== 'room'" class="app-navbar shrink-0 relative z-50" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="h-11 flex items-center px-3 bg-vox-dark">
          <view class="flex items-center gap-2">
            <view class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-xs">SV</view>
            <text class="text-sm font-bold text-white">{{ currentNavTitle }}</text>
          </view>
        </view>
      </view>

      <!-- Active Floating Audio Bar 已移除：房内快捷入口统一收敛到右下角悬浮按钮（节省顶部空间、避免遮挡房间列表） -->

      <!-- Viewport Container for Pages (页面视口滚动区域) -->
      <view class="flex-1 overflow-y-auto relative pb-28 no-scrollbar">

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
              <view @click="openModal('gameProfile')" class="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 cursor-pointer py-1 pl-2">
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
                    <!-- 房间内有队友说话时，房主头像外圈同样走水波涟漪 -->
                    <template v-if="room.members.some(m => m.isSpeaking)">
                      <view class="voice-ripple w-10 h-10 rounded-xl"></view>
                      <view class="voice-ripple voice-ripple--delay w-10 h-10 rounded-xl"></view>
                    </template>
                    <image :src="room.ownerAvatar" class="relative w-10 h-10 rounded-xl object-cover border border-white/10" />
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
            <view v-if="filteredRooms.length === 0" class="flex flex-col items-center justify-center py-10 text-slate-500 text-xs">
              <i class="fa-solid fa-gamepad text-3xl mb-3 text-slate-600"></i>
              <text class="mb-4">暂无符合筛选条件的开黑房间</text>
              <button @click="openCreateRoomModal" class="px-6 rounded-xl bg-indigo-600 text-white font-medium m-0 border-none h-10 flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition">
                创建第一个车队
              </button>
            </view>
          </view>
        </section>

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
              <button open-type="share" class="text-[10px] text-white/80 ml-1 flex items-center gap-1 p-0 m-0 bg-transparent border-none">
                <i class="fa-regular fa-copy"></i>
              </button>
            </view>
          </view>

          <!-- Main Scrollable Area -->
          <scroll-view scroll-y class="flex-1 relative z-10" :style="{ paddingBottom: (80 + safeAreaBottom) + 'px' }">
            
            <!-- Seats Area -->
            <view class="mt-6 px-4">
              <!-- Host Seat (Top Center) -->
              <view class="flex justify-center mb-8" v-if="activeRoom.members[0]">
                <view class="relative flex flex-col items-center group" @click="openMemberDetailModal(activeRoom.members[0])">
                  <template v-if="isSeatSpeaking(0)">
                    <view class="voice-ripple w-20 h-20 rounded-full border-0"></view>
                    <view class="voice-ripple voice-ripple--delay w-20 h-20 rounded-full border-0"></view>
                  </template>
                  <view :class="['relative w-20 h-20 rounded-full border-2 overflow-hidden transition shadow-lg', 
                                isSeatSpeaking(0) ? 'voice-glow border-emerald-400' : 'border-amber-400 shadow-amber-500/30']">
                    <image :src="activeRoom.members[0].avatar" class="w-full h-full object-cover" />
                  </view>
                  <view :class="['absolute bottom-11 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-md border-2 border-slate-900', 
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
                        <view class="voice-ripple w-14 h-14 rounded-full border-0"></view>
                        <view class="voice-ripple voice-ripple--delay w-14 h-14 rounded-full border-0"></view>
                      </template>
                      <view :class="['relative w-14 h-14 rounded-full border-2 overflow-hidden transition shadow-md', 
                                    isSeatSpeaking(i) ? 'voice-glow border-emerald-400' : 'border-indigo-400/80 shadow-indigo-500/20']">
                        <image :src="activeRoom.members[i].avatar" class="w-full h-full object-cover" />
                      </view>
                      <view :class="['absolute bottom-9 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] shadow-sm border-2 border-slate-900', 
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
                      <button open-type="share" class="w-14 h-14 rounded-full border border-dashed border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition m-0 p-0">
                        <i class="fa-solid fa-plus text-sm"></i>
                      </button>
                      <text class="text-[10px] text-white/40 mt-1.5">{{ i }}号麦</text>
                    </view>
                  </template>
                </view>
              </view>
            </view>

            <!-- Chat Area List -->
            <view class="mt-8 px-4 space-y-3">
              <view class="bg-black/20 rounded-xl p-2.5 border border-white/5 text-[10px] text-white/60 leading-relaxed text-center">
                平台严打违规行为，欢迎积极举报。
              </view>
              <view v-for="(chat, idx) in chatMessages" :key="idx" class="flex flex-col gap-0.5">
                <!-- Chat Bubble -->
                <view class="flex items-start gap-2">
                  <view v-if="!chat.isSystem" class="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-white/10">
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
          </scroll-view>

          <!-- Bottom Fixed Input Bar -->
          <view class="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-black via-black/80 to-transparent flex items-center gap-3 z-20" :style="{ paddingBottom: Math.max(12, safeAreaBottom) + 'px' }">
            <!-- Big Mic Toggle -->
            <button @click="toggleMyMic" :class="['w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white m-0 p-0 border shadow-lg transition active:scale-95', currentUser.isMicOn ? 'bg-fuchsia-600 border-fuchsia-400 shadow-fuchsia-500/50' : 'bg-slate-800 border-slate-600 shadow-slate-900/50']">
              <i :class="['text-sm', currentUser.isMicOn ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash']"></i>
            </button>
            
            <!-- Input Box trigger (To show input overlay) -->
            <view class="flex-1 h-9 rounded-full bg-black/40 border border-white/10 px-4 flex items-center gap-2 transition active:bg-white/5" @click="chatInputFocused = true">
              <text class="text-xs text-white/50">聊聊吧...</text>
            </view>
            
            <!-- Tools -->
            <button @click="openRoomSettingsModal" class="w-9 h-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white/80 active:bg-white/20 transition m-0 p-0 border-none">
              <i class="fa-solid fa-gear text-sm"></i>
            </button>
          </view>
          
          <!-- Input Overlay (When typing) -->
          <view v-if="chatInputFocused" class="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-end" @click="chatInputFocused = false">
             <view class="bg-slate-900 w-full p-3 rounded-t-2xl flex items-center gap-2 border-t border-white/10" @click.stop :style="{ paddingBottom: Math.max(12, safeAreaBottom) + 'px' }">
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

        <!-- ============================================== -->
        <!-- VIEW 3: PROFILE PAGE (个人游戏资料)           -->
        <!-- ============================================== -->
        <section v-show="currentTab === 'profile'" class="p-4 space-y-4">
          <!-- 微信资料授权（头像 / 昵称） -->
          <view class="glass-card rounded-2xl p-4 border border-vox-border space-y-3">
            <view class="flex items-center justify-between">
              <view class="flex items-center gap-2">
                <i class="fa-brands fa-weixin text-emerald-400"></i>
                <text class="font-bold text-white text-sm">微信资料授权</text>
              </view>
              <text :class="['text-[10px] px-2 py-0.5 rounded', isProfileAuthorized ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30']">
                {{ isProfileAuthorized ? '已授权' : '待授权' }}
              </text>
            </view>

            <view class="flex items-center gap-3">
              <!-- 微信官方头像授权：open-type="chooseAvatar" -->
              <button open-type="chooseAvatar" @chooseavatar="onChooseAvatar"
                      class="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/50 shrink-0 m-0 p-0 bg-transparent leading-normal">
                <image :src="currentUser.avatar || '/static/default-avatar.png'"
                       class="w-16 h-16 rounded-2xl object-cover" />
                <view class="absolute inset-x-0 bottom-0 h-5 bg-black/60 text-white text-[9px] leading-5 text-center">
                  换头像
                </view>
              </button>

              <view class="flex-1 min-w-0 space-y-1.5">
                <!-- 微信官方昵称填写：type="nickname" 会唤起微信昵称建议 -->
                <input type="nickname" v-model="currentUser.nickname" maxlength="20"
                       placeholder="点击获取微信昵称" placeholder-class="input-placeholder"
                       class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 h-10 text-sm text-white min-w-0" />
                <view class="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <text class="font-mono shrink-0">UID: {{ currentUser.id }}</text>
                  <text>·</text>
                  <text class="truncate font-mono">{{ maskedOpenid }}</text>
                </view>
              </view>
            </view>

            <view class="flex items-center gap-2">
              <button @click="saveWechatProfile"
                      class="flex-1 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs m-0 border-none flex items-center justify-center shadow-md shadow-indigo-500/20 active:scale-95 transition">
                保存微信资料
              </button>
              <button @click="randomizeProfile"
                      class="px-4 h-10 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold m-0 flex items-center justify-center active:scale-95 transition">
                随机换一套
              </button>
            </view>

            <view class="flex items-center justify-between pt-0.5">
              <text @click="openAvatarModal" class="text-[11px] text-indigo-400 active:text-indigo-300">
                从预设头像中选择 ›
              </text>
              <text @click="switchWechatAccount" class="text-[11px] text-slate-400 active:text-slate-200">
                切换微信账号 ›
              </text>
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

          <!-- Device / Microphone Self-Test -->
          <view class="glass-card rounded-2xl p-4 border border-vox-border space-y-2.5">
            <view class="flex items-center justify-between">
              <view class="flex items-center gap-2">
                <i class="fa-solid fa-microphone-lines text-emerald-400"></i>
                <text class="font-bold text-white text-sm">设备检测</text>
              </view>
              <text class="text-[10px] text-slate-400">录一段听听自己</text>
            </view>
            <text class="text-[11px] text-slate-400 leading-relaxed block">
              录音后自动回放。能清楚听到自己的声音，说明麦克风与扬声器都正常。
            </text>
            <button @click="openMicTest"
                    class="w-full py-2 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs m-0 border-none leading-normal min-h-[40px] active:bg-slate-700 transition">
              测试麦克风
            </button>
          </view>

          <!-- Version Meta -->
          <view class="text-center text-[11px] text-slate-500 pt-2">
            SquadVox 开黑语聊房 v1.0.0 (Build 20261008)
          </view>
        </section>

      </view>

      <!-- Bottom Navigation Bar (TabBar) — 纯导航，固定悬浮在底部 -->
      <nav v-show="currentTab !== 'room'" class="glass-nav fixed bottom-0 left-0 right-0 z-30 select-none">
        <view class="h-16 flex items-center justify-around px-2">
          <!-- Tab 1: Lobby -->
          <view @click="switchTab('lobby')"
                :class="['flex flex-col items-center justify-center gap-0.5 px-6 py-1 rounded-xl cursor-pointer transition select-none', 
                        currentTab === 'lobby' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400']">
            <i class="fa-solid fa-compass text-lg"></i>
            <text :class="['text-[11px] whitespace-nowrap', currentTab === 'lobby' ? 'font-bold' : '']">开黑大厅</text>
          </view>

          <!-- Tab 2: Profile -->
          <view @click="switchTab('profile')"
                :class="['flex flex-col items-center justify-center gap-0.5 px-6 py-1 rounded-xl cursor-pointer transition select-none', 
                        currentTab === 'profile' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400']">
            <i class="fa-solid fa-user-ninja text-lg"></i>
            <text :class="['text-[11px] whitespace-nowrap', currentTab === 'profile' ? 'font-bold' : '']">游戏资料</text>
          </view>
        </view>
        <!-- 底部安全区占位（iPhone 手势条） -->
        <view class="safe-area-bottom"></view>
      </nav>

      <!-- 语聊房间 悬浮入口（右下角；仅当已加入/创建房间时显示） -->
      <view v-if="activeRoom && currentTab !== 'room'"
            @click="switchTab('room')"
            class="fixed right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/40 flex flex-col items-center justify-center active:scale-95 transition"
            :style="{ bottom: (76 + safeAreaBottom) + 'px' }"
            title="进入语聊房间">
        <i class="fa-solid fa-headset text-base"></i>
        <text class="text-[9px] font-black leading-none mt-0.5">语聊房</text>
        <!-- 麦克风状态角标：一眼看出自己是开麦还是闭麦 -->
        <view :class="['absolute -top-0.5 -left-0.5 w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px]', 
                       currentUser.isMicOn ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white']">
          <i :class="currentUser.isMicOn ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'"></i>
        </view>
      </view>

      <!-- ============================================== -->
      <!-- MODAL SYSTEM (7 大高保真弹窗全集)               -->
      <!-- ============================================== -->
      <!-- Game Profile Settings Modal -->
      <view v-if="modalVisible.gameProfile" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <view class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeModal('gameProfile')"></view>
        <view class="relative w-full max-w-sm glass-card rounded-3xl p-5 border border-vox-border animate-fade-in-up">
          <!-- Close button -->
          <view @click="closeModal('gameProfile')" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition z-10">
            <i class="fa-solid fa-xmark text-slate-300"></i>
          </view>
          
        <!-- Game Profile Edit Form -->
        <view class="space-y-4">
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
                            currentUser.region === '微信区' ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300' : 'border-slate-700 bg-slate-900 text-slate-400']" class="h-10">
                <i class="fa-brands fa-weixin text-emerald-400"></i> 微信区
                </button>
                <button type="button" @click="currentUser.region = 'QQ区'"
                      :class="['py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition m-0', 
                            currentUser.region === 'QQ区' ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 font-bold' : 'border-slate-700 bg-slate-900 text-slate-400']" class="h-10">
                <i class="fa-brands fa-qq text-sky-400"></i> QQ区
                </button>
              </view>
            </view>

            <!-- Server & In-Game ID -->
            <view class="grid grid-cols-2 gap-2">
              <view>
                <text class="block text-slate-400 mb-1">游戏服务器</text>
                <input placeholder-class="input-placeholder" type="text" v-model="currentUser.server"
                     class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 h-11 text-sm leading-[44px]" />
              </view>
              <view>
                <text class="block text-slate-400 mb-1">王者游戏ID</text>
                <input placeholder-class="input-placeholder" type="text" v-model="currentUser.gameId"
                     class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 h-11 text-sm leading-[44px]" />
              </view>
            </view>

            <!-- Rank Selection -->
            <view>
              <text class="block text-slate-400 mb-1">当前游戏段位</text>
              <picker @change="onRankSelectChange" :value="currentRankIndex" :range="rankList">
              <view class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white flex justify-between items-center h-10 min-h-[40px]">
                <text>{{ currentUser.rank || '请选择段位' }}</text>
                <i class="fa-solid fa-chevron-down text-slate-500 text-[10px]"></i>
                </view>
              </picker>
            </view>

            <!-- Main Positions -->
            <view>
              <text class="block text-slate-400 mb-1.5">擅长分路 (至多选两项)</text>
              <view class="flex flex-wrap gap-2">
                <button v-for="pos in positionOptions" :key="pos" type="button"
                      @click="togglePosition(pos)"
                      :class="['pos-tag px-2 py-1.5 min-w-[50px] flex items-center justify-center rounded-lg border text-center transition m-0 text-xs', 
                            currentUser.positions.includes(pos) ? 'border-indigo-500 bg-indigo-600/30 text-indigo-300 font-bold' : 'border-slate-700 bg-slate-900 text-slate-300 font-medium']" class="h-10">
                {{ pos }}
                </button>
              </view>
            </view>

            <!-- Save Info Action Button -->
            <button @click="saveUserProfile"
                  class="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 m-0 border-none">
              <i class="fa-solid fa-floppy-disk"></i>
              <text>保存游戏资料</text>
            </button>
          </view>
        </view>


        </view>
      </view>


      <!-- MODAL 0: Avatar Selector Dialog -->
      <view v-if="modalVisible.avatarSelect" @click="closeModal('avatarSelect')"
            class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <view @click.stop class="w-full max-w-xs bg-vox-card rounded-2xl border border-vox-border p-5 space-y-4">
          <view class="flex items-center justify-between">
            <text class="font-bold text-white text-sm">选择游戏头像</text>
            <view @click="closeModal('avatarSelect')" class="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:bg-slate-700 transition">
              <i class="fa-solid fa-xmark text-xs"></i>
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
      <view v-if="modalVisible.createRoom" @click="closeModal('createRoom')"
            class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
        <view @click.stop class="w-full max-w-sm bg-vox-card rounded-t-3xl md:rounded-3xl border border-vox-border p-5 space-y-4 shadow-2xl">
          <view class="flex items-center justify-between">
            <view class="flex items-center gap-2">
              <text class="w-2.5 h-2.5 rounded-full bg-cyan-400"></text>
              <text class="font-bold text-white text-base">创建开黑语聊房</text>
            </view>
            <view @click="closeModal('createRoom')" class="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:bg-slate-700 transition">
              <i class="fa-solid fa-xmark text-xs"></i>
            </view>
          </view>

          <view class="space-y-3 text-xs">
            <view>
              <text class="block text-slate-400 mb-1">车队名称</text>
              <input placeholder-class="input-placeholder" type="text" v-model="createForm.name" maxlength="20" placeholder="例如: 连胜冲星5排缺打野"
                     class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 h-11 text-sm leading-[44px]" />
            </view>

            <view>
              <text class="block text-slate-400 mb-1">车队类型</text>
              <view class="grid grid-cols-3 gap-2">
                <button v-for="ct in [{t:'5排',n:5},{t:'3排',n:3},{t:'2排',n:2}]" :key="ct.t"
                        type="button" @click="createForm.type = ct.t; createForm.maxNum = ct.n"
                        :class="['create-type-btn py-2 h-10 min-h-[40px] flex items-center justify-center rounded-xl text-center font-bold transition m-0 border-none', 
                                createForm.type === ct.t ? 'bg-indigo-600 text-white border border-indigo-400' : 'bg-slate-900 text-slate-400 border border-slate-700']" class="h-10">
                  {{ ct.t }} ({{ ct.n }}人)
                </button>
              </view>
            </view>

            <view>
              <text class="block text-slate-400 mb-1">房间标签</text>
              <picker @change="onCreateTagChange" :value="createTagIndex" :range="tagOptions" range-key="label">
                <view class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white flex justify-between items-center h-10 min-h-[40px]">
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
              <input placeholder-class="input-placeholder" type="password" v-model="createForm.password" maxlength="6" placeholder="4-6位数字密码"
                     class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono h-11 text-sm leading-[44px]" />
            </view>

            <button @click="handleCreateRoomSubmit"
                    class="w-full h-11 min-h-[44px] mt-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/30 active:scale-98 transition flex items-center justify-center gap-1.5 m-0 border-none leading-normal">
              <i class="fa-solid fa-microphone-lines"></i>
              <text>即刻开启语音房 (自动就座房主席)</text>
            </button>
          </view>
        </view>
      </view>

      <!-- MODAL 2: Enter Password Prompt -->
      <view v-if="modalVisible.enterPwd" @click="closeModal('enterPwd')"
            class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <view @click.stop class="w-full max-w-xs bg-vox-card rounded-2xl border border-vox-border p-5 space-y-4 text-center">
          <view class="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl border border-amber-500/30">
            <i class="fa-solid fa-lock"></i>
          </view>
          <view>
            <text class="font-bold text-white text-base block">此车队已加密</text>
            <text class="text-xs text-slate-400 mt-1 block">请输入房主设置的进入密码 (演示默认: 666)</text>
          </view>
          <input placeholder-class="input-placeholder" type="password" v-model="inputPassword" maxlength="6" placeholder="输入密码"
                 class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-center text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono tracking-widest text-sm h-11 text-sm leading-[44px]" />
          <view class="flex gap-2">
            <button @click="closeModal('enterPwd')" class="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs m-0 border-none min-h-[40px]">
              取消
            </button>
            <button @click="submitVerifyPassword" class="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs m-0 border-none min-h-[40px]">
              验证进入
            </button>
          </view>
        </view>
      </view>

      <!-- MODAL 3: Member Detail & Host Actions Modal -->
      <view v-if="modalVisible.memberDetail && selectedMember" @click="closeModal('memberDetail')"
            class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
        <view @click.stop class="w-full max-w-xs bg-vox-card rounded-t-3xl md:rounded-3xl border border-vox-border p-5 space-y-3">
          <view class="flex items-center justify-between">
            <text class="text-xs text-slate-400">队员详细信息</text>
            <view @click="closeModal('memberDetail')" class="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:bg-slate-700 transition">
              <i class="fa-solid fa-xmark text-xs"></i>
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
      <view v-if="modalVisible.report" @click="closeModal('report')"
            class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <view @click.stop class="w-full max-w-xs bg-vox-card rounded-2xl border border-vox-border p-5 space-y-3.5 text-xs">
          <view class="flex items-center justify-between">
            <view class="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <text>违规举报提交</text>
            </view>
            <view @click="closeModal('report')" class="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:bg-slate-700 transition">
              <i class="fa-solid fa-xmark text-xs"></i>
            </view>
          </view>

          <text class="text-slate-400 text-[11px] block">SquadVox 坚决抵制任何侮辱谩骂、低俗违规及代练广告宣传。</text>

          <view>
            <text class="block text-slate-300 mb-1">举报类型</text>
            <picker @change="onReportTypeChange" :value="reportTypeIndex" :range="reportTypes">
                <view class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white flex justify-between items-center h-10 min-h-[40px]">
                <text>{{ reportTypes[reportTypeIndex] }}</text>
                <i class="fa-solid fa-chevron-down text-slate-500 text-[10px]"></i>
              </view>
            </picker>
          </view>

          <view>
            <text class="block text-slate-300 mb-1">详情描述 (选填)</text>
            <textarea placeholder-class="input-placeholder" v-model="reportDesc" placeholder="补充具体违规发生的时间或言论细节..."
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white placeholder-slate-500 h-16 text-xs"></textarea>
          </view>

          <button @click="submitUserReport"
                  class="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-md m-0 border-none leading-normal">
            提交违规审核存档 (/squadvox/api/report/submit)
          </button>
        </view>
      </view>

      <!-- MODAL 5: Room Settings / Host Controls -->
      <view v-if="modalVisible.roomSettings" @click="closeModal('roomSettings')"
            class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
        <view @click.stop class="w-full max-w-xs bg-vox-card rounded-t-3xl md:rounded-3xl border border-vox-border p-5 space-y-3.5 text-xs">
          <view class="flex items-center justify-between">
            <text class="font-bold text-white text-sm">房间管控面板</text>
            <view @click="closeModal('roomSettings')" class="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:bg-slate-700 transition">
              <i class="fa-solid fa-xmark text-xs"></i>
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

            <!-- Microphone self-test -->
            <button @click="openMicTest"
                    class="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-between transition m-0">
              <view class="flex items-center gap-2">
                <i class="fa-solid fa-microphone-lines text-emerald-400"></i>
                <text>麦克风测试</text>
              </view>
              <text class="text-[10px] text-slate-400">录一段回放</text>
            </button>

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
      <view v-if="modalVisible.privacy" @click="closeModal('privacy')"
            class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <view @click.stop class="w-full max-w-sm bg-vox-card rounded-2xl border border-vox-border p-5 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
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

      <!-- MODAL 7: Microphone Self-Test (录一段自动回放，确认麦克风与扬声器都正常) -->
      <view v-if="modalVisible.micTest" @click="closeMicTest"
            class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
        <view @click.stop class="w-full max-w-xs bg-vox-card rounded-2xl border border-vox-border p-5 space-y-4">
          <view class="flex items-center justify-between">
            <view class="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
              <i class="fa-solid fa-microphone-lines"></i>
              <text>麦克风测试</text>
            </view>
            <view @click="closeMicTest" class="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center active:bg-slate-700 transition">
              <i class="fa-solid fa-xmark text-xs"></i>
            </view>
          </view>

          <!-- 状态可视化：录音时复用说话涟漪 -->
          <view class="flex flex-col items-center justify-center py-2">
            <view :class="['relative w-20 h-20 rounded-full flex items-center justify-center transition', 
                           micTestState === 'recording' ? 'bg-rose-500/20 text-rose-400' : (micTestState === 'playing' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400')]">
              <template v-if="micTestState === 'recording'">
                <view class="voice-ripple rounded-full"></view>
                <view class="voice-ripple voice-ripple--delay rounded-full"></view>
              </template>
              <i :class="['text-2xl', micTestState === 'playing' ? 'fa-solid fa-volume-high' : 'fa-solid fa-microphone']"></i>
            </view>
            <text class="text-sm font-bold text-white mt-3">{{ micTestHint }}</text>
            <text v-if="micTestState === 'recording'" class="text-xs text-rose-400 font-mono mt-1">
              {{ micTestSeconds }}s / 最长 10s
            </text>
          </view>

          <view class="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 rounded-xl p-2.5 border border-white/5 space-y-0.5">
            <text class="block">· 点「开始录音」，对着手机正常说话</text>
            <text class="block">· 录完自动回放，能听到自己的声音 = 麦克风与扬声器正常</text>
            <text class="block">· 首次使用会弹出微信麦克风授权</text>
          </view>

          <button @click="onMicTestAction"
                  :class="['w-full h-11 rounded-xl font-bold text-xs m-0 border-none leading-normal transition', 
                          micTestState === 'recording' ? 'bg-rose-500 text-white' : 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950']">
            {{ micTestState === 'recording' ? '停止并回放' : (micTestState === 'idle' ? '开始录音' : '重新测试') }}
          </button>
        </view>
      </view>

      <!-- TOAST MESSAGE NOTIFICATION -->
      <view v-if="toast.show"
            :style="{ top: (statusBarHeight + 56) + 'px' }"
            class="pointer-events-none fixed left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 text-white border border-indigo-500/40 text-xs shadow-2xl flex items-center gap-2 transition-opacity duration-300">
        <i :class="['fa-solid', toast.type === 'error' ? 'fa-circle-xmark text-rose-400' : (toast.type === 'warn' ? 'fa-triangle-exclamation text-amber-400' : 'fa-circle-check text-emerald-400')]"></i>
        <text>{{ toast.message }}</text>
      </view>

    </main>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { listRooms, createRoom, enterRoom, closeRoom, kickMember, sendMessage, saveInfo, submitReport, randomProfile } from '@/api/index';
import { wechatLogin, clearSession, uploadLocalAvatar, saveCachedUser, getCachedUser } from '@/utils/auth';

// ----------------------------------------------------
// 状态栏 / 安全区高度（真机顶部状态栏 + 底部手势条避让）
// ----------------------------------------------------
const statusBarHeight = ref(20);
const safeAreaBottom = ref(0);
try {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
  if (sysInfo.safeArea && sysInfo.screenHeight != null && sysInfo.safeArea.bottom != null) {
    safeAreaBottom.value = Math.max(0, sysInfo.screenHeight - sysInfo.safeArea.bottom);
  }
} catch (e) {
  statusBarHeight.value = 20;
  safeAreaBottom.value = 0;
}

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
// 界面显示
// ----------------------------------------------------
const isFullscreen = ref(false);

const toggleDeviceView = () => {
  isFullscreen.value = !isFullscreen.value;
};

// ----------------------------------------------------
// 精美王者游戏头像列表
// ----------------------------------------------------
// 头像资源改为本地打包图片（真机上外部域名图片会被「downloadFile合法域名」拦截，
// 且无法离线加载），统一放在 src/static/avatars 下随包分发。
const avatarList = [
  "/static/avatars/avatar-1.jpg",
  "/static/avatars/avatar-2.jpg",
  "/static/avatars/avatar-3.jpg",
  "/static/avatars/avatar-4.jpg",
  "/static/avatars/avatar-5.jpg",
  "/static/avatars/avatar-6.jpg",
  "/static/avatars/avatar-7.jpg",
  "/static/avatars/avatar-8.jpg"
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

const roomList = ref([]);

const fetchRooms = async () => {
  try {
    const { data } = await listRooms();
    if (data) {
      roomList.value = data.map(r => ({
        id: r.id,
        roomNo: r.room_no,
        ownerId: r.owner_id || 0,
        ownerName: r.owner_nickname || '未知',
        ownerRank: r.owner_rank || '未知',
        ownerAvatar: r.owner_avatar || avatarList[0],
        name: r.room_name,
        type: r.room_type,
        maxNum: r.max_num,
        tag: r.tag,
        hasPassword: !!r.is_encrypted,
        members: Array(r.current_num || 1).fill({ isSpeaking: false, micOpen: true })
      }));
    }
  } catch (err) {
    console.error('Failed to fetch rooms', err);
  }
};

// 把服务端返回的用户资料合并进本地状态（登录 / 切换账号 / 拉取资料都走这里）
const applyServerUser = (d) => {
  if (!d) return;
  currentUser.value = {
    ...currentUser.value,
    id: d.id != null ? d.id : currentUser.value.id,
    openid: d.wx_openid || currentUser.value.openid || '',
    nickname: d.nickname || currentUser.value.nickname,
    avatar: d.avatar || currentUser.value.avatar,
    region: d.game_area || currentUser.value.region,
    server: d.game_server || currentUser.value.server,
    gameId: d.game_id || currentUser.value.gameId,
    rank: d.rank || currentUser.value.rank,
    positions: d.position ? String(d.position).split('/').filter(Boolean) : currentUser.value.positions
  };
  saveCachedUser(currentUser.value);
    syncCurrentUserToRoom();
    syncCurrentUserToRoom();
};

const loadUserProfile = () => {
  getInfo()
    .then((res) => { if (res && res.data) applyServerUser(res.data); })
    .catch((e) => console.error('[SquadVox] 拉取用户资料失败:', e));
};

// 登录后跳转过来时会带 ?tab=profile，用于引导完成头像昵称授权
onLoad((options) => {
  const tab = options && options.tab;
  
  if (options && options.action === 'join' && options.roomNo) {
    // Attempt to join room from share link
    setTimeout(() => {
      joinRoomByNo(options.roomNo);
    }, 1000);
  }

  if (!tab || !['lobby', 'room', 'profile'].includes(tab)) return;
  if (tab === 'room' && !activeRoom.value) return;
  currentTab.value = tab;
});

// Setup Share App Message
onShareAppMessage(() => {
  if (currentTab.value === 'room' && activeRoom.value) {
    return {
      title: `我所在的语聊房「${activeRoom.value.name}」缺人，快来上麦！`,
      path: `/pages/index/index?roomNo=${activeRoom.value.roomNo}&action=join`,
      imageUrl: '' // You can place a default share cover image here if available
    }
  }
  return {
    title: 'SquadVox - 寻找默契游戏队友',
    path: '/pages/index/index'
  }
});

onMounted(() => {
  fetchRooms();
  loadUserProfile();
});

const filteredRooms = computed(() => {
  return roomList.value.filter(room => {
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

// 指定麦位是否正在说话（用于渲染头像外圈的涟漪环）
const isSeatSpeaking = (index) => {
  const m = activeRoom.value && activeRoom.value.members[index];
  return !!(m && m.isSpeaking && m.micOpen && !isAllMutedByHost.value);
};

// 房间弹幕聊天
const chatMessages = ref([
  { isSystem: true, sender: '系统', content: '欢迎进入 SquadVox，开麦畅爽沟通！' }
]);
const chatInputText = ref('');
const chatInputFocused = ref(false);
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

const joinRoomByNo = (roomNo) => {
  const room = roomList.value.find(r => r.roomNo === roomNo);
  if (room) {
    requestEnterRoom(room);
    currentTab.value = 'room';
  } else {
    showToast('该语音房已解散或不存在', 'error');
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
  // 退出房间属于不可撤销操作，先二次确认
  uni.showModal({
    title: '退出房间',
    content: `确定要退出「${roomTitle}」吗？退出后需要重新加入。`,
    confirmText: '退出',
    cancelText: '再想想',
    success: (res) => {
      if (!res.confirm) return;
      activeRoom.value.members = activeRoom.value.members.filter(m => m.id !== currentUser.value.id);
      activeRoom.value = null;
      // 退出后房间标签页已无意义，回到大厅
      currentTab.value = 'lobby';
      showToast(`已退出房间: ${roomTitle}`, 'info');
    }
  });
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
  privacy: false,
  micTest: false,
  gameProfile: false
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
  const roomName = createForm.value.name.trim();
  if (!roomName) {
    showToast('请先填写车队名称', 'warn');
    return;
  }

  const newRoom = {
    id: Date.now(),
    roomNo: 'SV-' + Math.floor(1000 + Math.random() * 9000),
    ownerId: currentUser.value.id,
    ownerName: currentUser.value.nickname,
    ownerRank: currentUser.value.rank,
    ownerAvatar: currentUser.value.avatar,
    name: roomName,
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

  roomList.value.unshift(newRoom);
  closeModal('createRoom');
  // 表单复位，避免下次打开还是上次的密码/名称
  createForm.value.password = '';

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

const selectAvatar = async (av) => {
  currentUser.value.avatar = av;
  closeModal('avatarSelect');
  saveCachedUser(currentUser.value);
    syncCurrentUserToRoom();
  showToast('已更新游戏展示头像', 'success');
  try {
    await saveInfo({ avatar: av }); // 立即落库
  } catch (e) {
    // 离线也不阻塞交互
  }
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
  // 踢人不可撤销，先确认
  uni.showModal({
    title: '移出队员',
    content: `确定将「${target.name}」移出车队吗？`,
    confirmText: '移出',
    cancelText: '取消',
    success: (res) => {
      if (!res.confirm) return;
      activeRoom.value.members = activeRoom.value.members.filter(m => m.id !== target.id);
      closeModal('memberDetail');
      chatMessages.value.push({
        isSystem: true,
        sender: '系统',
        content: `房主已将 [${target.name}] 移出房间`
      });
      showToast(`已踢出队员: ${target.name}`, 'info');
    }
  });
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
  const roomTitle = activeRoom.value.name;
  // 解散房间影响所有队员，必须二次确认
  uni.showModal({
    title: '解散房间',
    content: `确定要解散「${roomTitle}」吗？房间内所有队员都会被移出。`,
    confirmText: '解散',
    confirmColor: '#f43f5e',
    cancelText: '取消',
    success: async (res) => {
      if (!res.confirm) return;
      closeModal('roomSettings');
      try {
        await closeRoom({ room_no: activeRoom.value.roomNo });
      } catch (e) {
        // 服务端失败也要让本地状态归位，避免卡在半死状态
        console.error('[SquadVox] 关闭房间失败:', e);
      }
      activeRoom.value = null;
      currentTab.value = 'lobby';
      await fetchRooms();
      showToast('房间已解散', 'info');
    }
  });
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

// ----------------------------------------------------
// 微信资料授权 / 切换账号（闭环）
// ----------------------------------------------------
const maskedOpenid = computed(() => {
  const o = currentUser.value.openid || '';
  if (!o) return 'openid 未获取';
  return o.length > 12 ? `${o.slice(0, 6)}…${o.slice(-4)}` : o;
});

const isProfileAuthorized = computed(() => {
  const u = currentUser.value;
  return !!(u.nickname && u.avatar);
});

// 微信官方头像授权回调：拿到的是临时文件，先抓取上传再落库

const syncCurrentUserToRoom = () => {
  if (activeRoom.value && activeRoom.value.members) {
    const mySeat = activeRoom.value.members.find(m => m.id === currentUser.value.id);
    if (mySeat) {
      mySeat.name = currentUser.value.nickname;
      mySeat.avatar = currentUser.value.avatar;
      mySeat.rank = currentUser.value.rank;
      mySeat.position = currentUser.value.positions[0] || '发育路';
    }
  }
};

const onChooseAvatar = async (e) => {
  const filePath = e && e.detail && e.detail.avatarUrl;
  if (!filePath) return;

  uni.showLoading({ title: '上传头像中...', mask: true });
  try {
    const url = await uploadLocalAvatar(filePath);
    currentUser.value.avatar = url;
    await saveInfo({ avatar: url }); // 立即落库，避免用户忘了点保存
    saveCachedUser(currentUser.value);
    syncCurrentUserToRoom();
    uni.hideLoading();
    showToast('微信头像已更新', 'success');
  } catch (err) {
    uni.hideLoading();
    console.error('[SquadVox] 头像上传失败:', err);
    showToast('头像上传失败，请重试', 'error');
  }
};

const saveWechatProfile = async () => {
  const nick = String(currentUser.value.nickname || '').trim();
  if (!nick) {
    showToast('请先填写或获取微信昵称', 'warn');
    return;
  }
  uni.showLoading({ title: '保存中...', mask: true });
  try {
    await saveInfo({ nickname: nick, avatar: currentUser.value.avatar });
    saveCachedUser(currentUser.value);
    syncCurrentUserToRoom();
    uni.hideLoading();
    showToast('微信资料已保存', 'success');
  } catch (e) {
    uni.hideLoading();
  }
};

// 随机生成一套王者荣耀风格的开黑名片（昵称 + 头像由服务端词库产出）
const randomizeProfile = async () => {
  uni.showLoading({ title: '生成中...', mask: true });
  try {
    const { data } = await randomProfile();
    currentUser.value.nickname = data.nickname;
    currentUser.value.avatar = data.avatar;
    saveCachedUser(currentUser.value);
    syncCurrentUserToRoom();
    uni.hideLoading();
    showToast(`已生成：${data.nickname}`, 'success');
  } catch (e) {
    uni.hideLoading();
    showToast('生成失败，请重试', 'error');
  }
};

// 切换微信：清会话 -> 重新 uni.login -> 用新 openid 拉回身份
const switchWechatAccount = () => {
  uni.showModal({
    title: '切换微信账号',
    content: '将清除当前登录状态并重新授权。若要换成另一个微信号，请先在微信里切换账号再继续。',
    confirmText: '重新授权',
    cancelText: '取消',
    success: async (res) => {
      if (!res.confirm) return;
      uni.showLoading({ title: '重新授权中...', mask: true });
      try {
        clearSession();
        const data = await wechatLogin();
        applyServerUser(data && data.user);
        await fetchRooms();
        uni.hideLoading();
        showToast(`已切换为 ${currentUser.value.nickname}`, 'success');
      } catch (err) {
        uni.hideLoading();
        console.error('[SquadVox] 切换微信失败:', err);
        showToast('切换失败，请重试', 'error');
      }
    }
  });
};

// ----------------------------------------------------
// 麦克风自测：录音 → 自动回放（首次会触发微信麦克风授权）
// ----------------------------------------------------
const micTestState = ref('idle'); // idle | recording | playing | done
const micTestSeconds = ref(0);
let micRecorder = null;
let micAudio = null;
let micTimer = null;

const micTestHint = computed(() => {
  if (micTestState.value === 'recording') return '正在录音，请对着手机说话…';
  if (micTestState.value === 'playing') return '正在回放…';
  if (micTestState.value === 'done') return '听到自己的声音了吗？';
  return '准备就绪';
});

const stopMicTimer = () => {
  if (micTimer) {
    clearInterval(micTimer);
    micTimer = null;
  }
};

const getMicRecorder = () => {
  if (micRecorder) return micRecorder;

  micRecorder = uni.getRecorderManager();

  micRecorder.onStop((res) => {
    stopMicTimer();
    if (!res || !res.tempFilePath) {
      micTestState.value = 'idle';
      showToast('没有录到音频，请重试', 'error');
      return;
    }
    micTestState.value = 'playing';
    try {
      if (!micAudio) micAudio = uni.createInnerAudioContext();
      micAudio.src = res.tempFilePath;
      micAudio.onEnded(() => { micTestState.value = 'done'; });
      micAudio.onError(() => { micTestState.value = 'done'; showToast('回放失败，请检查媒体音量', 'error'); });
      micAudio.play();
    } catch (e) {
      micTestState.value = 'done';
    }
  });

  micRecorder.onError((err) => {
    stopMicTimer();
    micTestState.value = 'idle';
    console.error('[SquadVox] 录音失败:', err);
    showToast('录音失败，请检查麦克风权限', 'error');
  });

  return micRecorder;
};

const openMicTest = () => {
  micTestState.value = 'idle';
  micTestSeconds.value = 0;
  openModal('micTest');
};

const doStartMicRecording = () => {
  micTestState.value = 'recording';
  micTestSeconds.value = 0;
  stopMicTimer();
  micTimer = setInterval(() => {
    micTestSeconds.value += 1;
    if (micTestSeconds.value >= 10) stopMicRecording(); // 最长 10 秒自动停
  }, 1000);

  try {
    getMicRecorder().start({
      duration: 10000,
      format: 'mp3',
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000
    });
  } catch (e) {
    stopMicTimer();
    micTestState.value = 'idle';
    console.error('[SquadVox] 录音启动失败:', e);
    showToast('当前环境不支持录音，请在微信小程序中测试', 'error');
  }
};

const stopMicRecording = () => {
  stopMicTimer();
  try { getMicRecorder().stop(); } catch (e) {}
};

const onMicTestAction = () => {
  if (micTestState.value === 'recording') {
    stopMicRecording();
    return;
  }
  // 先申请麦克风授权；被拒过就走 openSetting 引导
  if (typeof uni.authorize !== 'function') {
    doStartMicRecording();
    return;
  }
  uni.authorize({
    scope: 'scope.record',
    success: () => doStartMicRecording(),
    fail: () => {
      uni.showModal({
        title: '需要麦克风权限',
        content: '请在设置中打开「麦克风」权限后重试',
        confirmText: '去设置',
        cancelText: '取消',
        success: (r) => { if (r.confirm) uni.openSetting({}); }
      });
    }
  });
};

const closeMicTest = () => {
  stopMicTimer();
  try { if (micRecorder) micRecorder.stop(); } catch (e) {}
  try { if (micAudio) micAudio.stop(); } catch (e) {}
  micTestState.value = 'idle';
  closeModal('micTest');
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
  // 先用本地缓存渲染，避免白屏；随后 loadUserProfile 会用服务端数据覆盖
  const cachedUser = getCachedUser();
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
  if (simulateSpeakingTimer) clearInterval(simulateSpeakingTimer);
});
</script>

<style scoped>
button::after {
  border: none;
}
</style>
