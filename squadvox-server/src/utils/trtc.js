const TLSSigAPIv2 = require('tls-sig-api-v2');
require('dotenv').config();

const sdkAppId = parseInt(process.env.TRTC_SDKAPPID || '0');
const secretKey = process.env.TRTC_SECRETKEY || '';

const generateUserSig = (userId) => {
  if (!sdkAppId || !secretKey) {
    throw new Error('TRTC Configuration missing');
  }
  const api = new TLSSigAPIv2.Api(sdkAppId, secretKey);
  const userSig = api.genUserSig(userId.toString(), 86400 * 7); // Valid for 7 days
  return userSig;
};

module.exports = { generateUserSig };
