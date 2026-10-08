const db = require('../config/db');

exports.submitReport = async (req, res) => {
  try {
    const { room_no, target_user_id, report_type, desc } = req.body;
    
    if (!target_user_id || !report_type) {
      return res.status(400).json({ code: 400, msg: '参数不完整' });
    }

    await db.execute(
      'INSERT INTO report (room_no, target_user_id, report_type, `desc`) VALUES (?, ?, ?, ?)',
      [room_no || '', target_user_id, report_type, desc || '']
    );

    res.json({ code: 200, msg: '举报提交成功' });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};
