<template>
  <view class="container p-4 bg-vox-dark min-h-screen">
    
    <view class="bg-vox-card/90 backdrop-blur-md rounded-3xl border border-vox-border p-5 space-y-4 shadow-2xl mt-4">
      <view class="flex items-center gap-2 mb-4">
        <view class="w-2.5 h-2.5 rounded-full bg-cyan-400"></view>
        <text class="font-bold text-white text-base">创建开黑语聊房</text>
      </view>

      <view class="space-y-4 text-xs">
        <!-- Room Name -->
        <view>
          <text class="block text-slate-400 mb-1.5">车队名称</text>
          <input type="text" v-model="form.room_name" maxlength="20" placeholder="例如: 连胜冲星5排缺打野"
                 class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
        </view>

        <!-- Team Type (2排/3排/5排) -->
        <view>
          <text class="block text-slate-400 mb-1.5">车队类型</text>
          <view class="grid grid-cols-3 gap-2">
            <view @click="selectCreateType('5排', 5)"
                  :class="['py-2 rounded-xl text-center transition', form.room_type === '5排' ? 'bg-indigo-600 text-white font-bold border border-indigo-400' : 'bg-slate-900 text-slate-400 border border-slate-700']">
              5排 (5人)
            </view>
            <view @click="selectCreateType('3排', 3)"
                  :class="['py-2 rounded-xl text-center transition', form.room_type === '3排' ? 'bg-indigo-600 text-white font-bold border border-indigo-400' : 'bg-slate-900 text-slate-400 border border-slate-700']">
              3排 (3人)
            </view>
            <view @click="selectCreateType('2排', 2)"
                  :class="['py-2 rounded-xl text-center transition', form.room_type === '2排' ? 'bg-indigo-600 text-white font-bold border border-indigo-400' : 'bg-slate-900 text-slate-400 border border-slate-700']">
              2排 (2人)
            </view>
          </view>
        </view>

        <!-- Room Tag -->
        <view>
          <text class="block text-slate-400 mb-1.5">房间标签</text>
          <picker @change="bindTagChange" :value="tagIndex" :range="tagArray" range-key="label">
            <view class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white flex justify-between items-center">
              <text>{{ tagArray[tagIndex].label }}</text>
              <text class="text-slate-500">▼</text>
            </view>
          </picker>
        </view>

        <!-- Room Password -->
        <view>
          <view class="flex items-center justify-between mb-1.5">
            <text class="text-slate-400">房间密码 (选填)</text>
            <text class="text-[10px] text-slate-500">留空则为公开房间</text>
          </view>
          <input type="password" v-model="form.room_pwd" maxlength="6" placeholder="4-6位数字密码"
                 class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono" />
        </view>

        <button @click="handleCreate"
                class="w-full py-2.5 mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/25 active:scale-95 transition m-0 border-none leading-normal">
          立即创建并进入
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { createRoom } from '@/api/index';

const tagArray = [
  { label: '🔥 冲分上星 (求稳求胜)', value: '冲分上星' },
  { label: '✨ 欢乐娱乐 (下饭搞笑)', value: '欢乐娱乐' },
  { label: '🎯 练新英雄 (赏金战力)', value: '练新英雄' }
];

const tagIndex = ref(0);

const form = ref({
  room_name: '来个硬辅直接发车',
  room_type: '5排',
  tag: '冲分上星',
  max_num: 5,
  room_pwd: ''
});

const selectCreateType = (type, num) => {
  form.value.room_type = type;
  form.value.max_num = num;
};

const bindTagChange = (e) => {
  tagIndex.value = e.detail.value;
  form.value.tag = tagArray[tagIndex.value].value;
};

const handleCreate = async () => {
  if (!form.value.room_name) {
    uni.showToast({ title: '请输入房间名称', icon: 'none' });
    return;
  }

  try {
    uni.showLoading({ title: '创建中...' });
    const { data } = await createRoom(form.value);
    uni.hideLoading();
    uni.showToast({ title: '创建成功' });
    
    setTimeout(() => {
      // 携带roomNo跳转到语聊房
      uni.redirectTo({ url: `/pages/room/detail?roomNo=${data.room_no}` });
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
