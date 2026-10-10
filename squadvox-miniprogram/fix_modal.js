const fs = require('fs');

const path = 'src/pages/index/index.vue';
let content = fs.readFileSync(path, 'utf8');

// Remove double glass-card
content = content.replace(
  `        <!-- Game Profile Edit Card -->
        <view class="glass-card rounded-2xl p-4 space-y-3.5 border border-vox-border">`,
  `        <!-- Game Profile Edit Form -->
        <view class="space-y-4">`
);

// Fix inputs removing min-h-[40px] and leading-tight, making them cleaner
content = content.replace(/h-10 min-h-\[40px\] leading-tight/g, 'h-11 text-sm leading-[44px]');
content = content.replace(/class="min-h-\[40px\]"/g, 'class="h-10"');

// Fix Rank picker empty issue
// It could be that currentRankIndex is out of sync or currentUser.rank is empty string.
content = content.replace(
  `<text>{{ currentUser.rank }}</text>`,
  `<text>{{ currentUser.rank || '请选择段位' }}</text>`
);

// Fix "擅长分路" buttons squished - grid-cols-5 might be too tight for 5 text items.
content = content.replace(
  `class="grid grid-cols-5 gap-1.5"`,
  `class="flex flex-wrap gap-2"`
);
content = content.replace(
  /class="\['pos-tag py-1.5 min-h-\[36px\]/g,
  `class="['pos-tag px-2 py-1.5 min-w-[50px]"`
);

// Save back
fs.writeFileSync(path, content, 'utf8');
console.log('Modal layout fixed!');
