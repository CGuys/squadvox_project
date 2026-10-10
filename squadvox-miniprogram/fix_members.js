const fs = require('fs');

const path = 'src/pages/index/index.vue';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `        members: Array(r.current_num || 1).fill({ isSpeaking: false, micOpen: true })`;
const replacementStr = `        members: [{
          id: r.owner_id || 0,
          name: r.owner_nickname || '未知',
          rank: r.owner_rank || '未知',
          avatar: r.owner_avatar || avatarList[0],
          isHost: true,
          isSpeaking: false,
          micOpen: true
        }]`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed members array generation.');
