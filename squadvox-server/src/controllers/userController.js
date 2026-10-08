const db = require('../config/db');
const { generateToken } = require('../utils/jwt');
const axios = require('axios');
require('dotenv').config();

const WX_APPID = process.env.WX_APPID;
const WX_APPSECRET = process.env.WX_APPSECRET;

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
      // 更新昵称和头像（如果有传）
      if (nickname || avatar) {
        await db.execute('UPDATE `user` SET nickname = ?, avatar = ? WHERE id = ?', [
          nickname || user.nickname,
          avatar || user.avatar,
          user.id
        ]);
        user.nickname = nickname || user.nickname;
        user.avatar = avatar || user.avatar;
      }
    } else {
      // 创建新用户
      const [insertRes] = await db.execute(
        'INSERT INTO `user` (wx_openid, nickname, avatar) VALUES (?, ?, ?)',
        [openid, nickname || '', avatar || '']
      );
      user = {
        id: insertRes.insertId,
        wx_openid: openid,
        nickname: nickname || '',
        avatar: avatar || ''
      };
    }

    const token = generateToken({ id: user.id, wx_openid: user.wx_openid });

    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};

// 保存个人基础资料
exports.saveInfo = async (req, res) => {
  try {
    const { game_area, game_server, game_id, rank, position } = req.body;
    const userId = req.user.id;

    await db.execute(
      'UPDATE `user` SET game_area = ?, game_server = ?, game_id = ?, rank = ?, position = ? WHERE id = ?',
      [game_area || '', game_server || '', game_id || '', rank || '', position || '', userId]
    );

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
    const [rows] = await db.execute('SELECT id, nickname, avatar, game_area, game_server, game_id, rank, position FROM `user` WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '用户不存在' });
    }

    res.json({
      code: 200,
      msg: '成功',
      data: rows[0]
    });
  } catch (error) {
    console.error('Get info error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};
