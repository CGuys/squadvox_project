const db = require('../config/db');
const redisClient = require('../config/redis');

// 生成唯一房间号 (6位随机数字)
const generateRoomNo = async () => {
  let roomNo = '';
  while (true) {
    roomNo = Math.floor(100000 + Math.random() * 900000).toString();
    const [rows] = await db.execute('SELECT id FROM room WHERE room_no = ?', [roomNo]);
    if (rows.length === 0) {
      break;
    }
  }
  return roomNo;
};

exports.createRoom = async (req, res) => {
  try {
    const { room_name, room_type, tag, max_num, room_pwd } = req.body;
    const userId = req.user.id;

    const roomNo = await generateRoomNo();

    const [result] = await db.execute(
      'INSERT INTO room (room_no, owner_id, room_name, room_type, tag, max_num, room_pwd, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [roomNo, userId, room_name || '', room_type || '', tag || '', max_num || 5, room_pwd || '', 1]
    );

    // 缓存房间在线状态及在线人数等可以存在redis中
    await redisClient.hSet(`room:${roomNo}`, {
      owner_id: userId,
      status: 1
    });

    res.json({
      code: 200,
      msg: '创建成功',
      data: { room_no: roomNo, id: result.insertId }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};

exports.listRooms = async (req, res) => {
  try {
    const { room_type, tag } = req.query;
    let query = `
      SELECT r.id, r.room_no, r.room_name, r.room_type, r.tag, r.max_num, 
      IF(r.room_pwd = '', 0, 1) as is_encrypted, 
      u.nickname as owner_nickname, u.avatar as owner_avatar, u.rank as owner_rank
      FROM room r
      LEFT JOIN user u ON r.owner_id = u.id
      WHERE r.status = 1
    `;
    const queryParams = [];

    if (room_type) {
      query += ' AND r.room_type = ?';
      queryParams.push(room_type);
    }
    if (tag) {
      query += ' AND r.tag = ?';
      queryParams.push(tag);
    }

    query += ' ORDER BY r.create_time DESC';

    const [rows] = await db.execute(query, queryParams);
    
    // 实际项目中还需查询redis统计当前在线人数等
    // Mock current_num for the prototype display
    const mappedRows = rows.map(r => ({
      ...r,
      current_num: Math.floor(Math.random() * (r.max_num)) + 1
    }));

    res.json({
      code: 200,
      msg: '成功',
      data: mappedRows
    });
  } catch (error) {
    console.error('List rooms error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};

exports.enterRoom = async (req, res) => {
  try {
    const { room_no, room_pwd } = req.body;

    const [rows] = await db.execute('SELECT * FROM room WHERE room_no = ? AND status = 1', [room_no]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '房间不存在或已关闭' });
    }

    const room = rows[0];

    if (room.room_pwd && room.room_pwd !== room_pwd) {
      return res.status(403).json({ code: 403, msg: '房间密码错误' });
    }

    // 加入房间逻辑，可在此处更新redis房间在线人数等
    res.json({ code: 200, msg: '进入成功', data: { room_no } });
  } catch (error) {
    console.error('Enter room error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};

exports.closeRoom = async (req, res) => {
  try {
    const { room_no } = req.body;
    const userId = req.user.id;

    const [rows] = await db.execute('SELECT owner_id FROM room WHERE room_no = ?', [room_no]);
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '房间不存在' });
    }

    if (rows[0].owner_id !== userId) {
      return res.status(403).json({ code: 403, msg: '无权限关闭房间' });
    }

    await db.execute('UPDATE room SET status = 0 WHERE room_no = ?', [room_no]);
    await redisClient.del(`room:${room_no}`);

    res.json({ code: 200, msg: '关闭成功' });
  } catch (error) {
    console.error('Close room error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};

exports.kickMember = async (req, res) => {
  try {
    const { room_no, target_user_id } = req.body;
    const userId = req.user.id;

    const [rows] = await db.execute('SELECT owner_id FROM room WHERE room_no = ?', [room_no]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, msg: '房间不存在' });
    }

    if (rows[0].owner_id !== userId) {
      return res.status(403).json({ code: 403, msg: '无权限踢人' });
    }

    // 踢人逻辑：通常是通知TRTC或者利用长连接发送踢人指令
    // 在这里由于没有建立WebSocket等，可通过接口告知或由客户端处理
    res.json({ code: 200, msg: '踢出成功' });
  } catch (error) {
    console.error('Kick member error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};
