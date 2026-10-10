require('dotenv').config({ path: '.env' });
const OSS = require('ali-oss');

async function testOSS() {
  try {
    const client = new OSS({
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
      secure: true
    });
    
    const result = await client.put('avatars/test.txt', Buffer.from('hello'));
    console.log('Result URL:', result.url);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testOSS();
