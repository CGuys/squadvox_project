const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
  try {
    const token = jwt.sign({ id: 9, wx_openid: 'test' }, process.env.JWT_SECRET || 'squadvox_jwt_secret_key_2026', { expiresIn: '7d' });
    const res = await axios.get('http://127.0.0.1:3000/squadvox/api/room/list', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
