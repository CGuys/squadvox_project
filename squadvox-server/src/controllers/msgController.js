const db = require('../config/db');

exports.sendMessage = async (req, res) => {
  try {
    const { room_no, content } = req.body;
    const userId = req.user.id;

    if (!room_no || !content) {
      return res.status(400).json({ code: 400, msg: '参数不完整' });
    }

    // 简单实现内容安全审核，实际需调用微信/内容审核接口
    // if (containsSensitiveWord(content)) {
    //   return res.status(400).json({ code: 400, msg: '内容包含敏感词' });
    // }

    await db.execute(
      'INSERT INTO room_message (room_no, user_id, content) VALUES (?, ?, ?)',
      [room_no, userId, content]
    );

    res.json({ code: 200, msg: '发送成功' });
  } catch (error) {
    console.error('Send msg error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};
