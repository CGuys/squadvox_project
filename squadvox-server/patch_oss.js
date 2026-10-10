const fs = require('fs');

const path = 'src/controllers/userController.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = matched[1] === 'jpeg' ? 'jpg' : matched[1];
    const filename = \`avatar_\${req.user.id}_\${Date.now()}.\${ext}\`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);

    // 用请求头里的 host 拼 URL —— 真机走局域网 IP 时也能拿到可访问地址
    const url = \`\${req.protocol}://\${req.headers.host}/uploads/\${filename}\`;`;

const replaceStr = `    const ext = matched[1] === 'jpeg' ? 'jpg' : matched[1];
    const filename = \`avatars/avatar_\${req.user.id}_\${Date.now()}.\${ext}\`;
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
      url = \`\${req.protocol}://\${req.headers.host}/uploads/\${localFilename}\`;
    }`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(path, content, 'utf8');
console.log('OSS config applied to userController.js');
