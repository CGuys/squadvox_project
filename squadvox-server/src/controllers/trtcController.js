const { generateUserSig } = require('../utils/trtc');

exports.getSig = async (req, res) => {
  try {
    const userId = req.user.id;
    const sig = generateUserSig(userId);

    res.json({
      code: 200,
      msg: '成功',
      data: {
        userId: userId.toString(),
        userSig: sig,
        sdkAppId: parseInt(process.env.TRTC_SDKAPPID || '0')
      }
    });
  } catch (error) {
    console.error('Get TRTC sig error:', error);
    res.status(500).json({ code: 500, msg: '服务异常' });
  }
};
