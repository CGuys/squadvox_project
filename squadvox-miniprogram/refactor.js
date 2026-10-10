const fs = require('fs');

const path = 'src/pages/index/index.vue';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix empty state button
const emptyStateTarget = `            <!-- Empty List State -->
            <view v-if="filteredRooms.length === 0" class="text-center py-10 text-slate-500 text-xs">
              <i class="fa-solid fa-gamepad text-2xl mb-2 text-slate-600 block"></i>
              <text>暂无符合筛选条件的开黑房间</text>
              <button @click="openCreateRoomModal" class="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium inline-block m-0 border-none min-h-[40px]">
                创建第一个车队
              </button>
            </view>`;

const emptyStateReplacement = `            <!-- Empty List State -->
            <view v-if="filteredRooms.length === 0" class="flex flex-col items-center justify-center py-10 text-slate-500 text-xs">
              <i class="fa-solid fa-gamepad text-3xl mb-3 text-slate-600"></i>
              <text class="mb-4">暂无符合筛选条件的开黑房间</text>
              <button @click="openCreateRoomModal" class="px-6 rounded-xl bg-indigo-600 text-white font-medium m-0 border-none h-10 flex items-center justify-center shadow-lg shadow-indigo-600/30 active:scale-95 transition">
                创建第一个车队
              </button>
            </view>`;

content = content.replace(emptyStateTarget, emptyStateReplacement);


// 2. Fix 资料设置 button to open gameProfile modal instead of switching tab
const lobbyProfileTarget = `              <view @click="switchTab('profile')" class="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 cursor-pointer">
                <text>资料设置</text>
                <i class="fa-solid fa-angle-right text-[10px]"></i>
              </view>`;
const lobbyProfileReplacement = `              <view @click="openModal('gameProfile')" class="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 cursor-pointer py-1 pl-2">
                <text>资料设置</text>
                <i class="fa-solid fa-angle-right text-[10px]"></i>
              </view>`;

content = content.replace(lobbyProfileTarget, lobbyProfileReplacement);


// 3. Re-arrange VIEW 3 and extract Game Profile card.
// Look for the block we want to extract
const gameProfileCardStart = `          <!-- Game Profile Edit Card -->`;
const gameProfileCardEnd = `          <!-- Compliance & Legal Terms Card -->`;

const startIndex = content.indexOf(gameProfileCardStart);
const endIndex = content.indexOf(gameProfileCardEnd);

let gameProfileCardContent = content.substring(startIndex, endIndex);

// Change the save button in the extracted card to look better and remove API path
gameProfileCardContent = gameProfileCardContent.replace(
  `                <text>保存个人资料 (/squadvox/api/user/saveInfo)</text>`,
  `                <text>保存游戏资料</text>`
);
// Also remove min-h and weird classes on that button
gameProfileCardContent = gameProfileCardContent.replace(
  `class="w-full h-11 min-h-[44px] mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 m-0 border-none leading-normal"`,
  `class="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 m-0 border-none"`
);


// 4. Remove the card from VIEW 3 and format the rest of VIEW 3
content = content.substring(0, startIndex) + content.substring(endIndex);

// Let's format the WECHAT Auth part of VIEW 3 (the avatar/nickname section)
// We will replace `class="flex-1 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs m-0 border-none leading-normal"`
// and `class="px-3 h-10 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold m-0 leading-normal"`
const wechatProfileBtnTarget1 = `class="flex-1 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs m-0 border-none leading-normal"`;
const wechatProfileBtnReplacement1 = `class="flex-1 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs m-0 border-none flex items-center justify-center shadow-md shadow-indigo-500/20 active:scale-95 transition"`;
content = content.replace(wechatProfileBtnTarget1, wechatProfileBtnReplacement1);

const wechatProfileBtnTarget2 = `class="px-3 h-10 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold m-0 leading-normal"`;
const wechatProfileBtnReplacement2 = `class="px-4 h-10 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold m-0 flex items-center justify-center active:scale-95 transition"`;
content = content.replace(wechatProfileBtnTarget2, wechatProfileBtnReplacement2);


// 5. Append the new GameProfile Modal to the Modals section
const modalsSection = `      <!-- ============================================== -->
      <!-- MODAL SYSTEM (7 大高保真弹窗全集)               -->
      <!-- ============================================== -->`;

const modalTemplate = `
      <!-- Game Profile Settings Modal -->
      <view v-if="modalVisible.gameProfile" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <view class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="closeModal('gameProfile')"></view>
        <view class="relative w-full max-w-sm glass-card rounded-3xl p-5 border border-vox-border animate-fade-in-up">
          <!-- Close button -->
          <view @click="closeModal('gameProfile')" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition z-10">
            <i class="fa-solid fa-xmark text-slate-300"></i>
          </view>
          
` + gameProfileCardContent.replace(/          /g, '        ') + `
        </view>
      </view>
`;

content = content.replace(modalsSection, modalsSection + modalTemplate);

// 6. Update modalVisible ref inside setup script
content = content.replace(`  micTest: false
});`, `  micTest: false,
  gameProfile: false
});`);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully refactored!');
