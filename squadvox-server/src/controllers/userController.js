const db = require('../config/db');
const { generateToken } = require('../utils/jwt');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const WX_APPID = process.env.WX_APPID;
const WX_APPSECRET = process.env.WX_APPSECRET;

// 上传的头像存放目录（由 app.js 通过 /uploads 静态托管）
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// ---------------------------------------------------------------
// 王者荣耀主题的默认头像：随小程序包一起分发，服务端只存路径。
// 这样不同设备都能显示，也不依赖服务器可达。
// ---------------------------------------------------------------
const DEFAULT_AVATARS = [
  '/static/avatars/hero-clash.png',   // 对抗路
  '/static/avatars/hero-jungle.png',  // 打野
  '/static/avatars/hero-mid.png',     // 中路
  '/static/avatars/hero-farm.png',    // 发育路
  '/static/avatars/hero-support.png', // 游走
  '/static/avatars/hero-king.png',    // 荣耀王者
  '/static/avatars/hero-star.png',    // 至尊星耀
  '/static/avatars/hero-diamond.png'  // 永恒钻石
];

// 随机开黑昵称词库（A 前缀 + B 核心 + C 后缀）
const NICK_A = ['峡谷', '巅峰', '荣耀', '王者', '星耀', '钻石', '野区', '中路', '对抗路', '发育路', '游走'];
const NICK_B = ['小鲁班', '打野王', '不送包赢', '带飞全场', '稳住别浪', '闪电开团',
                '上分机器', '五杀达人', '翻盘王', '一血狂魔', '守塔大师', '补刀王', '团战发动机'];
const NICK_C = ['', '本尊', '在此', '666', '上线'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNickname = () => (pick(NICK_A) + pick(NICK_B) + pick(NICK_C)).slice(0, 20);
const randomAvatar = () => pick(DEFAULT_AVATARS);

// 历史遗留的占位昵称：老版本登录时硬编码写进去的，视同「未设置」，自动替换
const PLACEHOLDER_NICKS = ['微信用户', 'H5用户', '未登录'];
const needsNickname = (n) => !n || !String(n).trim() || PLACEHOLDER_NICKS.includes(String(n).trim());
const needsAvatar = (a) => !a || !String(a).trim();

// 微信登录
exports.login = async (req, res) => {
  try {
    const { code, nickname, avatar } = req.body;
    if (!code) {
      return res.status(400).json({ code: 400, msg: '缺少code参数' });
    }

    // 通过code换取openid
    let openid;
    if (code === 'mock-h5-code') {
      openid = 'h5-mock-openid-' + Math.floor(Math.random() * 1000);
    } else {
      const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_APPSECRET}&js_code=${code}&grant_type=authorization_code`;
      const wxRes = await axios.get(wxUrl);

      if (!wxRes.data || !wxRes.data.openid) {
        return res.status(400).json({ code: 400, msg: '微信授权失败' });
      }
      openid = wxRes.data.openid;
    }

    // 查询数据库是否存在该用户
    const [rows] = await db.execute('SELECT * FROM `user` WHERE wx_openid = ?', [openid]);
    let user;

    if (rows.length > 0) {
      user = rows[0];
      // 前端可选传入；没传且库里是空的/占位值时，补一套随机主题名片
      const nextNick = (nickname && String(nickname).trim()) ||
        (needsNickname(user.nickname) ? randomNickname() : user.nickname);
      const nextAvatar = (avatar && String(avatar).trim()) ||
        (needsAvatar(user.avatar) ? randomAvatar() : user.avatar);

      if (nextNick !== user.nickname || nextAvatar !== user.avatar) {
        await db.execute('UPDATE `user` SET nickname = ?, avatar = ? WHERE id = ?',
          [nextNick, nextAvatar, user.id]);
        user.nickname = nextNick;
        user.avatar = nextAvatar;
      }
    } else {
      // 新用户：直接随机生成一套贴合王者荣耀的昵称 + 头像
      const nick = (nickname && String(nickname).trim()) || randomNickname();
      const av = (avatar && String(avatar).trim()) || randomAvatar();
      const [insertRes] = await db.execute(
        'INSERT INTO `user` (wx_openid, nickname, avatar) VALUES (?, ?, ?)',
        [openid, nick, av]
      );
      user = { id: insertRes.insertId, wx_openid: openid, nickname: nick, avatar: av };
    }

    const token = generateToken({ id: user.id, wx_openid: user.wx_openid });

    res.json({
      code: 200,
      msg: '登录成功',
      data: { token, user }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};

// 保存个人资料（支持部分更新：只更新请求里带上的字段）
exports.saveInfo = async (req, res) => {
  try {
    const { game_area, game_server, game_id, rank, position, nickname, avatar } = req.body;
    const userId = req.user.id;

    // 注意：rank 是 MySQL 8.0 的保留字（窗口函数），必须用反引号包裹，否则报 ER_PARSE_ERROR
    const columns = [
      ['game_area', game_area, 16],
      ['game_server', game_server, 32],
      ['game_id', game_id, 32],
      ['`rank`', rank, 32],
      ['position', position, 32],
      ['nickname', nickname, 64],
      ['avatar', avatar, 512]
    ];

    const sets = [];
    const params = [];
    for (const [col, val, max] of columns) {
      if (typeof val === 'string') {
        sets.push(`${col} = ?`);
        params.push(val.slice(0, max));
      }
    }

    if (sets.length === 0) {
      return res.json({ code: 200, msg: '没有需要更新的字段' });
    }

    params.push(userId);
    await db.execute(`UPDATE \`user\` SET ${sets.join(', ')} WHERE id = ?`, params);

    res.json({ code: 200, msg: '保存成功' });
  } catch (error) {
    console.error('Save info error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};

// 获取个人资料
exports.getInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    // 注意：rank 是 MySQL 8.0 的保留字，必须用反引号包裹
    const [rows] = await db.execute(
      'SELECT id, wx_openid, nickname, avatar, game_area, game_server, game_id, `rank`, position FROM `user` WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '用户不存在' });
    }

    res.json({ code: 200, msg: '成功', data: rows[0] });
  } catch (error) {
    console.error('Get info error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};

// 随机生成一套王者荣耀风格的开黑名片（昵称 + 头像）
exports.randomProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const nickname = randomNickname();
    const avatar = randomAvatar();

    await db.execute('UPDATE `user` SET nickname = ?, avatar = ? WHERE id = ?',
      [nickname, avatar, userId]);

    res.json({ code: 200, msg: '已生成新的开黑名片', data: { nickname, avatar } });
  } catch (error) {
    console.error('Random profile error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};

// ---------------------------------------------------------------
// 头像上传：小程序端 chooseAvatar 拿到的是一个临时本地文件，
// 必须抓取内容回传到自己的服务器才能持久化（否则重启即失效）。
// 这里用 base64 JSON 传输，免去引入 multer 之类的依赖。
// ---------------------------------------------------------------
exports.uploadAvatar = async (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ code: 400, msg: '缺少图片数据' });
    }

    const matched = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!matched) {
      return res.status(400).json({ code: 400, msg: '图片格式不支持（仅 png/jpg/webp）' });
    }

    const buf = Buffer.from(matched[2], 'base64');
    if (buf.length === 0) {
      return res.status(400).json({ code: 400, msg: '图片内容为空' });
    }
    if (buf.length > 2 * 1024 * 1024) {
      return res.status(400).json({ code: 400, msg: '图片过大（限 2MB）' });
    }

    const ext = matched[1] === 'jpeg' ? 'jpg' : matched[1];
    const filename = `avatars/avatar_${req.user.id}_${Date.now()}.${ext}`;
    let url = '';

    if (process.env.OSS_ACCESS_KEY_ID) {
      const OSS = require('ali-oss');
      const client = new OSS({
        region: process.env.OSS_REGION,
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
        bucket: process.env.OSS_BUCKET,
        secure: true
      });
      const result = await client.put(filename, buf);
      url = result.url;
      if (url && url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
      }
    } else {
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      const localFilename = filename.split('/').pop();
      fs.writeFileSync(require('path').join(UPLOAD_DIR, localFilename), buf);
      url = `${req.protocol}://${req.headers.host}/uploads/${localFilename}`;
    }

    res.json({ code: 200, msg: '头像上传成功', data: { url } });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};
